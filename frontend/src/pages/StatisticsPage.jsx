import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransaction } from "../hooks/useTransaction";
import { useTransfer } from "../hooks/useTransfer";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency } from "../utils/format";
import * as LucideIcons from "lucide-react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  PieChart as PieIcon,
  BarChart2 as BarIcon,
  Activity as TrendIcon,
  CreditCard as WalletActivityIcon,
  Banknote,
  Building2,
  Smartphone
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";

dayjs.locale("id");

// ─── Private Helpers ──────────────────────────────────────────
const formatCompactNumber = (value) => {
  const absValue = Math.abs(value);
  if (absValue >= 1e9) {
    return (value / 1e9).toFixed(1).replace(/\.0$/, "") + "m";
  }
  if (absValue >= 1e6) {
    return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "jt";
  }
  if (absValue >= 1e3) {
    return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "rb";
  }
  return value.toString();
};

const walletIconMap = {
  cash: Banknote,
  bank: Building2,
  ewallet: Smartphone,
};

// Custom Chart Tooltip
const CustomChartTooltip = memo(function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3 shadow-lg min-w-[140px]">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-1.5">{label}</p>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 text-xs mt-1">
            <span className="flex items-center gap-1.5 text-[var(--text-secondary)] font-medium">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.fill }} />
              {p.name}:
            </span>
            <span className="font-bold text-[var(--text-primary)] tabular-nums">
              {formatCurrency(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
});

