import { memo } from "react";
import { ImageOff, Calendar, Link2, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import dayjs from "dayjs";
import "dayjs/locale/id";
import toast from "react-hot-toast";

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

  return (
    <div
      onClick={() => status === "ACTIVE" && onTap && onTap(wishlist)}
      className="flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-3 transition-all hover:shadow-md cursor-pointer select-none"
    >
      {/* Kolom Kiri — Foto/Placeholder */}
      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)]">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="h-7 w-7 text-[var(--text-tertiary)]" />
        )}
      </div>

      {/* Kolom Tengah — Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
          {name}
        </p>
        <div className="flex items-center gap-1 mt-0.5 text-xs text-[var(--text-tertiary)]">
          <Calendar className="h-3 w-3" />
          <span>
            {targetDate ? dayjs(targetDate).format("DD MMM YYYY") : "-"}
          </span>
        </div>
        <p className="font-bold text-sm text-[var(--text-primary)] mt-1">
          {formatCurrency(targetPrice)}
        </p>
      </div>

      {/* Kolom Kanan — Actions */}
      <div className="shrink-0 flex flex-col justify-between items-end h-16">
        {/* Pojok kanan atas */}
        <div className="flex items-center gap-1.5">
          {productLink && (
            <Link2
              onClick={handleOpenProductLink}
              className="h-4 w-4 text-blue-500 cursor-pointer hover:opacity-85"
            />
          )}
          <Trash2
            onClick={handleDeleteClick}
            className="h-4 w-4 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer transition-colors"
          />
        </div>

        {/* Pojok kanan bawah — Tombol "Beli" / Status badge */}
        {status === "ACTIVE" ? (
          <button
            onClick={handleBuyClick}
            className="bg-[var(--text-primary)] text-[var(--bg-primary)] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
          >
            Beli
          </button>
        ) : (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
            Tercapai 🎉
          </span>
        )}
      </div>
    </div>
  );
});

export default WishlistCard;
