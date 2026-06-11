import { memo } from "react";
import { Gift, Calendar, Plus, Trophy } from "lucide-react";
import { formatCurrency, formatDate } from "../../utils/format";
import clsx from "clsx";

const WishlistCard = memo(function WishlistCard({
  wishlist,
  onClick,
  onAddSavings,
}) {
  const {
    id,
    name,
    targetPrice,
    savedAmount,
    priority,
    status,
    imageUrl,
    targetDate,
  } = wishlist;

  const progress = Math.min(Math.round((savedAmount / targetPrice) * 100), 100);
  const isAchieved = status === "ACHIEVED" || progress >= 100;

  const priorityConfig = {
    LOW: {
      label: "Rendah",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    MEDIUM: {
      label: "Sedang",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    HIGH: {
      label: "Tinggi",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        "group relative flex flex-col p-5 rounded-2xl border bg-[var(--card-bg)] border-[var(--border-color)]",
        "hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 cursor-pointer overflow-hidden"
      )}
    >
      {/* Background glow for achieved wishlist */}
      {isAchieved && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
      )}

      <div className="flex gap-4 items-start">
        {/* Wishlist Image / Fallback */}
        <div className="relative flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center text-[var(--text-tertiary)]",
              imageUrl ? "hidden" : "flex"
            )}
          >
            <Gift className="h-7 w-7" />
          </div>
          {isAchieved && (
            <div className="absolute top-0 right-0 bg-amber-500 text-white p-0.5 rounded-bl-lg">
              <Trophy className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {name}
            </h4>
            <span
              className={clsx(
                "px-2 py-0.5 text-[10px] font-bold rounded-full border flex-shrink-0",
                priorityConfig[priority]?.badge
              )}
            >
              {priorityConfig[priority]?.label}
            </span>
          </div>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base font-bold text-[var(--text-primary)]">
              {formatCurrency(savedAmount)}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              / {formatCurrency(targetPrice)}
            </span>
          </div>

          {targetDate && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-tertiary)]">
              <Calendar className="h-3 w-3" />
              <span>Target: {formatDate(targetDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mt-5 space-y-1.5">
        <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)]">
          <span>{progress}% Tercapai</span>
          {!isAchieved && (
            <span>Kurang {formatCurrency(targetPrice - savedAmount)}</span>
          )}
        </div>
        <div className="relative h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500 ease-out",
              isAchieved ? "bg-amber-500" : "bg-indigo-600"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick Savings CTA */}
      {!isAchieved && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddSavings(wishlist);
          }}
          className={clsx(
            "mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-dashed border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)]",
            "hover:bg-[var(--bg-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 transition-all cursor-pointer"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Tabungan</span>
        </button>
      )}

      {isAchieved && (
        <div className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-amber-500/10 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Trophy className="h-4 w-4" />
          <span>Impian Terwujud!</span>
        </div>
      )}
    </div>
  );
});

export default WishlistCard;
