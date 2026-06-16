import { memo, useMemo } from "react";
import { Building2, Wallet, Link2, CreditCard, Landmark } from "lucide-react";
import { detectBank, maskCardNumber, EWALLET_PROFILES, maskRekeningNumber, REKENING_PROFILES } from "../../utils/binDetector";
import SmartLogo from "./SmartLogo";

// Tambah prop accountNumber (opsional, untuk realtime preview)
const CardVisual = memo(function CardVisual({ 
  card, 
  isFlipped = false, 
  onFlip,
  accountNumber,
  detectedBank: propDetectedBank
}) {

  // Deteksi bank dari accountNumber realtime ATAU
  // dari card.accountNumber yang sudah tersimpan
  const detectedBank = useMemo(() => {
    if (card?.provider === "REKENING") return null; // BIN detection TIDAK aktif untuk REKENING
    if (propDetectedBank) return propDetectedBank;
    const num = accountNumber || card?.accountNumber || "";
    return detectBank(num);
  }, [propDetectedBank, accountNumber, card?.accountNumber, card?.provider]);

  // Deteksi logo network (Visa/Mastercard/GPN) berdasarkan nomor
  const networkLogo = useMemo(() => {
    if (card?.provider === "REKENING") return null;
    const num = accountNumber || card?.accountNumber || "";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.startsWith("4")) return "VISA";
    if (/^(51|52|53|54|55)/.test(cleaned)) return "MC";
    if (cleaned.startsWith("6")) return "GPN";
    return detectedBank?.networkLogo || null;
  }, [accountNumber, card?.accountNumber, detectedBank, card?.provider]);

  // E-wallet profile lookup
  const ewalletProfile = useMemo(() => {
    if (card?.provider !== "EWALLET") return null;
    return Object.values(EWALLET_PROFILES).find(
      p => p.name === card?.bankName
    ) || null;
  }, [card?.provider, card?.bankName]);

  // Rekening profile lookup
  const rekeningProfile = useMemo(() => {
    if (card?.provider !== "REKENING") return null;
    return Object.values(REKENING_PROFILES).find(
      p => p.name === card?.bankName
    ) || null;
  }, [card?.provider, card?.bankName]);

  // Style kartu — prioritas: rekeningProfile → ewalletProfile → detectedBank → provider → cardColor
  const cardStyle = useMemo(() => {
    if (rekeningProfile?.gradient) {
      return { 
        background: rekeningProfile.gradient,
        transition: "background 0.5s ease"
      };
    }
    if (ewalletProfile?.gradient) { 
      return { 
        background: ewalletProfile.gradient,
        transition: "background 0.5s ease"
      };
    }
    if (detectedBank?.gradient) {
      return { 
        background: detectedBank.gradient,
        transition: "background 0.5s ease"
      };
    }
    if (card?.provider === "BLOCKCHAIN") {
      return { background: "#0F172A" };
    }
    return {
      background: `linear-gradient(135deg, 
        ${card?.cardColor || "#3525cd"}, 
        ${card?.cardColor || "#3525cd"}99)`,
      transition: "background 0.5s ease"
    };
  }, [detectedBank, ewalletProfile, rekeningProfile, card?.cardColor, card?.provider]);

  // Nama yang ditampilkan di kartu
  const displayName = useMemo(() => 
    rekeningProfile?.name ||
    detectedBank?.name || 
    card?.bankName || 
    card?.cardName || 
    "SaKu Card"
  , [rekeningProfile, detectedBank, card]);

  // Nomor yang ditampilkan
  const displayNumber = useMemo(() => {
    const num = accountNumber || card?.accountNumber || "";
    if (num) {
      if (card?.provider === "REKENING") {
        return maskRekeningNumber(num);
      }
      if (card?.provider === "EWALLET") {
        const cleaned = num.replace(/\D/g, "");
        if (cleaned.length >= 8) {
          const first4 = cleaned.substring(0, 4);
          const last4 = cleaned.slice(-4);
          return `${first4} **** ${last4}`;
        }
      }
      return maskCardNumber(num);
    }
    if (card?.provider === "REKENING") {
      return `${card?.lastFourDigits || "••••"} •••• ••••`;
    }
    if (card?.provider === "EWALLET") {
      return `08** **** ${card?.lastFourDigits || "••••"}`;
    }
    return `**** **** **** ${card?.lastFourDigits || "••••"}`;
  }, [accountNumber, card]);

  // Logo yang ditampilkan
  const displayLogo = rekeningProfile?.logo || ewalletProfile?.logo || detectedBank?.logo || null;

  return (
    <div 
      className="card-perspective w-full aspect-[1.58/1] 
        cursor-pointer select-none"
      onClick={onFlip}>
      <div className={`card-flip-inner 
        ${isFlipped ? "is-flipped" : ""}`}>

        {/* ── FRONT ── */}
        <div 
          className="card-face card-pattern p-5 
            flex flex-col justify-between 
            text-white shadow-xl overflow-hidden"
          style={cardStyle}>

          {/* Dot pattern overlay */}
          <div className="absolute inset-0 opacity-10 
            pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)",
              backgroundSize: "20px 20px"
            }} />

          {/* Top row: nama bank + logo */}
          <div className="flex justify-between items-start 
            relative z-10">
            <div>
              <span className="text-[10px] uppercase 
                tracking-widest opacity-80 font-bold block">
                {card?.label || 
                  (card?.provider === "EWALLET" 
                    ? "E-Wallet" 
                    : card?.provider === "REKENING"
                      ? "Rekening"
                      : "Bank Card")}
              </span>
              <span className="text-lg font-bold block mt-0.5">
                {displayName}
              </span>
            </div>

            {/* Logo area */}
            <div className="w-12 h-10 bg-white/15 rounded-xl 
              backdrop-blur-md flex items-center justify-center 
              border border-white/20 overflow-hidden p-1">
              {displayLogo ? (
                <SmartLogo 
                  logo={displayLogo}
                  name={displayName}
                  hasWhiteBg={
                    rekeningProfile?.hasWhiteBg ||
                    ewalletProfile?.hasWhiteBg || 
                    detectedBank?.hasWhiteBg || 
                    false
                  }
                  variant="card"
                />
              ) : (
                // Icon lucide fallback
                <>
                  {card?.provider === "BANK" && 
                    <Building2 className="w-5 h-5 text-white" />}
                  {card?.provider === "EWALLET" && 
                    <Wallet className="w-5 h-5 text-white" />}
                  {card?.provider === "BLOCKCHAIN" && 
                    <Link2 className="w-5 h-5 text-white" />}
                  {card?.provider === "REKENING" && 
                    <Landmark className="w-5 h-5 text-white" />}
                  {(!card?.provider || 
                    card?.provider === "OTHER") && 
                    <CreditCard className="w-5 h-5 text-white" />}
                </>
              )}
            </div>
          </div>

          {/* Chip EMV (tengah kiri) */}
          {card?.provider === "BANK" && (
            <div className="relative z-10 mb-1">
              <div className="w-10 h-8 rounded-md 
                border border-yellow-300/50
                bg-gradient-to-br from-yellow-200/30 
                to-yellow-400/10 backdrop-blur-sm 
                relative overflow-hidden">
                {/* Chip line patterns */}
                <div className="absolute inset-0 
                  grid grid-cols-3 grid-rows-3 gap-px p-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} 
                      className="bg-yellow-300/25 rounded-[1px]" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Card number + holder + expiry */}
          <div className="relative z-10">
            <p className={`font-bold tracking-[0.2em] mb-3 tabular-nums ${
              card?.provider === "REKENING" ? "text-lg" : "text-base"
            }`}>
              {displayNumber}
            </p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] uppercase 
                  opacity-70 mb-0.5">
                  Pemilik Kartu
                </p>
                <p className="text-xs font-semibold 
                  uppercase tracking-wider">
                  {card?.provider === "REKENING" ? "a/n " : ""}{card?.holderName || "NAMA PEMILIK"}
                </p>
              </div>

              {/* Network logo ATAU expiry date */}
              <div className="flex flex-col items-end gap-1">
                {/* Expiry / Verified */}
                {card?.provider === "EWALLET" ? (
                  <div className="bg-white/20 border border-white/30 rounded-md px-2 py-0.5 text-right backdrop-blur-sm select-none">
                    <span className="text-[9px] font-black tracking-widest text-emerald-300 uppercase">
                      ✓ VERIFIED
                    </span>
                  </div>
                ) : card?.provider === "REKENING" ? null : (
                  card?.expiryMonth && card?.expiryYear && (
                    <div className="text-right">
                      <p className="text-[9px] uppercase opacity-70">
                        Valid Thru
                      </p>
                      <p className="text-xs font-semibold tabular-nums">
                        {card.expiryMonth}/
                        {card.expiryYear.slice(-2)}
                      </p>
                    </div>
                  )
                )}
                {/* Network Logo */}
                {networkLogo === "VISA" && (
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg"
                    alt="Visa"
                    className="h-5 object-contain 
                      filter brightness-0 invert opacity-90"
                  />
                )}
                {networkLogo === "MC" && (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg"
                    alt="Mastercard"
                    className="h-6 object-contain opacity-90"
                  />
                )}
                {networkLogo === "GPN" && (
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/8/83/Gerbang_Pembayaran_Nasional_logo.svg"
                    alt="GPN"
                    className="h-5 object-contain 
                      filter brightness-0 invert opacity-90"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Decorative glow */}
          <div className="absolute -right-8 -bottom-8 
            w-32 h-32 bg-white/5 rounded-full blur-2xl 
            pointer-events-none" />
        </div>

        {/* ── BACK ── */}
        <div className="card-face card-face-back 
          flex flex-col justify-start text-white 
          shadow-xl overflow-hidden"
          style={{ background: cardStyle.background }}>
          {/* Magnetic stripe */}
          <div className="w-full h-10 bg-black/60 mt-8" />
          {/* Signature strip */}
          <div className="px-5 mt-4 flex items-center gap-3">
            <div className="flex-1 h-9 
              bg-white/10 rounded 
              flex items-center justify-end px-3">
              <span className="italic text-white/40 
                text-[10px]">
                Authorized Signature
              </span>
            </div>
            <div className="w-14 h-9 bg-white/20 
              text-white flex items-center justify-center 
              font-bold rounded text-xs backdrop-blur-sm">
              ***
            </div>
          </div>
          {/* Bottom info */}
          <div className="px-5 mt-auto mb-5 
            flex justify-between items-end">
            <p className="text-[9px] opacity-30 
              leading-tight max-w-[65%]">
              Kartu ini adalah referensi pribadi di SaKu. 
              Informasi bersifat rahasia.
            </p>
            {/* Contactless icon */}
            <div className="w-6 h-6 border-2 
              border-white/20 rounded-full 
              flex items-center justify-center">
              <div className="w-3 h-3 border-2 
                border-white/20 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
});

export default CardVisual;
