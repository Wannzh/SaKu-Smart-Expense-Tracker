import { memo, useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Building2, Wallet, Link2, CreditCard, LayoutGrid, 
  ArrowLeft, Check, Eye, EyeOff, Pin, Loader2, X, Landmark
} from "lucide-react";
import FloatingLabelInput from "../common/FloatingLabelInput";
import CardVisual from "./CardVisual";
import toast from "react-hot-toast";
import { formatCardNumber, EWALLET_PROFILES, validateEwalletNumber, REKENING_PROFILES, formatRekeningNumber } from "../../utils/binDetector";
import { useBINLookup } from "../../hooks/useBINLookup";
import SmartLogo from "./SmartLogo";

const CARD_COLORS = [
  "#3525cd", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#1F2937", "#06B6D4"
];

const PROVIDERS = [
  { value: "BANK", label: "Bank", icon: Building2 },
  { value: "REKENING", label: "Rekening", icon: Landmark },
  { value: "EWALLET", label: "E-Wallet", icon: Wallet },
  { value: "BLOCKCHAIN", label: "Kripto", icon: Link2 },
  { value: "OTHER", label: "Lainnya", icon: LayoutGrid },
];

const EwalletPicker = memo(function EwalletPicker({ 
  selected, onSelect 
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(EWALLET_PROFILES).map(
        ([key, profile]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key, profile)}
          className={`flex flex-col items-center 
            gap-2 p-3 rounded-xl border transition-all cursor-pointer
            ${selected === key
              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30"
              : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
            }`}>
          {profile.logo ? (
            <SmartLogo
              logo={profile.logo}
              name={profile.name}
              hasWhiteBg={profile.hasWhiteBg}
              variant="picker"
            />
          ) : (
            <span className="text-2xl">
              {profile.logoFallback || "💳"}
            </span>
          )}
          <span className="text-[10px] font-semibold 
            text-[var(--text-primary)]">
            {profile.name}
          </span>
        </button>
      ))}
    </div>
  );
});

const RekeningBankPicker = memo(function RekeningBankPicker({ 
  selected, onSelect 
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Object.entries(REKENING_PROFILES).map(
        ([key, profile]) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key, profile)}
          className={`flex flex-col items-center 
            gap-2 p-3 rounded-xl border transition-all cursor-pointer
            ${selected === key
              ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30"
              : "border-[var(--border-color)] bg-[var(--bg-secondary)]"
            }`}>
          {profile.logo ? (
            <SmartLogo
              logo={profile.logo}
              name={profile.name}
              hasWhiteBg={profile.hasWhiteBg}
              variant="picker"
            />
          ) : (
            <span className="text-2xl">
              🏦
            </span>
          )}
          <span className="text-[10px] font-semibold 
            text-[var(--text-primary)] whitespace-nowrap overflow-hidden text-ellipsis w-full">
            {profile.name}
          </span>
        </button>
      ))}
    </div>
  );
});

