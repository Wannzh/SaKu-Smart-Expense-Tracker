import { memo } from "react";
import { formatCurrency, formatDate } from "../../utils/format";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

const TransactionCard = memo(function TransactionCard({ transaction }) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 border border-gray-100 hover:shadow-sm transition-shadow duration-200">
      {/* Category icon */}
      <div
        className={clsx(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg",
          isIncome ? "bg-emerald-50" : "bg-red-50"
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
            "text-sm font-bold",
            isIncome ? "text-emerald-600" : "text-red-500"
          )}
        >
          {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {formatDate(transaction.date)}
        </p>
      </div>
    </div>
  );
});

export default TransactionCard;
