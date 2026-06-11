import { memo, useCallback } from "react";
import { RefreshCw, Coins } from "lucide-react";
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

  return (
    <div
      onClick={() => onClick?.(recurring)}
      className={clsx(
        "flex items-center gap-4 rounded-2xl p-4 border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 bg-[var(--card-bg)] border-[var(--border-color)]",
        onClick ? "cursor-pointer" : ""
      )}
    >
      {/* Kiri: Icon / Image */}
      <div className="relative shrink-0">
        {iconUrl ? (
          <img
            src={iconUrl}
            alt={title}
            className="h-10 w-10 rounded-xl object-cover border border-[var(--border-color)]"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
            iconUrl ? "hidden" : "flex",
            isIncome
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
          )}
        >
          <RefreshCw className={clsx("h-5 w-5", isActive && "animate-spin-slow")} />
        </div>
      </div>

      {/* Tengah: Deskripsi */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {title}
          </p>
          <span
            className={clsx(
              "px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider border shrink-0",
              isIncome
                ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400"
            )}
          >
            {frequencyMap[frequency] || frequency}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--text-tertiary)]">
          <span className="font-medium">
            Berikutnya: {formatDate(nextRunDate)}
          </span>
          {wallet && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" /> {wallet.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Kanan: Amount & Toggle */}
      <div className="flex items-center gap-3 shrink-0">
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
