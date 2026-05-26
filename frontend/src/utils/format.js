import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.locale("id");
dayjs.extend(relativeTime);

/**
 * Format angka ke Rupiah
 * @param {number} amount
 * @returns {string} contoh: "Rp 50.000"
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date
 * @returns {string} contoh: "25 Mei 2024"
 */
export const formatDate = (date) => {
  return dayjs(date).format("D MMMM YYYY");
};

/**
 * Format tanggal relatif
 * @param {string|Date} date
 * @returns {string} contoh: "2 hari lalu"
 */
export const formatRelativeDate = (date) => {
  return dayjs(date).fromNow();
};

/**
 * Format tanggal pendek
 * @param {string|Date} date
 * @returns {string} contoh: "25 Mei"
 */
export const formatShortDate = (date) => {
  return dayjs(date).format("D MMM");
};

/**
 * Format tanggal ke ISO untuk input date
 * @param {string|Date} date
 * @returns {string} contoh: "2024-05-25"
 */
export const toISODate = (date) => {
  return dayjs(date).format("YYYY-MM-DD");
};
