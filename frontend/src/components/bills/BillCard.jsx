import { memo, useMemo } from "react";
import { AlertCircle, Clock, FileText, CheckCircle2, RefreshCw } from "lucide-react";
import dayjs from "dayjs";
import { formatCurrency } from "../../utils/format";

const BillCard = memo(function BillCard({ 
  bill, onTap, onPay 
}) {
  const statusConfig = useMemo(() => {
    switch(bill.status) {
      case "OVERDUE": return {
        className: "bill-card-overdue",
        iconBg: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        icon: <AlertCircle className="w-5 h-5" />,
        label: `Terlambat ${dayjs().diff(
          dayjs(bill.dueDate), "day"
        )} hari`,
        labelColor: "text-red-500",
      };
      case "UNPAID": {
        const daysLeft = dayjs(bill.dueDate)
          .diff(dayjs(), "day");
        const isUpcoming = daysLeft <= 7;
        return {
          className: isUpcoming 
            ? "bill-card-upcoming" 
            : "bill-card-pending",
          iconBg: isUpcoming 
            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
            : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
          icon: isUpcoming 
            ? <Clock className="w-5 h-5" />
            : <FileText className="w-5 h-5" />,
          label: isUpcoming 
            ? `Jatuh tempo ${daysLeft} hari lagi`
            : `Jatuh tempo: ${dayjs(bill.dueDate)
                .locale("id").format("D MMM YYYY")}`,
          labelColor: isUpcoming 
            ? "text-amber-600" 
            : "text-[var(--text-secondary)]",
        };
      }
      case "PAID": return {
        className: "bill-card-paid",
        iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
        icon: <CheckCircle2 className="w-5 h-5" />,
        label: `Lunas ${dayjs(bill.paidAt)
          .locale("id").format("D MMM")}`,
        labelColor: "text-emerald-600",
      };
      default: return {
        className: "bill-card-pending",
        iconBg: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
        icon: <FileText className="w-5 h-5" />,
        label: "",
        labelColor: "",
      };
    }
  }, [bill]);

  return (
    <div
      className={`flex items-center gap-4 p-4 
        bg-[var(--card-bg)] rounded-2xl 
        border border-[var(--border-color)] 
        shadow-sm transition-all hover:shadow-md 
        cursor-pointer ${statusConfig.className}`}
      onClick={() => onTap(bill)}>
      
      {/* Status Icon */}
      <div className={`w-12 h-12 rounded-xl 
        flex items-center justify-center 
        shrink-0 ${statusConfig.iconBg}`}>
        {statusConfig.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm 
            text-[var(--text-primary)] truncate">
            {bill.title}
          </h4>
          {/* Source badge */}
          {bill.source === "RECURRING" ? (
            <span className="px-2 py-0.5 
              bg-amber-100 text-amber-700 
              dark:bg-amber-900/30 dark:text-amber-400
              rounded text-[10px] font-bold uppercase 
              flex items-center gap-1 shrink-0">
              <RefreshCw className="w-2.5 h-2.5" />
              Berulang
            </span>
          ) : (
            <span className="px-2 py-0.5 
              bg-[var(--bg-tertiary)] 
              text-[var(--text-secondary)] 
              dark:bg-slate-800 dark:text-slate-400
              rounded text-[10px] font-bold 
              uppercase shrink-0">
              Manual
            </span>
          )}
        </div>
        <p className={`text-xs flex items-center gap-1
          ${statusConfig.labelColor}`}>
          {statusConfig.label}
        </p>
      </div>

      {/* Amount + Action */}
      <div className="text-right shrink-0">
        <p className="font-bold text-sm tabular-nums
          text-[var(--text-primary)]">
          {formatCurrency(bill.amount)}
        </p>
        {bill.status !== "PAID" ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPay(bill);
            }}
            className="mt-1 px-3 py-1.5 bg-indigo-600 
              text-white rounded-lg text-xs font-bold 
              hover:bg-indigo-700 transition-colors 
              active:scale-95 cursor-pointer">
            Tandai Lunas
          </button>
        ) : (
          <span className="text-xs font-bold 
            text-emerald-600 italic">
            Sudah Terbayar
          </span>
        )}
      </div>
    </div>
  );
});

export default BillCard;
