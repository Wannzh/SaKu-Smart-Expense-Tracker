import { memo } from "react";
import clsx from "clsx";

// Ambil inisial dari nama: "Alwan Fadhilah" → "AF"
// Jika 1 kata: "Alwan" → "A"
const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Warna background konsisten berdasarkan nama
// (selalu warna yang sama untuk nama yang sama)
const getAvatarColor = (name = "") => {
  const colors = [
    "bg-indigo-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-fuchsia-500",
    "bg-orange-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const UserAvatar = memo(function UserAvatar({
  user,           // { name, avatar }
  size = "md",    // "xs" | "sm" | "md" | "lg" | "xl"
  className = "",
}) {
  const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-2xl",
  };

  const hasAvatar = user?.avatar && 
    user.avatar.trim() !== "" && 
    !user.avatar.includes("null");

  if (hasAvatar) {
    return (
      <img
        src={user.avatar}
        alt={user?.name || "Avatar"}
        className={clsx(
          sizeMap[size],
          "rounded-full object-cover flex-shrink-0",
          className
        )}
        onError={(e) => {
          // Jika gambar gagal load, hide img
          // dan parent akan render inisial
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={clsx(
        sizeMap[size],
        getAvatarColor(user?.name || ""),
        "rounded-full flex items-center justify-center",
        "font-bold text-white flex-shrink-0 select-none",
        className
      )}
      aria-label={`Avatar ${user?.name || ""}`}
    >
      {getInitials(user?.name)}
    </div>
  );
});

export default UserAvatar;
