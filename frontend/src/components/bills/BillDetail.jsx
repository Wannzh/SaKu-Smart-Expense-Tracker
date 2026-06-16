import { memo, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Wallet, Tag, Info, AlertTriangle, CheckCircle, RefreshCw, ChevronRight, Edit2, Trash2, Undo2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "../../utils/format";
import clsx from "clsx";

const BillDetail = memo(function BillDetail({
  bill,
  onClose,
  onEdit,
  onPay,
  onUnpay,
  onDelete,
}) {
  const navigate = useNavigate();

  const statusConfig = useMemo(() => {
    switch (bill.status) {
      case "OVERDUE":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-200 dark:border-red-900/40",
          label: "Terlambat",
          icon: AlertTriangle,
        };
      case "UNPAID":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/20",
          text: "text-indigo-600 dark:text-indigo-400",
          border: "border-indigo-200 dark:border-indigo-900/40",
          label: "Belum Bayar",
          icon: Info,
        };
      case "PAID":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-900/40",
          label: "Lunas",
          icon: CheckCircle,
        };
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-900/20",
          text: "text-slate-600 dark:text-slate-400",
          border: "border-slate-200 dark:border-slate-900/40",
          label: "Unknown",
          icon: Info,
        };
    }
  }, [bill.status]);

  const CategoryIcon = LucideIcons[bill.category?.icon] || Tag;

  const dueLabel = useMemo(() => {
    const dueDate = dayjs(bill.dueDate);
    const dateFormatted = dueDate.locale("id").format("D MMMM YYYY");
    
    if (bill.status === "OVERDUE") {
      const daysOverdue = dayjs().diff(dueDate, "day");
      return (
        <span className="flex items-center gap-1 text-red-500 font-bold">
          {dateFormatted} (Terlambat {daysOverdue} hari)
        </span>
      );
    }
    
    if (bill.status === "UNPAID") {
      const daysLeft = dueDate.diff(dayjs(), "day");
      if (daysLeft <= 7) {
        return (
          <span className="text-amber-600 font-semibold">
            {dateFormatted} ({daysLeft} hari lagi)
          </span>
        );
      }
    }

    return <span>{dateFormatted}</span>;
  }, [bill]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Sheet Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none">
        <div className="w-full lg:max-w-xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[85vh] animate-slide-up pointer-events-auto">
          {/* Header */}
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Detail Tagihan
            </h3>
            <div className="w-8" />
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-6">
            
            {/* Centered Large Display */}
            <div className="flex flex-col items-center text-center space-y-2">
              <span className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                statusConfig.bg, statusConfig.text, statusConfig.border
              )}>
                <statusConfig.icon className="h-4 w-4" />
                {statusConfig.label}
              </span>
              <h1 className="text-xl font-bold text-[var(--text-primary)] px-4">
                {bill.title}
              </h1>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatCurrency(bill.amount)}
              </p>
            </div>

            {/* Info Grid / Table Card */}
            <div className="border border-[var(--border-color)] rounded-2xl bg-[var(--bg-secondary)] overflow-hidden divide-y divide-[var(--border-color)]">
              
              {/* Jatuh Tempo */}
              <div className="flex justify-between items-center p-4">
                <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--text-tertiary)]" />
                  Jatuh Tempo
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {dueLabel}
                </span>
              </div>

              {/* Kategori */}
              {bill.category && (
                <div className="flex justify-between items-center p-4">
                  <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[var(--text-tertiary)]" />
                    Kategori
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${bill.category.color || "#6B7280"}18`,
                      color: bill.category.color || "#6B7280",
                    }}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" />
                    {bill.category.name}
                  </span>
                </div>
              )}

              {/* Dompet */}
              {bill.wallet && (
                <div className="flex justify-between items-center p-4">
                  <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[var(--text-tertiary)]" />
                    Dompet
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {bill.wallet.name}
                  </span>
                </div>
              )}

              {/* Sumber */}
              <div className="flex justify-between items-center p-4">
                <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-[var(--text-tertiary)]" />
                  Sumber Tagihan
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {bill.source === "RECURRING" ? "Dari Berulang" : "Manual"}
                </span>
              </div>

              {/* Catatan */}
              {bill.notes && (
                <div className="p-4 space-y-1.5">
                  <span className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider flex items-center gap-2">
                    Catatan
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)] leading-normal break-words">
                    {bill.notes}
                  </p>
                </div>
              )}

              {/* Detail Bayar (jika sudah lunas) */}
              {bill.status === "PAID" && (
                <div className="flex justify-between items-center p-4 bg-emerald-500/5">
                  <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Tgl Dibayar
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    {dayjs(bill.paidAt).locale("id").format("D MMM YYYY, HH:mm")}
                  </span>
                </div>
              )}
            </div>

            {/* Recurring Info Block */}
            {bill.source === "RECURRING" && (
              <div className="bg-indigo-50 dark:bg-indigo-950/20 
                border border-indigo-200 dark:border-indigo-900/40 
                rounded-2xl p-5 flex items-start gap-4 animate-fade-in">
                <div className="bg-indigo-600 p-3 rounded-xl shrink-0">
                  <RefreshCw className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400 mb-1 truncate">
                    Transaksi Berulang Aktif
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mb-3 leading-normal">
                    Tagihan ini dari "{bill.recurring?.title || bill.title}" 
                    yang diatur setiap bulan.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      navigate("/recurring");
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400
                      flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Lihat Detail Berulang
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action Footer */}
          <div className="p-4 bg-[var(--bg-primary)]/85 backdrop-blur-xl border-t border-[var(--border-color)]/60 flex flex-col gap-3 shrink-0">
            {/* Primary Action Button: Pay or Revert */}
            {bill.status !== "PAID" ? (
              <button
                onClick={() => onPay(bill)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4.5 w-4.5" />
                Tandai Lunas
              </button>
            ) : (
              <button
                onClick={() => onUnpay(bill)}
                className="w-full bg-transparent border border-red-500/30 hover:bg-red-500/5 text-red-500 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <Undo2 className="h-4.5 w-4.5" />
                Batalkan Pembayaran
              </button>
            )}

            {/* Outlined Edit & Delete Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-color)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all cursor-pointer bg-[var(--bg-secondary)]"
              >
                <Edit2 className="h-4 w-4" />
                Edit Detail
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) {
                    onDelete(bill.id);
                  }
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-all cursor-pointer bg-[var(--bg-secondary)]"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Tagihan
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

export default BillDetail;
