import { memo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Pencil, ExternalLink, Trophy, Calendar, Sparkles, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import Button from "../common/Button";
import clsx from "clsx";

const WishlistDetail = memo(function WishlistDetail({
  isOpen,
  onClose,
  wishlist,
  onEdit,
  onDelete,
  onAddSavings,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef(null);

  if (!isOpen || !wishlist) return null;

  const {
    id,
    name,
    targetPrice,
    savedAmount,
    priority,
    status,
    imageUrl,
    productLink,
    notes,
    targetDate,
    createdAt,
  } = wishlist;

  const progress = Math.min(Math.round((savedAmount / targetPrice) * 100), 100);
  const isAchieved = status === "ACHIEVED" || progress >= 100;

  const handleClose = () => {
    onClose();
    setConfirmDelete(false);
  };

  const handleDeleteClick = () => {
    onDelete(id);
    handleClose();
  };

  const priorityConfig = {
    LOW: {
      label: "Rendah",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    MEDIUM: {
      label: "Sedang",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    HIGH: {
      label: "Tinggi",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  };

  return createPortal(
    <>
      {/* Overlay Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Sheet / Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <div className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pointer-events-auto">
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)]">
            <button
              onClick={handleClose}
              className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Detail Keinginan
            </h3>
            <div className="absolute right-4 flex gap-2">
              <button
                onClick={() => onEdit(wishlist)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <Pencil className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-6">
            {/* Delete Confirmation Overlay inside Sheet */}
            {confirmDelete ? (
              <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center space-y-4 animate-fade-in">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Hapus Keinginan ini?</h4>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Tindakan ini tidak dapat dibatalkan.</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-xl py-2 px-3 text-xs"
                  >
                    Batal
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeleteClick}
                    className="flex-1 rounded-xl py-2 px-3 text-xs"
                  >
                    Ya, Hapus
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Product Image Banner */}
            <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={clsx(
                  "absolute inset-0 flex flex-col items-center justify-center text-[var(--text-tertiary)] gap-2",
                  imageUrl ? "hidden" : "flex"
                )}
              >
                <Trophy className={clsx("h-16 w-16", isAchieved ? "text-amber-500" : "text-[var(--text-tertiary)]")} />
                {!imageUrl && <span className="text-xs font-semibold text-[var(--text-tertiary)]">Belum ada gambar</span>}
              </div>
            </div>

            {/* Title & Priority */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={clsx(
                    "px-3 py-1 text-xs font-bold rounded-full border",
                    priorityConfig[priority]?.badge
                  )}
                >
                  Prioritas {priorityConfig[priority]?.label}
                </span>
                <span className="text-[11px] text-[var(--text-tertiary)]">
                  Dibuat {formatDate(createdAt)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] leading-snug">
                {name}
              </h2>
            </div>

            {/* Progress Visualization */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-5 border border-[var(--border-color)] space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-2xl font-black text-[var(--text-primary)]">
                    {formatCurrency(savedAmount)}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] ml-1">
                    dari {formatCurrency(targetPrice)}
                  </span>
                </div>
                <div className="text-right">
                  <span className={clsx(
                    "text-sm font-extrabold px-2 py-0.5 rounded-lg",
                    isAchieved ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  )}>
                    {progress}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    isAchieved ? "bg-amber-500" : "bg-indigo-600"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Meta stats */}
              <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  <span>Target: {targetDate ? formatDate(targetDate) : "Kapan saja"}</span>
                </div>
                {!isAchieved && (
                  <span>Kurang {formatCurrency(targetPrice - savedAmount)}</span>
                )}
                {isAchieved && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    Terpenuhi!
                  </span>
                )}
              </div>
            </div>

            {/* Product Link Button if exists */}
            {productLink && (
              <a
                href={productLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all font-semibold text-sm border border-indigo-500/20"
              >
                <span>Lihat Produk</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {/* Notes Section */}
            {notes && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Catatan
                </h4>
                <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
                  {notes}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer (Add Savings) */}
          {!isAchieved && (
            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <Button
                onClick={() => {
                  onClose();
                  onAddSavings(wishlist);
                }}
                className="w-full rounded-xl py-3"
              >
                Menabung untuk Impian Ini
              </Button>
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
});

export default WishlistDetail;
