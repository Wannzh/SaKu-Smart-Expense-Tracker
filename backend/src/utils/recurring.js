const dayjs = require("dayjs");

/**
 * Hitung nextRunDate berdasarkan startDate dan frequency
 * Rules:
 * - DAILY: tambah 1 hari dari tanggal terakhir
 * - WEEKLY: tambah 7 hari
 * - MONTHLY: tambah 1 bulan
 * - YEARLY: tambah 1 tahun
 */
const calculateNextRunDate = (fromDate, frequency) => {
  const d = dayjs(fromDate);
  switch (frequency) {
    case "DAILY":   return d.add(1, "day").toDate();
    case "WEEKLY":  return d.add(7, "day").toDate();
    case "MONTHLY": return d.add(1, "month").toDate();
    case "YEARLY":  return d.add(1, "year").toDate();
    default:        return d.add(1, "month").toDate();
  }
};

module.exports = { calculateNextRunDate };
