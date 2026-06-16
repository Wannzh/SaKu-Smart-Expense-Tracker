import { memo, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, Copy, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import CardVisual from "./CardVisual";

const Divider = () => (
  <div className="h-px bg-[var(--border-color)]/60" />
);

const InfoRow = memo(function InfoRow({ label, value, bold = false }) {
  return (
    <div className="flex flex-col gap-1 text-left">
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">
        {label}
      </span>
      <span className={`text-sm text-[var(--text-primary)] ${bold ? "font-bold" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
});

const CATEGORY_CONFIG = {
  MAIN:      { label: "Utama",    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  BACKUP:    { label: "Cadangan", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  FREELANCE: { label: "Freelance",className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  BUSINESS:  { label: "Bisnis",   className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  OTHER:     { label: "Lainnya",  className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const CategoryBadge = memo(function CategoryBadge({ category }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
});

const InfoItem = memo(function InfoItem({ label, value, type }) {
  const badgeClass = useMemo(() => {
    if (type === "badge-amber") {
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    }
    if (type === "badge-indigo") {
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    }
    return "text-[var(--text-primary)]";
  }, [type]);

  const displayValue = useMemo(() => {
    if (value === "BANK") return "Bank";
    if (value === "REKENING") return "Rekening";
    if (value === "EWALLET") return "E-Wallet";
    if (value === "BLOCKCHAIN") return "Kripto";
    if (value === "OTHER") return "Lainnya";
    if (value === "PERSONAL") return "Personal";
    if (value === "BUSINESS") return "Bisnis";
    return value;
  }, [value]);

  return (
    <div className="flex flex-col gap-1 text-left">
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">
        {label}
      </span>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
        {displayValue}
      </span>
    </div>
  );
});

const CardDetail = memo(function CardDetail({ 
  card, onClose, onEdit, onDelete, onCopy 
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const numberLabel = useMemo(() => {
    if (card.provider === "EWALLET") return "Nomor HP E-Wallet";
    if (card.provider === "BLOCKCHAIN") return "Alamat Dompet";
    if (card.provider === "REKENING") return "Nomor Rekening";
    return "Nomor Kartu";
  }, [card.provider]);

  const displayNumber = useMemo(() => {
    if (showFullNumber) return card.accountNumber;
    if (card.provider === "REKENING") {
      return `•••• •••• ${card.lastFourDigits}`;
    }
    if (card.provider === "EWALLET") {
      return `08** **** ${card.lastFourDigits}`;
    }
    return `**** **** **** ${card.lastFourDigits}`;
  }, [showFullNumber, card]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer animate-fade-slide-up"
      />
      {/* Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <div className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[90vh] animate-slide-up pointer-events-auto">
          
          {/* Handle bar */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-12 h-1.5 bg-[var(--border-color)]/60 rounded-full" />
          </div>

          {/* Header */}
          <header className="px-4 py-2 flex justify-between items-center shrink-0 border-b border-[var(--border-color)]/30">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">
              Detail Kartu
            </h1>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
            {/* Card Preview */}
            <section className="px-4 mb-6 flex flex-col items-center">
              <div className="w-[320px]">
                <CardVisual 
                  card={card}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(f => !f)}
                  accountNumber={card.accountNumber}
                />
              </div>
              <div className="flex justify-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsFlipped(f => !f)}
                  className="flex items-center gap-2 bg-[var(--bg-secondary)] px-6 py-2.5 rounded-full border border-[var(--border-color)]/60 hover:bg-[var(--bg-tertiary)] transition-all active:scale-95 cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <span>Putar Kartu</span>
                </button>
              </div>
            </section>

            {/* Card Info Details */}
            <section className="px-4 mb-6">
              <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]/60 p-5 space-y-4">
                {/* Provider & Tipe */}
                <div className="flex justify-between items-center">
                  <InfoItem label="Provider" value={card.provider} type="badge-amber" />
                  <InfoItem label="Tipe" value={card.type} type="badge-indigo" />
                </div>
                <Divider />
                
                {/* Account Number dengan reveal */}
                <div 
                  className="flex justify-between items-center cursor-pointer group"
                  onClick={() => setShowFullNumber(s => !s)}
                >
                  <div className="text-left">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold block">
                      {numberLabel}
                    </span>
                    <span className="font-bold tabular-nums text-[var(--text-primary)] tracking-wider text-sm mt-0.5 block">
                      {displayNumber}
                    </span>
                  </div>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]/40 transition-colors cursor-pointer shrink-0">
                    {showFullNumber 
                      ? <EyeOff className="w-4 h-4 text-[var(--text-secondary)]" />
                      : <Eye className="w-4 h-4 text-[var(--text-secondary)]" />
                    }
                  </button>
                </div>
                <Divider />
                
                {/* Holder Name */}
                <InfoRow label="Nama Pemilik" value={card.holderName} bold />
                
                {/* Expiry jika ada */}
                {card.provider !== "REKENING" && card.expiryMonth && card.expiryYear && (
                  <>
                    <Divider />
                    <div className="flex justify-between items-center">
                      <InfoRow label="Masa Berlaku" value={`${card.expiryMonth} / 20${card.expiryYear}`} />
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-md uppercase dark:bg-emerald-950/30 dark:text-emerald-400">
                        Aktif
                      </span>
                    </div>
                  </>
                )}
                
                {/* Branch jika ada */}
                {card.branch && (
                  <>
                    <Divider />
                    <InfoRow label="Cabang" value={card.branch} />
                  </>
                )}
                
                {/* Label jika ada */}
                {card.label && (
                  <>
                    <Divider />
                    <InfoRow label="Label" value={card.label} />
                  </>
                )}
                
                {/* Kategori */}
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-semibold">
                    Kategori
                  </span>
                  <CategoryBadge category={card.category} />
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <footer className="sticky bottom-0 p-4 bg-[var(--bg-primary)]/80 backdrop-blur-md border-t border-[var(--border-color)]/60 space-y-3 shrink-0">
            {/* Copy + Edit */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onCopy(card)}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all active:scale-95 cursor-pointer"
              >
                <Copy className="w-5 h-5" />
                <span className="text-sm font-semibold">Salin Nomor</span>
              </button>
              <button 
                onClick={() => onEdit(card)}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
              >
                <Pencil className="w-5 h-5" />
                <span className="text-sm font-semibold">Edit</span>
              </button>
            </div>
            
            {/* Hapus */}
            {!showDeleteConfirm ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-500 dark:bg-red-950/30 hover:bg-red-100 transition-all active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-sm font-semibold">Hapus Kartu</span>
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  onClick={() => onDelete(card.id)}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            )}
          </footer>

        </div>
      </div>
    </>,
    document.body
  );
});

export default CardDetail;
