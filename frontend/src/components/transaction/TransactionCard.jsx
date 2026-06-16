import { memo } from "react";
import { formatCurrency, formatDate, cleanDescription } from "../../utils/format";
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
  const isWishlist = transaction.description?.startsWith("Tabungan Keinginan:") || transaction.description?.startsWith("Tabungan Awal Keinginan:") || transaction.categoryId === "cat-wishlist";

  const IconComponent = isTransfer
    ? LucideIcons.ArrowLeftRight
    : isWishlist
    ? LucideIcons.Gift
    : LucideIcons[transaction.category?.icon] || (isIncome ? LucideIcons.TrendingUp : LucideIcons.TrendingDown);

  const catColor = isTransfer
    ? "#6366F1"
    : isWishlist
    ? "#6366F1"
    : transaction.category?.color || (isIncome ? "#10B981" : "#EF4444");

  const desc = cleanDescription(transaction.description);
  const displayDesc = isWishlist
    ? desc.replace("Tabungan Keinginan: ", "").replace("Tabungan Awal Keinginan: ", "")
    : desc;

  // Title & Subtitle mapping matching mockup
  const title = isTransfer
    ? (displayDesc || "Transfer")
    : (displayDesc || transaction.category?.name || (isIncome ? "Pemasukan" : "Pengeluaran"));

  const subtitle = isTransfer
    ? ""
    : displayDesc ? (transaction.category?.name || (isIncome ? "Pemasukan" : "Pengeluaran")) : (transaction.subCategory?.name || "");

  return (
    <div
      onClick={() => onClick?.(transaction)}
      className={clsx(
        "flex items-center justify-between rounded-2xl p-4 border group bg-[var(--card-bg)] border-[var(--border-color)] transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-600/50",
        onClick ? "cursor-pointer" : ""
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Category icon */}
        <div 
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${catColor}15` }}
        >
          <IconComponent className="h-6 w-6" style={{ color: catColor }} />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-bold text-[var(--text-primary)]">{title}</h4>
            {transaction.isRecurring && (
              <span className="px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-tighter border border-[var(--border-color)]/30 shrink-0">
                Berulang
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs mt-1">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {subtitle && (transaction.wallet || isTransfer) && (
              <span className="w-1 h-1 rounded-full bg-[var(--border-color)] shrink-0"></span>
            )}
            {isTransfer ? (
              <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                <LucideIcons.ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  {transaction.fromWallet?.name || "-"} → {transaction.toWallet?.name || "-"}
                </span>
              </span>
            ) : (
              transaction.wallet && (
                <span className="flex items-center gap-1 text-[var(--text-tertiary)] truncate">
                  <LucideIcons.Wallet className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{transaction.wallet.name}</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* Amount & Date */}
      <div className="flex items-center gap-6 shrink-0 ml-4">
        <div className="text-right">
          <p className="text-[11px] text-[var(--text-tertiary)] mb-0.5">
            {formatDate(transaction.date)}
          </p>
          <p
            className={clsx(
              "text-sm font-extrabold tabular-nums",
              isTransfer
                ? "text-[var(--text-secondary)]"
                : isIncome
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            )}
          >
            {isTransfer ? "" : isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
          </p>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="lg:opacity-0 lg:group-hover:opacity-100 flex gap-1 transition-opacity duration-200">
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
    </div>
  );
});

export default TransactionCard;
