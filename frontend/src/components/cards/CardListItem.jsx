import { memo, useCallback, useMemo } from "react";
import { Building2, Wallet, Link2, CreditCard, Copy, Pin, Landmark } from "lucide-react";
import { detectBank, REKENING_PROFILES } from "../../utils/binDetector";

const CardListItem = memo(function CardListItem({ 
  card, onTap, onCopy 
}) {
  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    onCopy(card);
  }, [card, onCopy]);

  const detectedBank = useMemo(() => 
    card.provider === "REKENING" ? null : detectBank(card.accountNumber || "")
  , [card.accountNumber, card.provider]);

  const rekeningProfile = useMemo(() => {
    if (card.provider !== "REKENING") return null;
    return Object.values(REKENING_PROFILES).find(
      p => p.name === card.bankName
    ) || null;
  }, [card.provider, card.bankName]);

  const itemStyle = useMemo(() => {
    const profile = rekeningProfile || detectedBank;
    return {
      background: profile?.gradient ? profile.gradient : `${card.cardColor}20`,
      color: profile?.gradient ? "#FFFFFF" : card.cardColor
    };
  }, [rekeningProfile, detectedBank, card.cardColor]);

  return (
    <div 
      className="bg-[var(--bg-secondary)] border 
        border-[var(--border-color)] rounded-2xl p-4 
        flex items-center justify-between 
        active:bg-[var(--bg-tertiary)] transition-all 
        cursor-pointer"
      onClick={() => onTap(card)}>

      {/* Left */}
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-xl 
            flex items-center justify-center shrink-0"
          style={itemStyle}>
          {/* Logo bank jika terdeteksi */}
          {(rekeningProfile?.logo || detectedBank?.logo) ? (
            <img 
              src={rekeningProfile?.logo || detectedBank.logo}
              alt={rekeningProfile?.name || detectedBank.name}
              className="w-7 h-7 object-contain 
                filter brightness-0 invert"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <>
              {card.provider === "BANK" && 
                <Building2 className="w-5 h-5" />}
              {card.provider === "EWALLET" && 
                <Wallet className="w-5 h-5" />}
              {card.provider === "BLOCKCHAIN" && 
                <Link2 className="w-5 h-5" />}
              {card.provider === "REKENING" && 
                <Landmark className="w-5 h-5" />}
              {card.provider === "OTHER" && 
                <CreditCard className="w-5 h-5" />}
            </>
          )}
        </div>
        <div className="text-left min-w-0">
          <p className="font-bold text-sm truncate
            text-[var(--text-primary)]">
            {card.cardName}
          </p>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            {card.bankName}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div 
          className="flex items-center gap-1 text-indigo-600 
            cursor-pointer hover:bg-indigo-50 
            dark:hover:bg-indigo-950 p-1 rounded-md 
            transition-colors"
          onClick={handleCopy}>
          <span className="text-sm font-bold tabular-nums">
            {card.provider === "REKENING" ? `Rek: ...${card.lastFourDigits}` : `...${card.lastFourDigits}`}
          </span>
          <Copy className="w-3.5 h-3.5" />
        </div>
        {/* Category Badge */}
        <CategoryBadge category={card.category} />
        {/* Pin indicator */}
        {card.pinToTop && (
          <Pin className="w-3 h-3 text-indigo-600" />
        )}
      </div>
    </div>
  );
});

// CategoryBadge dalam file yang sama
const CATEGORY_CONFIG = {
  MAIN:      { label: "Utama",    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  BACKUP:    { label: "Cadangan", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  FREELANCE: { label: "Freelance",className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  BUSINESS:  { label: "Bisnis",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  OTHER:     { label: "Lainnya",  className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

export const CategoryBadge = memo(function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 
      rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
});

export default CardListItem;
