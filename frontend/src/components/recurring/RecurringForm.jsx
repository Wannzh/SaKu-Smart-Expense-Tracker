import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Image as ImageIcon, ChevronDown, Banknote, Building2, Smartphone, Calendar, Delete, Check, Loader2 } from "lucide-react";
import FloatingLabelInput from "../common/FloatingLabelInput";
import WalletPicker from "../transaction/WalletPicker";
import { formatCurrency, formatDate } from "../../utils/format";
import clsx from "clsx";
import dayjs from "dayjs";
import * as LucideIcons from "lucide-react";
import { useCategory } from "../../hooks/useCategory";

const walletIconMap = {
  cash: Banknote,
  bank: Building2,
  ewallet: Smartphone,
};

// ─── Pure React Date Picker Modal ─────────────────────────────────
const DatePickerModal = memo(function DatePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  title = "Pilih Tanggal",
}) {
  const [currentDate, setCurrentDate] = useState(() => dayjs(value || new Date()));
  const [selectedDate, setSelectedDate] = useState(() => value ? dayjs(value) : null);

  useEffect(() => {
    if (isOpen) {
      setCurrentDate(dayjs(value || new Date()));
      setSelectedDate(value ? dayjs(value) : null);
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const daysOfWeek = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"];

  const handlePrevMonth = () => setCurrentDate((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate((prev) => prev.add(1, "month"));

  // Generate calendar grid
  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  let startDay = startOfMonth.day(); // 0 is Sunday, 1 is Monday...
  startDay = startDay === 0 ? 6 : startDay - 1; // align to Monday=0

  const calendarCells = [];
  const prevMonthEnd = startOfMonth.subtract(1, "day");
  // previous month padding days
  for (let i = startDay - 1; i >= 0; i--) {
    calendarCells.push({
      date: prevMonthEnd.subtract(i, "day"),
      isCurrentMonth: false,
    });
  }
  // current month days
  const totalDays = endOfMonth.date();
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({
      date: startOfMonth.date(i),
      isCurrentMonth: true,
    });
  }
  // next month padding days
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      date: endOfMonth.add(i, "day"),
      isCurrentMonth: false,
    });
  }

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(selectedDate.toDate());
      onClose();
    }
  };

  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs animate-fade-in cursor-pointer" />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none animate-fade-in">
        <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-2xl overflow-hidden flex flex-col pointer-events-auto select-none space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
            <button onClick={onClose} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-tertiary)] cursor-pointer"><LucideIcons.X className="h-4.5 w-4.5" /></button>
          </div>
          
          {/* Calendar Header */}
          <div className="flex justify-between items-center px-1">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] cursor-pointer"><LucideIcons.ChevronLeft className="h-4.5 w-4.5" /></button>
            <span className="text-xs font-bold text-[var(--text-primary)]">{monthNames[currentDate.month()]} {currentDate.year()}</span>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] cursor-pointer"><LucideIcons.ChevronRight className="h-4.5 w-4.5" /></button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            {daysOfWeek.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map(({ date, isCurrentMonth }, idx) => {
              const isSelected = selectedDate && selectedDate.isSame(date, "day");
              const isToday = dayjs().isSame(date, "day");
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                    "aspect-square rounded-xl text-xs flex items-center justify-center font-semibold cursor-pointer relative",
                    isCurrentMonth ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] opacity-40",
                    isSelected
                      ? "bg-indigo-600 text-white font-bold"
                      : "hover:bg-[var(--bg-tertiary)]",
                    isToday && !isSelected && "border border-indigo-600/50"
                  )}
                >
                  {date.date()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80 cursor-pointer">Batal</button>
            <button type="button" onClick={handleConfirm} disabled={!selectedDate} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">Pilih</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

// ─── Main RecurringForm Sheet ─────────────────────────────────────
const RecurringForm = memo(function RecurringForm({
  isOpen,
  onClose,
  onSubmit,
  wallets = [],
  recurring = null,
  isLoading = false,
}) {
  const [amount, setAmount] = useState("0");
  const [type, setType] = useState("EXPENSE"); // EXPENSE | INCOME
  const [titleInput, setTitleInput] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [walletId, setWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  
  // Modals status
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);
  const [isEndDatePickerOpen, setIsEndDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  const { categories, getCategories } = useCategory();

  useEffect(() => {
    if (isOpen) {
      getCategories();
    }
  }, [isOpen, getCategories]);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c) => c.type === type);
  }, [categories, type]);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === walletId);
  }, [wallets, walletId]);

  // Load init states
  useEffect(() => {
    if (recurring) {
      setAmount(recurring.amount?.toString() || "0");
      setType(recurring.type || "EXPENSE");
      setTitleInput(recurring.title || "");
      setFrequency(recurring.frequency || "MONTHLY");
      setStartDate(recurring.startDate ? new Date(recurring.startDate) : null);
      setEndDate(recurring.endDate ? new Date(recurring.endDate) : null);
      setWalletId(recurring.walletId || "");
      setCategoryId(recurring.categoryId || "");
      setPreviewUrl(recurring.iconUrl || "");
      setImageFile(null);
    } else {
      setAmount("0");
      setType("EXPENSE");
      setTitleInput("");
      setFrequency("MONTHLY");
      setStartDate(new Date()); // default start date is today
      setEndDate(null);
      setWalletId("");
      setCategoryId("");
      setPreviewUrl("");
      setImageFile(null);
    }
    setErrors({});
  }, [recurring, isOpen]);

  // Revoke blob URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleNumpadPress = useCallback((value) => {
    setAmount((prev) => {
      let current = prev;
      if (value === "delete") {
        current = current.slice(0, -1);
        if (current === "" || current === "-") current = "0";
      } else if (value === "clear") {
        current = "0";
      } else if (value === ".") {
        if (!current.includes(".")) {
          current = current === "" ? "0." : current + ".";
        }
      } else if (value === "000") {
        if (current !== "0" && current !== "") {
          current = current + "000";
        }
      } else {
        if (current === "0" || current === "") {
          current = value;
        } else {
          current = current + value;
        }
      }
      return current;
    });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Ukuran file maksimal 5MB" }));
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const newErrors = {};
    if (!titleInput.trim()) newErrors.title = "Judul wajib diisi";
    if (Number(amount) <= 0) newErrors.amount = "Jumlah harus lebih besar dari 0";
    if (!startDate) newErrors.startDate = "Tanggal mulai wajib diisi";
    if (startDate && endDate && dayjs(endDate).isBefore(dayjs(startDate), "day")) {
      newErrors.endDate = "Tanggal berakhir tidak boleh mendahului tanggal mulai";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append("title", titleInput.trim());
    formData.append("amount", amount);
    formData.append("type", type);
    formData.append("frequency", frequency);
    formData.append("startDate", startDate.toISOString());
    if (endDate) {
      formData.append("endDate", endDate.toISOString());
    }
    if (walletId) {
      formData.append("walletId", walletId);
    }
    if (categoryId) {
      formData.append("categoryId", categoryId);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (previewUrl) {
      formData.append("iconUrl", previewUrl);
    }

    onSubmit(formData);
  };

  const formattedAmount = (() => {
    if (!amount || amount === "0") return "Rp 0";
    const [integer, decimal] = amount.split(".");
    const formattedInteger = Number(integer || 0).toLocaleString("id-ID");
    if (amount.includes(".")) {
      return `Rp ${formattedInteger},${decimal || ""}`;
    }
    return `Rp ${formattedInteger}`;
  })();

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Sheet Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <form
          onSubmit={handleFormSubmit}
          className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[90vh] animate-slide-up pointer-events-auto"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {recurring ? "Ubah Transaksi Berulang" : "Tambah Transaksi Berulang"}
            </h3>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-5">
            {/* 3. Judul */}
            <FloatingLabelInput
              label="Judul"
              name="title"
              value={titleInput}
              onChange={(e) => {
                setTitleInput(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
              }}
              error={errors.title}
              required
            />

            {/* 4. Custom Icon (Optional) */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Ikon Kustom (Opsional)
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-10 w-10 rounded-xl object-cover border border-[var(--border-color)]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Ikon kustom terpilih</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Tap untuk mengganti foto</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center py-4 px-6 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/50 transition-all cursor-pointer select-none text-center gap-1.5"
                >
                  <ImageIcon className="h-6 w-6 text-[var(--text-tertiary)]" />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)]">Pilih Ikon Gambar</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">Tambahkan foto penanda transaksi berulang ini</p>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Frekuensi */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Frekuensi
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all cursor-pointer"
              >
                <option value="DAILY">Harian (Daily)</option>
                <option value="WEEKLY">Mingguan (Weekly)</option>
                <option value="MONTHLY">Bulanan (Monthly)</option>
                <option value="YEARLY">Tahunan (Yearly)</option>
              </select>
            </div>

            {/* Kategori */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Kategori (Opsional)
              </label>
              
              {/* Horizontal scroll pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                {/* Pill "Tidak ada" */}
                <button
                  type="button"
                  onClick={() => setCategoryId("")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold 
                    whitespace-nowrap transition-colors border shrink-0
                    ${!categoryId
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent"
                    }`}
                >
                  Semua
                </button>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold 
                      whitespace-nowrap transition-colors border shrink-0
                      flex items-center gap-1.5
                      ${categoryId === cat.id
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent hover:border-[var(--border-color)]"
                      }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Jika tidak ada kategori tersedia */}
              {filteredCategories.length === 0 && (
                <p className="text-[10px] text-[var(--text-tertiary)] px-1">
                  Tidak ada kategori untuk tipe ini
                </p>
              )}
            </div>

            {/* Date Pickers Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* 6. Tanggal Mulai */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsStartDatePickerOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all"
                >
                  <span className="text-xs text-[var(--text-primary)] font-semibold truncate">
                    {startDate ? formatDate(startDate) : "Pilih Mulai"}
                  </span>
                  <Calendar className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                </button>
                {errors.startDate && <p className="text-[10px] text-red-500">{errors.startDate}</p>}
              </div>

              {/* 7. Tanggal Berakhir (Opsional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider flex justify-between items-center">
                  <span>Tanggal Akhir</span>
                  <span className="text-[8px] opacity-65 lowercase font-normal">Opsional</span>
                </label>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setIsEndDatePickerOpen(true)}
                    className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] pl-4 pr-10 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all"
                  >
                    <span className={clsx("text-xs font-semibold truncate", endDate ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]")}>
                      {endDate ? formatDate(endDate) : "Selamanya"}
                    </span>
                    <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)] shrink-0 pointer-events-none" />
                  </button>
                  {endDate && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEndDate(null);
                      }}
                      className="absolute right-9 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] transition-colors cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {errors.endDate && <p className="text-[10px] text-red-500">{errors.endDate}</p>}
              </div>
            </div>

            {/* 8. Bayar dengan Dompet */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Bayar dengan Dompet (Opsional)
              </label>
              <button
                type="button"
                onClick={() => setIsWalletPickerOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all mt-1"
              >
                {selectedWallet ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                      style={{
                        backgroundColor: `${selectedWallet.color || "#6B7280"}18`,
                        color: selectedWallet.color || "#6B7280",
                      }}
                    >
                      {(() => {
                        const Icon = walletIconMap[selectedWallet.type] || Banknote;
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                    </div>
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {selectedWallet.name} ({formatCurrency(selectedWallet.balance)})
                    </span>
                  </div>
                ) : (
                  <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet...</span>
                )}
                <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              </button>
            </div>
          </div>

          {/* Bottom Display & Inline Numpad section */}
          <div className="shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {/* LARGE AMOUNT DISPLAY */}
            <div className="flex flex-col items-center justify-center py-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)] relative">
              
              {/* Type Switcher Tab */}
              <div className="flex bg-[var(--bg-tertiary)] p-0.5 rounded-lg mb-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setType("EXPENSE")}
                  className={clsx(
                    "px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer",
                    type === "EXPENSE"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-[var(--text-secondary)] bg-transparent hover:text-[var(--text-primary)]"
                  )}
                >
                  Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setType("INCOME")}
                  className={clsx(
                    "px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer",
                    type === "INCOME"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-[var(--text-secondary)] bg-transparent hover:text-[var(--text-primary)]"
                  )}
                >
                  Pemasukan
                </button>
              </div>

              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
                Jumlah Nominal
              </span>
              <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums mt-0.5">
                {formattedAmount}
              </div>
              {errors.amount && (
                <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            {/* NUMPAD GRID */}
            <div className="p-3 bg-[var(--bg-secondary)]">
              <div className="grid grid-cols-4 gap-2 text-center max-w-md mx-auto">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("1")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("2")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("3")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("delete")}
                  className="bg-red-950/10 dark:bg-red-900/20 hover:bg-red-900/30 text-red-500 rounded-xl py-2.5 flex items-center justify-center cursor-pointer transition-transform active:scale-95 font-bold"
                >
                  <Delete className="h-4.5 w-4.5" />
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("4")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("5")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("6")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("clear")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  C
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("7")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("8")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("9")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  9
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("000")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  000
                </button>

                {/* Row 4 */}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95 flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("0")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress(".")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-2.5 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  .
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md font-bold"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Date Pickers Modals */}
      <DatePickerModal
        isOpen={isStartDatePickerOpen}
        onClose={() => setIsStartDatePickerOpen(false)}
        value={startDate}
        onSelect={(date) => {
          setStartDate(date);
          if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: "" }));
        }}
        title="Pilih Tanggal Mulai"
      />

      <DatePickerModal
        isOpen={isEndDatePickerOpen}
        onClose={() => setIsEndDatePickerOpen(false)}
        value={endDate}
        onSelect={(date) => {
          setEndDate(date);
          if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: "" }));
        }}
        title="Pilih Tanggal Berakhir"
      />

      {/* Wallet Picker */}
      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        onSelect={(wallet) => setWalletId(wallet.id)}
        title="Pilih Dompet Pembayaran"
      />
    </>,
    document.body
  );
});

export default RecurringForm;