const CustomTrendTooltip = memo(function CustomTrendTooltip({ active, payload, label, isYearly, activeType }) {
  if (active && payload && payload.length) {
    const isExpense = activeType === "EXPENSE";
    return (
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3 shadow-lg min-w-[140px]">
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">
          {isYearly ? `Bulan ${label}` : `Tanggal ${label}`}
        </p>
        <p className={clsx(
          "text-sm font-bold mt-1 tabular-nums",
          isExpense ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
        )}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
});

// ─── Main Component ───────────────────────────────────────────
const StatisticsPage = memo(function StatisticsPage() {
  const navigate = useNavigate();
  const { transactions, getTransactions, isLoading: txLoading } = useTransaction();
  const { transfers, getTransfers, isLoading: tfLoading } = useTransfer();
  const { wallets, getWallets, isLoading: wlLoading } = useWallet();

  const [activePeriod, setActivePeriod] = useState("Bulan");
  const [activeType, setActiveType] = useState("EXPENSE"); // "EXPENSE" | "INCOME"

  const isLoading = txLoading || tfLoading || wlLoading;

  const refreshData = useCallback(() => {
    Promise.all([getTransactions(), getTransfers(), getWallets()]);
  }, [getTransactions, getTransfers, getWallets]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Listen for overall refresh events
  useEffect(() => {
    const handleRefresh = () => refreshData();
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, [refreshData]);

  // ─── Filtered Data By Active Period ────────────────────────
  const filteredTransactions = useMemo(() => {
    const now = dayjs();
    return transactions.filter((tx) => {
      const txDate = dayjs(tx.date);
      if (activePeriod === "Minggu") {
        return txDate.isSame(now, "week");
      }
      if (activePeriod === "Bulan") {
        return txDate.isSame(now, "month");
      }
      if (activePeriod === "3 Bulan") {
        return txDate.isAfter(now.subtract(3, "month"));
      }
      if (activePeriod === "Tahun") {
        return txDate.isSame(now, "year");
      }
      return true;
    });
  }, [transactions, activePeriod]);

  // Filter transfers for wallet activity
  const filteredTransfers = useMemo(() => {
    const now = dayjs();
    return transfers.filter((tf) => {
      const tfDate = dayjs(tf.date);
      if (activePeriod === "Minggu") {
        return tfDate.isSame(now, "week");
      }
      if (activePeriod === "Bulan") {
        return tfDate.isSame(now, "month");
      }
      if (activePeriod === "3 Bulan") {
        return tfDate.isAfter(now.subtract(3, "month"));
      }
      if (activePeriod === "Tahun") {
        return tfDate.isSame(now, "year");
      }
      return true;
    });
  }, [transfers, activePeriod]);

  // ─── Calculations for Summary ──────────────────────────────
  const { filteredIncome, filteredExpense, netValue, isNetPositive } = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const expense = filteredTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const net = income - expense;
    return {
      filteredIncome: income,
      filteredExpense: expense,
      netValue: net,
      isNetPositive: net >= 0,
    };
  }, [filteredTransactions]);

  // ─── Calculations for Income vs Expense Bar Chart ──────────
  const barChartData = useMemo(() => {
    const now = dayjs();
    let data = [];

    if (activePeriod === "Minggu") {
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      data = days.map((dayName, idx) => {
        const dayIndex = idx === 6 ? 0 : idx + 1; // 0 is Sunday, 1 is Monday...
        const targetDate = now.day(dayIndex);
        const dayTx = filteredTransactions.filter((tx) =>
          dayjs(tx.date).isSame(targetDate, "day")
        );
        const income = dayTx
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = dayTx
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return { name: dayName, Pemasukan: income, Pengeluaran: expense };
      });
    } else if (activePeriod === "Bulan") {
      const daysInMonth = now.daysInMonth();
      data = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNum = i + 1;
        const targetDate = now.date(dayNum);
        const dayTx = filteredTransactions.filter((tx) =>
          dayjs(tx.date).isSame(targetDate, "day")
        );
        const income = dayTx
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = dayTx
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return { name: String(dayNum), Pemasukan: income, Pengeluaran: expense };
      });
    } else if (activePeriod === "3 Bulan") {
      const months = [];
      for (let i = 2; i >= 0; i--) {
        months.push(now.subtract(i, "month"));
      }
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      data = months.map((m) => {
        const monthTx = filteredTransactions.filter((tx) =>
          dayjs(tx.date).isSame(m, "month")
        );
        const income = monthTx
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = monthTx
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return {
          name: monthNames[m.month()],
          Pemasukan: income,
          Pengeluaran: expense,
        };
      });
    } else if (activePeriod === "Tahun") {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      data = Array.from({ length: 12 }, (_, i) => {
        const targetMonth = now.month(i).startOf("month");
        const monthTx = filteredTransactions.filter(
          (tx) =>
            dayjs(tx.date).isSame(targetMonth, "month") &&
            dayjs(tx.date).isSame(now, "year")
        );
        const income = monthTx
          .filter((t) => t.type === "INCOME")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        const expense = monthTx
          .filter((t) => t.type === "EXPENSE")
          .reduce((sum, t) => sum + Number(t.amount || 0), 0);
        return {
          name: monthNames[i],
          Pemasukan: income,
          Pengeluaran: expense,
        };
      });
    }
    return data;
  }, [filteredTransactions, activePeriod]);

  // ─── Calculations for Category Donut Chart & List ─────────
  const categorySummary = useMemo(() => {
    const matchedTransactions = filteredTransactions.filter((t) => t.type === activeType);
    const total = matchedTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const groups = {};
    matchedTransactions.forEach((t) => {
      const isWishlist = t.description?.startsWith("Tabungan Keinginan:") || t.description?.startsWith("Tabungan Awal Keinginan:") || t.categoryId === "cat-wishlist";
      
      const catId = isWishlist ? "wishlist-savings" : (t.categoryId || "uncategorized");
      const catName = isWishlist 
        ? "Transaksi Keinginan" 
        : t.category?.name || (activeType === "INCOME" ? "Pemasukan Lain" : "Pengeluaran Lain");
      const catColor = isWishlist 
        ? "#6366F1" 
        : t.category?.color || (activeType === "INCOME" ? "#10B981" : "#EF4444");
      const catIcon = isWishlist 
        ? "Gift" 
        : t.category?.icon || "Tag";

      if (!groups[catId]) {
        groups[catId] = {
          id: catId,
          name: catName,
          color: catColor,
          icon: catIcon,
          amount: 0,
        };
      }
      groups[catId].amount += Number(t.amount || 0);
    });

    const list = Object.values(groups)
      .map((g) => ({
        ...g,
        percentage: total > 0 ? (g.amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { list, total };
  }, [filteredTransactions, activeType]);

  // ─── Calculations for Cumulative Trend Line Chart ─────────
  const trendData = useMemo(() => {
    const now = dayjs();
    let datesList = [];

    if (activePeriod === "Minggu") {
      const start = now.startOf("week");
      for (let i = 0; i < 7; i++) {
        datesList.push(start.add(i, "day"));
      }
    } else if (activePeriod === "Bulan") {
      const start = now.startOf("month");
      const daysCount = now.daysInMonth();
      for (let i = 0; i < daysCount; i++) {
        datesList.push(start.add(i, "day"));
      }
    } else if (activePeriod === "3 Bulan") {
      const start = now.subtract(3, "month").startOf("month");
      const diffDays = now.diff(start, "day") + 1;
      for (let i = 0; i < diffDays; i++) {
        datesList.push(start.add(i, "day"));
      }
    } else if (activePeriod === "Tahun") {
      const start = now.startOf("year");
      for (let i = 0; i < 12; i++) {
        datesList.push(start.add(i, "month"));
      }
    }

    let cumulative = 0;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];

    return datesList.map((d) => {
      const isYearly = activePeriod === "Tahun";
      const dayTx = filteredTransactions.filter((tx) => {
        const txDate = dayjs(tx.date);
        return isYearly ? txDate.isSame(d, "month") : txDate.isSame(d, "day");
      });

      const dayAmount = dayTx
        .filter((tx) => tx.type === activeType)
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      cumulative += dayAmount;

      let label = "";
      if (activePeriod === "Minggu") {
        const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
        const dayIdx = d.day() === 0 ? 6 : d.day() - 1;
        label = days[dayIdx] || "";
      } else if (activePeriod === "Bulan") {
        label = d.format("D");
      } else if (activePeriod === "3 Bulan") {
        label = d.format("D/M");
      } else if (activePeriod === "Tahun") {
        label = monthNames[d.month()];
      }

      return {
        name: label,
        "Akumulasi": cumulative,
      };
    });
  }, [filteredTransactions, activePeriod, activeType]);

  // ─── Calculations for Wallet Summary List ──────────────────
  const walletSummaries = useMemo(() => {
    return wallets.map((w) => {
      const wIncomeTx = filteredTransactions.filter(
        (tx) => tx.type === "INCOME" && tx.walletId === w.id
      );
      const wExpenseTx = filteredTransactions.filter(
        (tx) => tx.type === "EXPENSE" && tx.walletId === w.id
      );

      const wIncomeTf = filteredTransfers.filter((tf) => tf.toWalletId === w.id);
      const wExpenseTf = filteredTransfers.filter((tf) => tf.fromWalletId === w.id);

      const totalIncome =
        wIncomeTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) +
        wIncomeTf.reduce((sum, tf) => sum + Number(tf.amount || 0), 0);

      const totalExpense =
        wExpenseTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0) +
        wExpenseTf.reduce((sum, tf) => sum + Number(tf.amount || 0), 0);

      const ratio =
        totalIncome > 0
          ? Math.min((totalExpense / totalIncome) * 100, 100)
          : totalExpense > 0
          ? 100
          : 0;

      return {
        id: w.id,
        name: w.name,
        type: w.type,
        color: w.color || "#4F46E5",
        balance: Number(w.balance || 0),
        income: totalIncome,
        expense: totalExpense,
        ratio,
      };
    });
  }, [wallets, filteredTransactions, filteredTransfers]);

  const periodPercentageChange = useMemo(() => {
    const now = dayjs();
    let currentStart, currentEnd, prevStart, prevEnd;

    if (activePeriod === "Minggu") {
      currentStart = now.startOf("week");
      currentEnd = now.endOf("week");
      prevStart = now.subtract(1, "week").startOf("week");
      prevEnd = now.subtract(1, "week").endOf("week");
    } else if (activePeriod === "Bulan") {
      currentStart = now.startOf("month");
      currentEnd = now.endOf("month");
      prevStart = now.subtract(1, "month").startOf("month");
      prevEnd = now.subtract(1, "month").endOf("month");
    } else if (activePeriod === "3 Bulan") {
      currentStart = now.subtract(3, "month");
      currentEnd = now;
      prevStart = now.subtract(6, "month");
      prevEnd = now.subtract(3, "month");
    } else if (activePeriod === "Tahun") {
      currentStart = now.startOf("year");
      currentEnd = now.endOf("year");
      prevStart = now.subtract(1, "year").startOf("year");
      prevEnd = now.subtract(1, "year").endOf("year");
    } else {
      return null;
    }

    const currentTotal = transactions
      .filter((tx) => {
        const d = dayjs(tx.date);
        return tx.type === activeType && d.isAfter(currentStart) && d.isBefore(currentEnd);
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    const prevTotal = transactions
      .filter((tx) => {
        const d = dayjs(tx.date);
        return tx.type === activeType && d.isAfter(prevStart) && d.isBefore(prevEnd);
      })
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

    if (prevTotal === 0) {
      return currentTotal > 0 ? { value: 100, isPositive: true } : { value: 0, isPositive: true };
    }

    const pct = ((currentTotal - prevTotal) / prevTotal) * 100;
    return {
      value: Math.abs(Math.round(pct)),
      isPositive: pct >= 0
    };
  }, [transactions, activePeriod, activeType]);

  const aiInsight = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return {
        text: "Belum ada data transaksi periode ini. Catat transaksi baru untuk mendapatkan insight analisis finansial dari AI!",
        category: "Umum",
      };
    }

    const expenseTransactions = filteredTransactions.filter(t => t.type === "EXPENSE");
    if (expenseTransactions.length === 0) {
      return {
        text: "Luar biasa! Anda belum memiliki pengeluaran di periode ini. Pertahankan pengelolaan arus kas positif Anda!",
        category: "Umum",
      };
    }

    // Find highest expense category
    const categories = categorySummary.list;
    if (categories.length > 0) {
      const topCat = categories[0];
      const topCatName = topCat.name;
      const topCatAmount = topCat.amount;
      const topCatPercentage = topCat.percentage.toFixed(0);

      if (topCatPercentage > 40) {
        return {
          text: `Kategori "${topCatName}" mendominasi pengeluaran Anda sebesar ${topCatPercentage}% (${formatCurrency(topCatAmount)}). Pertimbangkan untuk membatasi pengeluaran kategori ini agar anggaran bulanan tetap aman.`,
          category: topCatName,
        };
      } else {
        return {
          text: `Pengeluaran terbesar Anda ada pada "${topCatName}" sebesar ${formatCurrency(topCatAmount)} (${topCatPercentage}% dari total). Pembagian alokasi pengeluaran Anda sudah cukup merata.`,
          category: topCatName,
        };
      }
    }

    return {
      text: "Arus kas Anda terpantau stabil. Pastikan untuk selalu menyisihkan minimal 10% pemasukan ke tabungan darurat.",
      category: "Umum",
    };
  }, [filteredTransactions, categorySummary]);

  return (
    <>
      {/* MOBILE LAYOUT */}
      <div className="block lg:hidden min-h-screen text-[var(--text-primary)] -mx-4 -mt-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : (
          <>
            {/* Top AppBar Mobile */}
            <header className="sticky top-0 z-40 bg-[var(--card-bg)]/80 backdrop-blur-xl px-4 py-4 flex justify-between items-center border-b border-[var(--border-color)]/30 mb-4 transition-all">
              <h1 className="text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Statistik</h1>
              <button 
                onClick={() => navigate("/export")}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)]/30 transition-colors cursor-pointer shrink-0"
              >
                <LucideIcons.SlidersHorizontal className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </header>

            <div className="px-4 space-y-6">

            {/* Period Pills */}
            <section className="flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
              {["Minggu", "Bulan", "3 Bulan", "Tahun"].map((period) => {
                const isActive = activePeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => setActivePeriod(period)}
                    className={clsx(
                      "px-5 py-2 rounded-full font-semibold text-xs whitespace-nowrap transition-all duration-200 active:scale-95",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                    )}
                  >
                    {period}
                  </button>
                );
              })}
            </section>

            {/* Type Toggle */}
            <section className="flex bg-[var(--bg-tertiary)]/50 p-1 rounded-xl border border-[var(--border-color)]/30">
              {[
                { label: "Pemasukan", value: "INCOME" },
                { label: "Pengeluaran", value: "EXPENSE" }
              ].map((type) => {
                const isActive = activeType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => setActiveType(type.value)}
                    className={clsx(
                      "flex-1 py-2 text-center font-semibold text-xs rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm border border-[var(--border-color)]/50 font-bold"
                        : "text-[var(--text-secondary)] active:scale-[0.98]"
                    )}
                  >
                    {type.label}
                  </button>
                );
              })}
            </section>

            {/* Summary 3 Small Cards */}
            <section className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Masuk</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">
                  {formatCompactNumber(filteredIncome)}
                </span>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-500 mb-1">Keluar</span>
                <span className="text-lg font-bold text-rose-500 leading-none tabular-nums">
                  {formatCompactNumber(filteredExpense)}
                </span>
              </div>
              <div className="bg-indigo-600/10 border border-indigo-600/20 p-3 rounded-xl flex flex-col items-center">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Bersih</span>
                <span className={clsx(
                  "text-lg font-bold leading-none tabular-nums",
                  isNetPositive ? "text-indigo-600 dark:text-indigo-400" : "text-rose-500"
                )}>
                  {isNetPositive ? "+" : ""}{formatCompactNumber(netValue)}
                </span>
              </div>
            </section>

            {/* Bar Chart: Perbandingan Arus Kas */}
            <section className="bg-[var(--card-bg)] border border-[var(--border-color)]/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
              <div 
                className="absolute top-0 right-0 w-16 h-16 text-[var(--border-color)]/10 opacity-40 pointer-events-none"
                style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 8px)" }}
              />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-[var(--text-primary)]">Perbandingan Arus Kas</h3>
                <LucideIcons.Info className="w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <div className="flex items-end justify-between h-40 gap-2 px-1 overflow-x-auto scrollbar-none">
                {barChartData.length === 0 ? (
                  <div className="flex items-center justify-center w-full h-full text-xs text-[var(--text-tertiary)]">
                    Tidak ada data
                  </div>
                ) : (
                  barChartData.map((item, idx) => {
                    const maxVal = Math.max(...barChartData.map(d => Math.max(d.Pemasukan, d.Pengeluaran))) || 1;
                    const incomeHeight = `${Math.max(4, Math.round((item.Pemasukan / maxVal) * 70))}px`;
                    const expenseHeight = `${Math.max(4, Math.round((item.Pengeluaran / maxVal) * 70))}px`;

                    return (
                      <div key={idx} className="flex-1 min-w-[24px] flex flex-col items-center gap-1 group relative">
                        <div className="w-full flex flex-col items-center gap-0.5">
                          <div 
                            className="w-full bg-emerald-500 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-600 cursor-pointer" 
                            style={{ height: incomeHeight }}
                            title={`Masuk: ${formatCurrency(item.Pemasukan)}`}
                          />
                          <div 
                            className="w-full bg-rose-500 rounded-b-sm transition-all duration-300 group-hover:bg-rose-600 cursor-pointer" 
                            style={{ height: expenseHeight }}
                            title={`Keluar: ${formatCurrency(item.Pengeluaran)}`}
                          />
                        </div>
                        <span className="text-[9px] text-[var(--text-tertiary)] truncate w-full text-center">
                          {item.name}
                        </span>
                        {/* Interactive Tooltip on hover */}
                        <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50">
                          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-[10px] rounded-lg p-2 shadow-lg whitespace-nowrap">
                            <p className="font-bold border-b border-[var(--border-color)] pb-1 mb-1 text-center">{item.name}</p>
                            <p className="text-emerald-600 dark:text-emerald-400">Masuk: {formatCurrency(item.Pemasukan)}</p>
                            <p className="text-rose-500">Keluar: {formatCurrency(item.Pengeluaran)}</p>
                          </div>
                          <div className="w-2 h-2 bg-[var(--bg-secondary)] border-r border-b border-[var(--border-color)] rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Donut Chart: Distribusi Pengeluaran / Pemasukan */}
            <section className="bg-[var(--card-bg)] border border-[var(--border-color)]/50 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-[var(--text-primary)] mb-6">
                Distribusi {activeType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
              </h3>
              {categorySummary.list.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--text-tertiary)]">
                  Tidak ada data {activeType === "INCOME" ? "pemasukan" : "pengeluaran"} di periode ini
                </div>
              ) : (
                <>
                  <div className="flex justify-center items-center relative mb-8">
                    {/* SVG Donut */}
                    <svg className="w-48 h-48 -rotate-90">
                      <circle 
                        className="text-[var(--bg-tertiary)]" 
                        cx="96" 
                        cy="96" 
                        fill="transparent" 
                        r="80" 
                        stroke="currentColor" 
                        strokeWidth="14"
                      />
                      {(() => {
                        let currentOffsetAccumulator = 0;
                        return categorySummary.list.map((cat, index) => {
                          const strokeLength = (cat.percentage / 100) * 502.655;
                          const strokeOffset = -currentOffsetAccumulator;
                          currentOffsetAccumulator += strokeLength;
                          return (
                            <circle
                              key={cat.id}
                              cx="96"
                              cy="96"
                              fill="transparent"
                              r="80"
                              stroke={cat.color}
                              strokeWidth="14"
                              strokeDasharray={`${strokeLength} 502.655`}
                              strokeDashoffset={strokeOffset}
                              strokeLinecap="round"
                              className="transition-all duration-500 hover:stroke-[16px] cursor-pointer"
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest">Total</span>
                      <span className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5 tabular-nums">
                        {formatCurrency(categorySummary.total)}
                      </span>
                    </div>
                  </div>

                  {/* Legend with Progress Bars */}
                  <div className="space-y-4">
                    {categorySummary.list.map((cat) => (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-[var(--text-primary)]">{cat.name}</span>
                          </div>
                          <span className="text-[var(--text-primary)] font-bold tabular-nums">{cat.percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Area Chart: Tren Akumulasi */}
            <section className="bg-[var(--card-bg)] border border-[var(--border-color)]/50 rounded-xl p-4 shadow-sm overflow-hidden relative">
              <h3 className="text-xs font-bold text-[var(--text-primary)] mb-2">Tren Akumulasi</h3>
              <p className="text-[10px] text-[var(--text-tertiary)] mb-6">Pertumbuhan saldo bersih dalam 30 hari terakhir</p>
              <div className="h-40 w-full relative">
                {trendData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-[var(--text-tertiary)]">
                    Tidak ada data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="mobileColorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeType === "EXPENSE" ? "#EF4444" : "#10B981"} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={activeType === "EXPENSE" ? "#EF4444" : "#10B981"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--text-tertiary)" 
                        fontSize={9} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis
                        stroke="var(--text-tertiary)"
                        fontSize={8}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatCompactNumber(v)}
                      />
                      <Tooltip 
                        content={<CustomTrendTooltip isYearly={activePeriod === "Tahun"} activeType={activeType} />} 
                        cursor={{ stroke: "var(--border-color)", strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Akumulasi"
                        stroke={activeType === "EXPENSE" ? "#EF4444" : "#10B981"}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#mobileColorTrend)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                <div className="absolute top-2 right-2 bg-indigo-600/10 border border-indigo-600/20 px-2 py-1 rounded text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {periodPercentageChange 
                    ? `${periodPercentageChange.isPositive ? "+" : "-"}${periodPercentageChange.value}%`
                    : "+0%"}
                </div>
              </div>
            </section>

            {/* Wallet Activity */}
            <section className="pb-6">
              <h3 className="text-xs font-bold text-[var(--text-primary)] mb-4">Aktivitas Dompet</h3>
              <div className="grid grid-cols-2 gap-4">
                {walletSummaries.map((w) => {
                  const WalletIcon = walletIconMap[w.type] || Banknote;
                  return (
                    <div key={w.id} className="bg-[var(--card-bg)] border border-[var(--border-color)]/50 p-4 rounded-xl shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${w.color}15` }}
                        >
                          <WalletIcon className="w-4.5 h-4.5" style={{ color: w.color }} />
                        </div>
                        <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{w.name}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">{w.ratio.toFixed(0)}%</span>
                          <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums">{formatCompactNumber(w.balance)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min(w.ratio, 100)}%`, 
                              backgroundColor: w.color 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
            </div>
          </>
        )}
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block animate-fade-slide-up pb-24 max-w-container-max mx-auto space-y-6">
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Statistik</h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">Analisis mendalam pengeluaran dan arus kas Anda</p>
          </div>
          <button
            onClick={() => navigate("/export")}
            className="bg-[var(--card-bg)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-color)] px-4 py-2.5 rounded-xl flex items-center gap-2 font-semibold text-xs transition-colors cursor-pointer shadow-sm animate-pulse-glow"
          >
            <LucideIcons.FileDown className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
            <span>Laporan PDF</span>
          </button>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-5 flex flex-col space-y-6">
              
              {/* Period & Type Toggles */}
              <div className="flex flex-col space-y-4">
                {/* Period Toggle */}
                <div className="bg-[var(--bg-tertiary)] dark:bg-slate-800/80 p-1 rounded-xl flex">
                  {["Minggu", "Bulan", "3 Bulan", "Tahun"].map((period) => {
                    const isActive = activePeriod === period;
                    return (
                      <button
                        key={period}
                        onClick={() => setActivePeriod(period)}
                        className={clsx(
                          "flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer text-center",
                          isActive
                            ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm font-bold"
                            : "text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400"
                        )}
                      >
                        {period}
                      </button>
                    );
                  })}
                </div>

                {/* Type Toggle */}
                <div className="bg-[var(--bg-tertiary)] dark:bg-slate-800/80 p-1 rounded-xl flex">
                  {[
                    { label: "Pemasukan", value: "INCOME", color: "bg-emerald-500" },
                    { label: "Pengeluaran", value: "EXPENSE", color: "bg-rose-500" }
                  ].map((type) => {
                    const isActive = activeType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setActiveType(type.value)}
                        className={clsx(
                          "flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5",
                          isActive
                            ? "bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm font-bold"
                            : "text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400"
                        )}
                      >
                        <span className={clsx("w-2 h-2 rounded-full shrink-0", type.color)} />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bento-card p-4 rounded-xl border-l-4 border-l-emerald-500 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Pemasukan</p>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums truncate" title={formatCurrency(filteredIncome)}>
                    {formatCompactNumber(filteredIncome)}
                  </h4>
                </div>
                <div className="bento-card p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Pengeluaran</p>
                  <h4 className="text-xs sm:text-sm md:text-base font-bold text-red-500 dark:text-red-400 tabular-nums truncate" title={formatCurrency(filteredExpense)}>
                    {formatCompactNumber(filteredExpense)}
                  </h4>
                </div>
                <div className="bento-card p-4 rounded-xl border-l-4 border-l-indigo-600 dark:border-l-indigo-400 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Selisih</p>
                  <h4 className={clsx(
                    "text-xs sm:text-sm md:text-base font-bold tabular-nums truncate",
                    isNetPositive ? "text-indigo-600 dark:text-indigo-400" : "text-red-500 dark:text-red-400"
                  )} title={formatCurrency(netValue)}>
                    {isNetPositive ? "+" : ""}{formatCompactNumber(netValue)}
                  </h4>
                </div>
              </div>

              {/* Donut Chart & Legend */}
              <div className="bento-card p-6 rounded-2xl flex flex-col items-center">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] w-full mb-6">
                  Distribusi {activeType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                </h3>

                {categorySummary.list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center w-full">
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Tidak ada {activeType === "INCOME" ? "pemasukan" : "pengeluaran"} di periode ini
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySummary.list}
                            dataKey="amount"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={70}
                            paddingAngle={2}
                          >
                            {categorySummary.list.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [formatCurrency(value), activeType === "INCOME" ? "Pemasukan" : "Pengeluaran"]}
                            contentStyle={{
                              backgroundColor: "var(--card-bg)",
                              borderColor: "var(--border-color)",
                              color: "var(--text-primary)",
                              borderRadius: "0.75rem",
                              fontSize: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">Total</p>
                        <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] mt-0.5 tabular-nums">
                          {formatCompactNumber(categorySummary.total)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full">
                      {categorySummary.list.slice(0, 4).map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2 min-w-0">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                          <span className="text-[10px] text-[var(--text-secondary)] font-medium truncate" title={cat.name}>
                            {cat.name} ({cat.percentage.toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Category Detail List */}
              <div className="bento-card p-6 rounded-2xl flex flex-col space-y-5">
                <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Detail Kategori</h3>
                
                {categorySummary.list.length === 0 ? (
                  <div className="text-center py-6 text-xs text-[var(--text-tertiary)]">
                    Belum ada transaksi kategori
                  </div>
                ) : (
                  <div className="space-y-4">
                    {categorySummary.list.slice(0, 4).map((cat) => {
                      const CatIcon = LucideIcons[cat.icon] || LucideIcons.Tag;
                      return (
                        <div key={cat.id} className="flex items-center gap-3">
                          <div 
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: `${cat.color}15` }}
                          >
                            <CatIcon className="w-5 h-5" style={{ color: cat.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between mb-1 text-xs font-semibold">
                              <span className="text-[var(--text-primary)] truncate pr-2">{cat.name}</span>
                              <span className="text-[var(--text-tertiary)] tabular-nums shrink-0">{formatCurrency(cat.amount)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--bg-tertiary)] dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${cat.percentage}%`,
                                  backgroundColor: cat.color
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button 
                  onClick={() => navigate("/categories")}
                  className="w-full text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 pt-2 transition-colors cursor-pointer"
                >
                  Lihat Semua Kategori
                </button>
              </div>

            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-7 flex flex-col space-y-6">
              
              {/* Comparison Bar Chart */}
              <div className="bento-card p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Perbandingan Arus Kas</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 rounded-sm bg-[#3525cd]"></div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Masuk</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 rounded-sm bg-[#ffc329]"></div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Keluar</span>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barMasuk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#3525cd" />
                        </linearGradient>
                        <linearGradient id="barKeluar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffdf9f" />
                          <stop offset="100%" stopColor="#ffc329" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--text-tertiary)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis
                        stroke="var(--text-tertiary)"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatCompactNumber(v)}
                      />
                      <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "var(--bg-tertiary)", opacity: 0.15 }} />
                      <Bar
                        dataKey="Pemasukan"
                        name="Masuk"
                        fill="url(#barMasuk)"
                        radius={[4, 4, 0, 0]}
                        barSize={activePeriod === "Bulan" ? 5 : 12}
                      />
                      <Bar
                        dataKey="Pengeluaran"
                        name="Keluar"
                        fill="url(#barKeluar)"
                        radius={[4, 4, 0, 0]}
                        barSize={activePeriod === "Bulan" ? 5 : 12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Accumulation Area Chart */}
              <div className="bento-card p-6 rounded-2xl relative overflow-hidden">
                <div className="z-10 relative mb-4">
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mb-1">Tren Akumulasi</h3>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {periodPercentageChange 
                      ? `${periodPercentageChange.isPositive ? "+" : "-"}${periodPercentageChange.value}% dibanding ${
                          activePeriod === "Minggu" ? "minggu" : activePeriod === "Bulan" ? "bulan" : activePeriod === "3 Bulan" ? "3 bulan" : "tahun"
                        } lalu`
                      : "+0% dibanding periode lalu"}
                  </p>
                </div>

                <div className="h-40 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeType === "EXPENSE" ? "#EF4444" : "#10B981"} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={activeType === "EXPENSE" ? "#EF4444" : "#10B981"} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="var(--text-tertiary)" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                      />
                      <YAxis
                        stroke="var(--text-tertiary)"
                        fontSize={9}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatCompactNumber(v)}
                      />
                      <Tooltip 
                        content={<CustomTrendTooltip isYearly={activePeriod === "Tahun"} activeType={activeType} />} 
                        cursor={{ stroke: "var(--border-color)", strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Akumulasi"
                        stroke={activeType === "EXPENSE" ? "#EF4444" : "#10B981"}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorTrend)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Wallet Activity Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletSummaries.map((w) => {
                  const WalletIcon = walletIconMap[w.type] || Banknote;
                  
                  const growthText = w.income > w.expense 
                    ? `+${((w.income - w.expense) / (w.balance || 1) * 100).toFixed(1)}% periode ini` 
                    : w.expense > 0 
                    ? `-${(w.expense / (w.balance || 1) * 100).toFixed(1)}% periode ini` 
                    : "0% periode ini";

                  const isPositive = w.income >= w.expense;

                  return (
                    <div key={w.id} className="bento-card p-5 rounded-2xl flex flex-col justify-between min-h-[160px] relative overflow-hidden group hover:shadow-md transition-all duration-300">
                      {/* Subtle decorative glow of the wallet's custom color in the background */}
                      <div 
                        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.03] dark:opacity-[0.06] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.1] blur-2xl transition-opacity pointer-events-none"
                        style={{ backgroundColor: w.color }}
                      />
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                              style={{ backgroundColor: `${w.color}15` }}
                            >
                              <WalletIcon className="w-5 h-5" style={{ color: w.color }} />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">{w.name}</span>
                          </div>
                          <button 
                            onClick={() => navigate("/wallets")}
                            className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          >
                            <LucideIcons.MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Saldo Tersedia</p>
                        <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-1.5 tabular-nums">
                          {formatCurrency(w.balance)}
                        </h4>
                      </div>
                      
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-medium">
                          <span>Rasio Keluar</span>
                          <span className="font-bold text-[var(--text-primary)] tabular-nums">{w.ratio.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)] dark:bg-slate-700 overflow-hidden">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all duration-500",
                              w.ratio > 100
                                ? "bg-rose-600"
                                : w.ratio > 80
                                ? "bg-rose-500"
                                : w.ratio > 50
                                ? "bg-amber-500"
                                : "bg-indigo-600"
                            )}
                            style={{ width: `${Math.min(w.ratio, 100)}%` }}
                          />
                        </div>
                        <div className={clsx(
                          "flex items-center space-x-1 text-[10px] font-semibold",
                          isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                        )}>
                          {isPositive ? (
                            <LucideIcons.TrendingUp className="w-3 h-3" />
                          ) : (
                            <LucideIcons.TrendingDown className="w-3 h-3" />
                          )}
                          <span>{growthText}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default StatisticsPage;
