import { memo, useMemo } from "react";
import { ImageOff, Calendar, Link2, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const WishlistCard = memo(function WishlistCard({
  wishlist,
  onTap,
  onDelete,
  onBuy,
}) {
  const {
    id,
    name,
    targetPrice,
    imageUrl,
    productLink,
    targetDate,
    status,
  } = wishlist;

  const handleOpenProductLink = (e) => {
    e.stopPropagation();
    if (productLink) {
      window.open(productLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    onBuy(wishlist);
  };

  // Determine tag dynamically based on price
  const tag = useMemo(() => {
    if (targetPrice > 10000000) return "Prioritas";
    if (targetPrice <= 2500000) return "Gaya Hidup";
    return "Rencana";
  }, [targetPrice]);

  const tagColor = useMemo(() => {
    if (tag === "Prioritas") return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    if (tag === "Gaya Hidup") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
  }, [tag]);

  return (
    <div
      onClick={() => status === "ACTIVE" && onTap && onTap(wishlist)}
      className="group bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]/60 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col select-none cursor-pointer"
    >
      {/* Top Image Cover */}
      <div className="aspect-[4/3] w-full relative overflow-hidden bg-[var(--bg-primary)] flex items-center justify-center border-b border-[var(--border-color)]/40 shrink-0">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <ImageOff className="h-10 w-10 text-[var(--text-tertiary)] opacity-35" />
        )}
        
        {/* Dynamic Tag */}
        <div className={`absolute top-4 right-4 bg-[var(--card-bg)]/90 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-extrabold border ${tagColor}`}>
          {tag}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-6 flex-1 flex flex-col justify-between text-left">
        <div>
          <h4 className="font-bold text-base text-[var(--text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {name}
          </h4>
          <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mt-2.5">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">
              Target: {targetDate ? dayjs(targetDate).format("DD MMM YYYY") : "Tanpa Target"}
            </span>
          </div>
        </div>

        <div className="mt-5">
          <p className="font-extrabold text-lg text-indigo-600 dark:text-indigo-400 tabular-nums">
            {formatCurrency(targetPrice)}
          </p>

          {/* Action Footer */}
          <div className="mt-4 pt-4 border-t border-[var(--border-color)]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {productLink && (
                <button
                  onClick={handleOpenProductLink}
                  className="p-1 text-[var(--text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  title="Buka Link Produk"
                >
                  <Link2 className="h-4.5 w-4.5" />
                </button>
              )}
              <button
                onClick={handleDeleteClick}
                className="p-1 text-[var(--text-tertiary)] hover:text-red-500 transition-colors cursor-pointer"
                title="Hapus Keinginan"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>

            {status === "ACTIVE" ? (
              <button
                onClick={handleBuyClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                Beli
              </button>
            ) : (
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                Tercapai 🎉
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default WishlistCard;
