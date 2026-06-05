import { memo, useState, useRef } from "react";
import { X, Trash2, Pencil, AlertTriangle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { formatCurrency } from "../../utils/format";
import dayjs from "dayjs";
import clsx from "clsx";

// Format jam — gunakan toDate() untuk convert ke local time
const formatTime = (dateString) => {
  return dayjs(dateString).format("HH:mm");
};

// Format tanggal
const formatDateLong = (dateString) => {
  return dayjs(dateString).locale("id").format("DD MMMM YYYY");
};

const TransactionDetail = memo(function TransactionDetail({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef(null);

  if (!isOpen || !transaction) return null;

  const isTransfer = transaction.type === "TRANSFER";
  const isIncome = transaction.type === "INCOME";
  const IconComponent = isTransfer
    ? LucideIcons.ArrowLeftRight
    : LucideIcons[transaction.category?.icon] || (isIncome ? LucideIcons.TrendingUp : LucideIcons.TrendingDown);
  const catColor = isTransfer
    ? "#6366F1"
    : transaction.category?.color || (isIncome ? "#10B981" : "#EF4444");

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
      setConfirmDelete(false);
    }
  };

  const handleClose = () => {
    onClose();
    setConfirmDelete(false);
  };

  const handleDeleteClick = () => {
    onDelete(transaction.id);
    handleClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl overflow-hidden transition-all duration-300 transform translate-y-0 max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)]">
          <button
            onClick={handleClose}
            className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            Detail Transaksi
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-6">
          {/* Main Visual Indicator */}
          <div className="text-center py-2">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-3"
              style={{
                backgroundColor: `${catColor}1c`,
                color: catColor,
              }}
            >
              <IconComponent className="h-8 w-8" />
            </div>
            <p
              className={clsx(
                "text-2xl font-bold tabular-nums",
                isTransfer
                  ? "text-[var(--text-secondary)]"
                  : isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-bold tracking-wider mt-0.5 uppercase">
              IDR
            </p>
            <span
              className={clsx(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-2",
                isTransfer
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  : isIncome
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
              )}
            >
              {isTransfer ? "Transfer" : isIncome ? "Pemasukan" : "Pengeluaran"}
            </span>
          </div>

          {/* Details Table */}
          <div className="border-t border-[var(--border-color)]">
            {isTransfer ? (
              <>
                {/* Row 1: Deskripsi */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Deskripsi</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right truncate max-w-[65%]">
                    {transaction.description || "-"}
                  </span>
                </div>

                {/* Row 2: Dompet */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Dompet</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {transaction.fromWallet?.name || "-"} → {transaction.toWallet?.name || "-"}
                  </span>
                </div>

                {/* Row 3: Tanggal */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Tanggal</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {formatDateLong(transaction.date)}
                  </span>
                </div>

                {/* Row 4: Jam */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Jam</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {formatTime(transaction.createdAt)}
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* Row 1: Judul */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Judul</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right truncate max-w-[65%]">
                    {transaction.description || "-"}
                  </span>
                </div>

                {/* Row 2: Kategori */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Kategori</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {transaction.category?.name || "-"}
                    {transaction.subCategory && (
                      <span className="text-[var(--text-secondary)] font-normal">
                        {" · "}{transaction.subCategory.name}
                      </span>
                    )}
                  </span>
                </div>

                {/* Row 3: Dompet */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Dompet</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {transaction.wallet?.name || "-"}
                  </span>
                </div>

                {/* Row 4: Tanggal */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Tanggal</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {formatDateLong(transaction.date)}
                  </span>
                </div>

                {/* Row 5: Jam */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Jam</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {formatTime(transaction.createdAt)}
                  </span>
                </div>

                {/* Row 6: Catatan */}
                <div className="flex justify-between items-center py-3.5 border-b border-[var(--border-color)]">
                  <span className="text-xs text-[var(--text-secondary)]">Catatan</span>
                  <span className="text-xs font-semibold text-[var(--text-primary)] text-right">
                    {transaction.notes || "-"}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
          {confirmDelete ? (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-red-500 justify-center mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-bold">Hapus transaksi ini permanen?</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-3 rounded-2xl font-semibold text-xs border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer bg-white dark:bg-[var(--card-bg)]"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="flex-1 py-3 rounded-2xl font-semibold text-xs bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-bold text-xs bg-red-500/10 dark:bg-red-500/20 text-red-500 hover:bg-red-500/20 dark:hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </button>
              {!isTransfer && (
                <button
                  onClick={() => {
                    onEdit(transaction);
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl font-bold text-xs bg-[var(--bg-tertiary)] hover:bg-[var(--bg-tertiary)]/80 text-[var(--text-primary)] transition-colors border border-[var(--border-color)] cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                  Ubah
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out both; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
});

export default TransactionDetail;
