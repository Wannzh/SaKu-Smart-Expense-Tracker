// ─── Brand Colors (Design System) ─────────────────────────────
export const COLORS = {
  PRIMARY: "#4F46E5",
  ACCENT: "#FBBF24",
  DARK: "#4B5563",
  WHITE: "#FFFFFF",
};

// ─── API ──────────────────────────────────────────────────────
export const API_URL = import.meta.env.VITE_API_URL;

// ─── Transaction Types ────────────────────────────────────────
export const TRANSACTION_TYPES = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
};

// ─── Cookie / Auth ────────────────────────────────────────────
export const COOKIE_NAME = "saku_token";

// ─── Pagination ───────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ─── Chat ─────────────────────────────────────────────────────
export const MESSAGE_ROLES = {
  USER: "USER",
  ASSISTANT: "ASSISTANT",
};

// ─── Card Gradient Styles ─────────────────────────────────────
export const LIGHT_CARD_GRADIENTS = [
  { name: "Teal Cyan",     from: "#0EA5E9", to: "#06B6D4" },
  { name: "Purple Blue",   from: "#8B5CF6", to: "#3B82F6" },
  { name: "Green Teal",    from: "#10B981", to: "#06B6D4" },
  { name: "Pink Red",      from: "#EC4899", to: "#EF4444" },
  { name: "Orange Yellow", from: "#F97316", to: "#FBBF24" },
  { name: "Indigo Purple", from: "#4F46E5", to: "#7C3AED" },
];

export const DARK_CARD_GRADIENTS = [
  { name: "Blue Cyan",     from: "#1D4ED8", to: "#0891B2" },
  { name: "Purple Indigo", from: "#7C3AED", to: "#4338CA" },
  { name: "Teal Dark",     from: "#0F766E", to: "#164E63" },
  { name: "Navy Blue",     from: "#1E3A5F", to: "#1D4ED8" },
  { name: "Dark Darker",   from: "#1F2937", to: "#111827" },
];
