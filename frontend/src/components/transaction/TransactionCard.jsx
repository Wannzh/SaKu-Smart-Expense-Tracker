import { memo } from "react";
import { formatCurrency, formatDate } from "../../utils/format";
import { Pencil, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";

const TransactionCard = memo(function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  showActions = false,
  onClick,
}) {
  const isIncome = transaction.type === "INCOME";
  const isTransfer = transaction.type === "TRANSFER";

  const IconComponent = isTransfer
    ? LucideIcons.ArrowLeftRight
    : LucideIcons[transaction.category?.icon] || (isIncome ? LucideIcons.TrendingUp : LucideIcons.TrendingDown);

  const catColor = isTransfer
    ? "#6366F1"
    : transaction.category?.color || (isIncome ? "#10B981" : "#EF4444");

  const subName = transaction.subCategory?.name;
  const desc = transaction.description;
  const subtitle = isTransfer
    ? `${transaction.fromWallet?.name || "-"} → ${transaction.toWallet?.name || "-"}`
    : subName && desc
    ? `${subName} · ${desc}`
    : subName || desc || formatDate(transaction.date);

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={clsx(
        "flex items-center gap-4 rounded-xl p-4 border group",
        onClick ? "cursor-pointer" : "",
        "bg-[var(--card-bg)] border-[var(--border-color)]",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Category icon */}
      <div 
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${catColor}20` }}
      >
        <IconComponent className="h-5 w-5" style={{ color: catColor }} />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
          {isTransfer ? "Transfer" : transaction.category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
        </p>
        <p className="truncate text-xs text-[var(--text-tertiary)] mt-0.5" title={subtitle}>
          {subtitle}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className={clsx(
            "text-sm font-bold tabular-nums",
            isTransfer
              ? "text-[var(--text-secondary)]"
              : isIncome
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400"
          )}
        >
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
          {formatDate(transaction.date)}
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(transaction);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(transaction);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            title="Hapus"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
});

export default TransactionCard;