const CardForm = memo(function CardForm({ 
  initialData = null, onSubmit, onClose, isLoading = false 
}) {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    cardName: "",
    bankName: "",
    holderName: "",
    accountNumber: "",
    lastFourDigits: "0000",
    expiryMonth: "",
    expiryYear: "",
    label: "",
    branch: "",
    provider: "BANK",
    type: "PERSONAL",
    category: "MAIN",
    cardColor: "#3525cd",
    pinToTop: false,
    ...initialData,
  });

  const [isFlipped, setIsFlipped] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
 
  const [selectedEwallet, setSelectedEwallet] = useState(() => {
    if (initialData?.provider === "EWALLET" && initialData?.bankName) {
      const found = Object.entries(EWALLET_PROFILES).find(
        ([_, p]) => p.name.toLowerCase() === initialData.bankName.toLowerCase()
      );
      return found ? found[0] : "";
    }
    return "";
  });

  const [selectedRekeningBank, setSelectedRekeningBank] = useState(() => {
    if (initialData?.provider === "REKENING" && initialData?.bankName) {
      const found = Object.entries(REKENING_PROFILES).find(
        ([_, p]) => p.name.toLowerCase() === initialData.bankName.toLowerCase()
      );
      return found ? found[0] : "";
    }
    return "";
  });

  const [phoneError, setPhoneError] = useState(null);

  // Hook untuk lookup data BIN
  const { isLoading: isLookingUp, detectedBank: onlineDetectedBank } = useBINLookup(
    formData.provider === "BANK" ? formData.accountNumber : ""
  );

  const lastDetectedBankRef = useRef(null);

  // Efek untuk mengisi data nama bank otomatis ketika terdeteksi
  useEffect(() => {
    if (formData.provider === "BANK" && onlineDetectedBank) {
      const isNew = !lastDetectedBankRef.current || lastDetectedBankRef.current.name !== onlineDetectedBank.name;
      if (isNew) {
        lastDetectedBankRef.current = onlineDetectedBank;
        setFormData(prev => ({
          ...prev,
          bankName: onlineDetectedBank.name,
          cardName: onlineDetectedBank.cardName,
        }));
        toast.success(`${onlineDetectedBank.name} terdeteksi! ✓`, { duration: 2000 });
      }
    } else if (!onlineDetectedBank) {
      lastDetectedBankRef.current = null;
    }
  }, [onlineDetectedBank, formData.provider]);
 
  const handleTextChange = useCallback((field, val) => {
    setFormData(p => ({ ...p, [field]: val }));
  }, []);
 
  const handleHolderNameChange = useCallback((val) => {
    setFormData(p => ({ ...p, holderName: val.toUpperCase() }));
  }, []);
 
  const handleAccountNumberChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatCardNumber(raw);
 
    setFormData(prev => ({
      ...prev,
      accountNumber: formatted,
      lastFourDigits: raw.slice(-4).padStart(4, "0"),
    }));
  }, []);
 
  const handleEwalletSelect = useCallback((key, profile) => {
    setSelectedEwallet(key);
    setFormData(prev => ({
      ...prev,
      bankName: profile.name,
      cardName: profile.cardName,
      provider: "EWALLET",
      // cardColor tetap dari pilihan user
    }));
    // Toast konfirmasi
    toast.success(`${profile.name} dipilih!`, 
      { duration: 1500 });
  }, []);
 
  const handleRekeningBankSelect = useCallback((key, profile) => {
    setSelectedRekeningBank(key);
    setFormData(prev => ({
      ...prev,
      bankName: profile.name,
      cardName: profile.name,
      provider: "REKENING",
    }));
    toast.success(`${profile.name} dipilih!`, { duration: 1500 });
  }, []);

  const handleRekeningNumberChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const formatted = formatRekeningNumber(raw);
 
    setFormData(prev => ({
      ...prev,
      accountNumber: formatted,
      lastFourDigits: raw.slice(-4).padStart(4, "0"),
    }));
  }, []);

  const handlePhoneNumberChange = useCallback((e) => {
    const raw = e.target.value.replace(/\D/g, "");
    const { isValid, formatted, message } = 
      validateEwalletNumber(raw);
    
    setFormData(prev => ({
      ...prev,
      accountNumber: formatted,
      lastFourDigits: raw.slice(-4).padStart(4, "0"),
    }));
 
    // Tampilkan error jika format tidak valid
    // dan sudah cukup panjang
    if (raw.length > 9 && !isValid) {
      setPhoneError(message);
    } else {
      setPhoneError(null);
    }
  }, []);

  const handleChipClick = useCallback((name) => {
    setFormData(p => ({
      ...p,
      bankName: name,
      cardName: name
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (formData.provider === "EWALLET") {
      if (!selectedEwallet) {
        toast.error("Pilih provider E-Wallet terlebih dahulu");
        return;
      }
      const rawPhone = formData.accountNumber.replace(/\D/g, "");
      const { isValid, message } = validateEwalletNumber(rawPhone);
      if (!isValid) {
        toast.error(message || "Nomor HP E-Wallet tidak valid");
        return;
      }
    } else if (formData.provider === "REKENING") {
      if (!selectedRekeningBank) {
        toast.error("Pilih bank untuk rekening terlebih dahulu");
        return;
      }
      const rawNumber = formData.accountNumber.replace(/\D/g, "");
      if (rawNumber.length < 6) {
        toast.error("Nomor rekening minimal 6 digit");
        return;
      }
    } else {
      if (!formData.cardName && !formData.bankName) {
        toast.error("Nama bank/wallet wajib diisi");
        return;
      }
    }
    if (!formData.holderName) {
      toast.error("Nama pemegang wajib diisi");
      return;
    }
    if (!formData.lastFourDigits || formData.lastFourDigits === "0000") {
      toast.error("Nomor akun wajib diisi");
      return;
    }
    onSubmit(formData);
  }, [formData, onSubmit, selectedEwallet, selectedRekeningBank]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer animate-fade-slide-up"
      />
      {/* Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <form
          onSubmit={handleSubmit}
          className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col h-[95vh] lg:h-auto lg:max-h-[90vh] animate-slide-up pointer-events-auto"
        >
          {/* Header */}
          <header className="px-4 py-4 flex justify-between items-center border-b border-[var(--border-color)]">
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={onClose}
                className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg text-indigo-600 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-indigo-600">
                {isEdit ? "Edit Kartu" : "Tambah Kartu"}
              </h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </header>

          {/* Form Scroll Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 text-left">
            {/* Live 3D Card Preview */}
            <section className="flex flex-col items-center gap-3 py-6 bg-[var(--bg-secondary)]">
              <div className="w-[320px]">
                <CardVisual 
                  card={formData}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(f => !f)}
                  accountNumber={formData.accountNumber}
                  detectedBank={onlineDetectedBank}
                />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] italic">
                Ketuk kartu untuk melihat bagian belakang
              </p>
            </section>

            <div className="p-4 space-y-6">
              {/* 1. Warna Kartu */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Warna Kartu
                </label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {CARD_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, cardColor: color }))}
                      className={`w-10 h-10 rounded-full shrink-0 transition-all active:scale-90 flex items-center justify-center cursor-pointer`}
                      style={{ backgroundColor: color }}
                    >
                      {formData.cardColor === color && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Tipe Provider */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Penyedia (Provider)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PROVIDERS.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setFormData(p => ({ 
                          ...p, 
                          provider: value,
                          ...(value !== p.provider && {
                            bankName: "",
                            cardName: "",
                            accountNumber: "",
                            lastFourDigits: "0000",
                          })
                        }));
                        if (value !== "EWALLET") {
                          setSelectedEwallet("");
                          setPhoneError(null);
                        }
                        if (value !== "REKENING") {
                          setSelectedRekeningBank("");
                        }
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-95 cursor-pointer
                        ${formData.provider === value
                          ? "bg-indigo-50 border-indigo-600 text-indigo-600 dark:bg-indigo-950/30"
                          : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-indigo-400"
                        }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Nama Bank / Wallet */}
              {formData.provider === "EWALLET" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Pilih Provider E-Wallet
                  </label>
                  <EwalletPicker 
                    selected={selectedEwallet}
                    onSelect={handleEwalletSelect}
                  />
                </div>
              ) : formData.provider === "REKENING" ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                    Pilih Bank Rekening
                  </label>
                  <RekeningBankPicker 
                    selected={selectedRekeningBank}
                    onSelect={handleRekeningBankSelect}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <FloatingLabelInput
                    label="Nama Bank / Wallet"
                    hint="cth. Bank Mandiri, GoPay, Dana"
                    value={formData.bankName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(p => ({
                        ...p,
                        bankName: val,
                        cardName: val
                      }));
                    }}
                  />
                  
                  {/* Quick Chips */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {["Mandiri", "BCA", "BNI", "BRI", "MetaMask"].map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleChipClick(name)}
                        className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-indigo-100 hover:text-indigo-700 whitespace-nowrap transition-colors cursor-pointer"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Nomor Akun / Kartu */}
              <div className="space-y-2">
                <div className="relative">
                  {formData.provider === "EWALLET" ? (
                    <FloatingLabelInput
                      label="Nomor HP E-Wallet"
                      hint="cth. 0812 3456 7890"
                      value={formData.accountNumber}
                      onChange={handlePhoneNumberChange}
                      inputMode="numeric"
                      type={showAccount ? "text" : "password"}
                    />
                  ) : formData.provider === "REKENING" ? (
                    <FloatingLabelInput
                      label="Nomor Rekening"
                      hint="cth. 1234567890"
                      value={formData.accountNumber}
                      onChange={handleRekeningNumberChange}
                      inputMode="numeric"
                      type={showAccount ? "text" : "password"}
                    />
                  ) : (
                    <FloatingLabelInput
                      label="Nomor Akun / Kartu"
                      hint="cth. 1234567890"
                      value={formData.accountNumber}
                      onChange={handleAccountNumberChange}
                      inputMode="numeric"
                      type={showAccount ? "text" : "password"}
                    />
                  )}
                  {formData.provider === "BANK" && isLookingUp && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    </div>
                  )}
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--bg-tertiary)] rounded-full text-[var(--text-tertiary)] cursor-pointer"
                    onClick={() => setShowAccount(s => !s)}
                  >
                    {showAccount 
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                </div>
                {formData.provider === "EWALLET" && phoneError && (
                  <p className="text-xs text-red-500 mt-1">
                    {phoneError}
                  </p>
                )}
                {formData.provider === "BANK" && onlineDetectedBank && (
                  <div className="flex items-center gap-2 mt-1 px-2 py-1 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                    {onlineDetectedBank.logo ? (
                      <img 
                        src={onlineDetectedBank.logo} 
                        alt={onlineDetectedBank.name} 
                        className="h-3.5 object-contain"
                      />
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                    <span>Terdeteksi: {onlineDetectedBank.name}</span>
                  </div>
                )}
              </div>

              {/* 5. Nama Pemegang */}
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Nama Pemilik"
                  hint="cth. ALWAN FDH"
                  value={formData.holderName}
                  onChange={(e) => handleHolderNameChange(e.target.value)}
                />
              </div>

              {/* 6. Label */}
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Label (Opsional)"
                  hint="cth. Tabungan Utama"
                  value={formData.label}
                  onChange={(e) => handleTextChange("label", e.target.value)}
                />
              </div>

              {/* 7. Expiry (BANK only) */}
              {formData.provider === "BANK" && (
                <div className="grid grid-cols-2 gap-3">
                  <FloatingLabelInput 
                    label="Bulan (MM)" 
                    hint="cth. 08"
                    maxLength={2} 
                    inputMode="numeric"
                    value={formData.expiryMonth}
                    onChange={e => handleTextChange("expiryMonth", e.target.value)}
                  />
                  <FloatingLabelInput 
                    label="Tahun (YY)" 
                    hint="cth. 28"
                    maxLength={2} 
                    inputMode="numeric"
                    value={formData.expiryYear}
                    onChange={e => handleTextChange("expiryYear", e.target.value)}
                  />
                </div>
              )}

              {/* 8. Cabang */}
              <div className="space-y-2">
                <FloatingLabelInput
                  label="Cabang (Opsional)"
                  hint="cth. Bandung Merdeka"
                  value={formData.branch}
                  onChange={(e) => handleTextChange("branch", e.target.value)}
                />
              </div>

              {/* 9. Tipe */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Tipe Penggunaan
                </label>
                <div className="flex gap-3">
                  {["PERSONAL", "BUSINESS"].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, type: t }))}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border
                        ${formData.type === t
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/15"
                          : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-indigo-400"
                        }`}
                    >
                      {t === "PERSONAL" ? "Personal" : "Bisnis"}
                    </button>
                  ))}
                </div>
              </div>

              {/* 10. Kategori */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                  Kategori
                </label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[
                    { value: "MAIN", label: "Utama" },
                    { value: "BACKUP", label: "Cadangan" },
                    { value: "FREELANCE", label: "Freelance" },
                    { value: "BUSINESS", label: "Bisnis" },
                    { value: "OTHER", label: "Lainnya" }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, category: value }))}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border cursor-pointer
                        ${formData.category === value
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-color)]"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 11. Sematkan di Atas */}
              <div className="flex justify-between items-center p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]/60">
                <div className="flex items-center gap-3">
                  <Pin className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm text-[var(--text-primary)]">
                      Sematkan di Atas
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      Tampilkan kartu ini di bagian atas
                    </p>
                  </div>
                </div>
                
                {/* Toggle switch */}
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, pinToTop: !p.pinToTop }))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer focus:outline-none shrink-0
                    ${formData.pinToTop 
                      ? "bg-indigo-600" 
                      : "bg-gray-300 dark:bg-gray-600"
                    }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                    ${formData.pinToTop 
                      ? "translate-x-5" 
                      : "translate-x-0.5"
                    }`} 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Fixed */}
          <footer className="sticky bottom-0 p-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-t border-[var(--border-color)]/60">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {isEdit ? "Simpan Perubahan" : "Simpan Kartu"}
            </button>
          </footer>
        </form>
      </div>
    </>,
    document.body
  );
});

export default CardForm;
