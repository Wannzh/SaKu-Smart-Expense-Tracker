import { memo } from "react";
import { formatCurrency, formatDate } from "../../utils/format";
import { Pencil, Trash2 } from "lucide-react";
import clsx from "clsx";

const TransactionCard = memo(function TransactionCard({
  transaction,
  onEdit,
  onDelete,
  showActions = false,
}) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div
      className={clsx(
        "flex items-center gap-4 rounded-xl bg-white p-4 border border-gray-100 group",
        "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Category icon */}
      <div
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg",
          isIncome
            ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50"
            : "bg-gradient-to-br from-red-50 to-red-100/50"
        )}
      >
        {transaction.category?.icon || (isIncome ? "💰" : "💸")}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-800">
          {transaction.category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")}
        </p>
        <p className="truncate text-xs text-gray-400 mt-0.5">
          {transaction.description || formatDate(transaction.date)}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className={clsx(
            "text-sm font-bold tabular-nums",
            isIncome ? "text-emerald-600" : "text-red-500"
          )}
        >
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {formatDate(transaction.date)}
        </p>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit?.(transaction)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete?.(transaction)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
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
