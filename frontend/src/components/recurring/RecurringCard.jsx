import { memo, useCallback } from "react";
import { RefreshCw, Coins, Edit, Trash2, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import clsx from "clsx";

const frequencyMap = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

const RecurringCard = memo(function RecurringCard({
  recurring,
  onToggle,
  onClick,
  onEdit,
  onDelete,
}) {
  const {
    id,
    title,
    amount,
    type,
    frequency,
    nextRunDate,
    iconUrl,
    wallet,
    status,
  } = recurring;

  const isIncome = type === "INCOME";
  const isActive = status === "ACTIVE";

  const handleToggleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onToggle(id);
    },
    [id, onToggle]
  );

  const handleEditClick = useCallback(
    (e) => {
      e.stopPropagation();
      onEdit?.(recurring);
    },
    [recurring, onEdit]
  );

  const handleDeleteClick = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete?.(id);
    },
    [id, onDelete]
  );

  return (
    <div
      onClick={() => onClick?.(recurring)}
      className={clsx(
        "group bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-5 rounded-3xl flex items-center gap-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden",
        onClick ? "cursor-pointer" : ""
      )}
    >
      {/* Icon / Image */}
      <div className="relative shrink-0 z-10">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={title}
            className="h-14 w-14 rounded-2xl object-cover border border-[var(--border-color)]/60"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-2xl transition-all",
            iconUrl ? "hidden" : "flex",
            isIncome
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          <RefreshCw className={clsx("h-6 w-6", isActive && "animate-spin-slow")} />
        </div>
      </div>

      {/* Deskripsi */}
      <div className="min-w-0 flex-1 text-left z-10">
        <div className="flex items-center gap-2 mb-1">
          <p className="truncate text-sm font-bold text-[var(--text-primary)]">
            {title}
          </p>
          <span
            className={clsx(
              "px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider border shrink-0",
              isIncome
                ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400"
            )}
          >
            {frequencyMap[frequency] || frequency}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-tertiary)] font-medium">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(nextRunDate)}
          </span>
          {wallet && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" /> {wallet.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount & Toggle */}
      <div className="flex items-center gap-4 shrink-0 z-10">
        <div className="text-right">
          <p
            className={clsx(
              "text-sm font-black tabular-nums",
              isIncome
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-500 dark:text-rose-400"
            )}
          >
            {isIncome ? "+" : "-"}{formatCurrency(amount)}
          </p>
          <p className="text-[10px] text-[var(--text-tertiary)] font-bold">
            {isActive ? "Tagihan Tetap" : "Dinonaktifkan"}
          </p>
        </div>

        {/* Toggle Switch */}
        <button
          type="button"
          onClick={handleToggleClick}
          className={clsx(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            isActive ? "bg-indigo-600" : "bg-[var(--border-color)]"
          )}
        >
          <span
            className={clsx(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out",
              isActive ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
});

export default RecurringCard;
