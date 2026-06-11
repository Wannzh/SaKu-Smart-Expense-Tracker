import { memo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Trash2, Pencil, RefreshCw, Calendar, Coins, ArrowRightLeft, Tag, AlertTriangle, Play } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import Button from "../common/Button";
import clsx from "clsx";

const frequencyMap = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

const RecurringDetail = memo(function RecurringDetail({
  isOpen,
  onClose,
  recurring,
  onEdit,
  onDelete,
  onExecute,
  onToggle,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen || !recurring) return null;

  const {
    id,
    title,
    amount,
    type,
    frequency,
    startDate,
    endDate,
    nextRunDate,
    iconUrl,
    wallet,
    category,
    status,
    createdAt,
  } = recurring;

  const isIncome = type === "INCOME";
  const isActive = status === "ACTIVE";

  const handleClose = useCallback(() => {
    onClose();
    setConfirmDelete(false);
    setIsExecuting(false);
  }, [onClose]);

  const handleDeleteClick = useCallback(() => {
    onDelete(id);
    handleClose();
  }, [id, onDelete, handleClose]);

  const handleExecuteClick = useCallback(async () => {
    if (isExecuting) return;
    try {
      setIsExecuting(true);
      await onExecute(id);
      handleClose();
    } catch (err) {
      console.error(err);
      setIsExecuting(false);
    }
  }, [id, onExecute, handleClose, isExecuting]);

  const handleToggleClick = useCallback(() => {
    onToggle(id);
  }, [id, onToggle]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Detail Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <div className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pointer-events-auto">
          
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)] shrink-0">
            <button
              onClick={handleClose}
              className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Detail Transaksi Berulang
            </h3>
            <div className="absolute right-4 flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(recurring);
                }}
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

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-5">
            {/* Delete Confirmation inside Sheet */}
            {confirmDelete && (
              <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center space-y-4 animate-fade-in">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)]">Hapus Transaksi Berulang?</h4>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">Langkah ini akan menghapus jadwal transaksi berulang ini secara permanen.</p>
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
            )}

            {/* Template Header Card */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-center relative overflow-hidden">
              {/* Type Accent Glow */}
              <div
                className={clsx(
                  "absolute top-0 inset-x-0 h-1.5",
                  isIncome ? "bg-emerald-500" : "bg-rose-500"
                )}
              />

              {/* Icon Container */}
              <div className="relative mb-3">
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={title}
                    className="h-14 w-14 rounded-2xl object-cover border border-[var(--border-color)] bg-[var(--card-bg)] shadow-xs"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={clsx(
                    "h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-xs",
                    iconUrl ? "hidden" : "flex",
                    isIncome
                      ? "text-emerald-500 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  )}
                >
                  <RefreshCw className={clsx("h-7 w-7", isActive && "animate-spin-slow")} />
                </div>
              </div>

              {/* Title & Frequency badge */}
              <h2 className="text-lg font-bold text-[var(--text-primary)] max-w-xs truncate">
                {title}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span
                  className={clsx(
                    "px-2.5 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider border",
                    isIncome
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {frequencyMap[frequency] || frequency}
                </span>
                <span
                  className={clsx(
                    "px-2.5 py-0.5 text-[10px] font-black rounded-lg uppercase tracking-wider border cursor-pointer select-none",
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                      : "bg-[var(--border-color)] border-transparent text-[var(--text-secondary)]"
                  )}
                  onClick={handleToggleClick}
                >
                  {isActive ? "Aktif" : "Non-Aktif"}
                </span>
              </div>

              {/* Amount Display */}
              <div className="mt-4">
                <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                  Nominal Rencana
                </p>
                <p
                  className={clsx(
                    "text-3xl font-black mt-0.5 tabular-nums tracking-tight",
                    isIncome
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-500 dark:text-rose-400"
                  )}
                >
                  {isIncome ? "+" : "-"}{formatCurrency(amount)}
                </p>
              </div>
            </div>

            {/* Specifications List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Detail Penjadwalan
              </h4>
              
              <div className="rounded-2xl border border-[var(--border-color)] divide-y divide-[var(--border-color)] bg-[var(--card-bg)] overflow-hidden">
                {/* Tanggal Mulai */}
                <div className="flex items-center justify-between p-3.5 text-sm">
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-medium">
                    <Calendar className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                    <span>Tanggal Mulai</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatDate(startDate)}
                  </span>
                </div>

                {/* Tanggal Berakhir */}
                <div className="flex items-center justify-between p-3.5 text-sm">
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-medium">
                    <Calendar className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                    <span>Tanggal Selesai</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {endDate ? formatDate(endDate) : "Berjalan Selamanya"}
                  </span>
                </div>

                {/* Tanggal Berikutnya */}
                <div className="flex items-center justify-between p-3.5 text-sm bg-indigo-500/5">
                  <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 font-bold">
                    <RefreshCw className="h-4 w-4 text-indigo-500 shrink-0" />
                    <span>Jadwal Berikutnya</span>
                  </div>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {formatDate(nextRunDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Wallet & Category Associations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Akun & Klasifikasi
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Wallet Info */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-sm">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Coins className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider leading-none mb-0.5">
                        Dompet Bayar
                      </p>
                      <p className="font-bold text-[var(--text-primary)] truncate">
                        {wallet ? wallet.name : "Tanpa Wallet"}
                      </p>
                    </div>
                  </div>
                  {wallet && (
                    <span className="font-bold text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border-color)]">
                      {formatCurrency(wallet.balance)}
                    </span>
                  )}
                </div>

                {/* Category Info */}
                {category && (
                  <div className="flex items-center p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
                        style={{
                          backgroundColor: `${category.color || "#6B7280"}18`,
                          color: category.color || "#6B7280",
                        }}
                      >
                        <Tag className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider leading-none mb-0.5">
                          Kategori
                        </p>
                        <p className="font-bold text-[var(--text-primary)] truncate">
                          {category.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] shrink-0">
            <Button
              onClick={handleExecuteClick}
              disabled={!isActive || isExecuting}
              className="w-full rounded-xl py-3 flex items-center justify-center gap-2 font-bold shadow-md"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Play className="h-4.5 w-4.5 fill-current" />
                  <span>Jalankan Sekarang (Catat Transaksi)</span>
                </>
              )}
            </Button>
            {!isActive && (
              <p className="text-[10px] text-center text-rose-500 font-bold mt-2">
                Aktifkan status terlebih dahulu untuk menjalankan transaksi.
              </p>
            )}
          </div>

        </div>
      </div>
    </>,
    document.body
  );
});

export default RecurringDetail;
