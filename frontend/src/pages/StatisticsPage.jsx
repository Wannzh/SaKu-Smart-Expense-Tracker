import { memo, useState, useEffect, useCallback, useMemo } from "react";
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

  return (
    <div className="animate-fade-slide-up pb-24">
      {/* Header & Date Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Statistik</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Analisis keuanganmu</p>
        </div>
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[var(--card-bg)] border border-[var(--border-color)] p-1 rounded-full">
          {["Minggu", "Bulan", "3 Bulan", "Tahun"].map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={clsx(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activePeriod === period
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-indigo-600 hover:bg-[var(--bg-primary)]"
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle Pemasukan/Pengeluaran */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setActiveType("INCOME")}
          className={clsx(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer border",
            activeType === "INCOME"
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500"
              : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent"
          )}
        >
          Pemasukan
        </button>
        <button
          onClick={() => setActiveType("EXPENSE")}
          className={clsx(
            "rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer border",
            activeType === "EXPENSE"
              ? "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500"
              : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent"
          )}
        >
          Pengeluaran
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* SECTION 1: Period Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Income Card */}
            <div
              className={clsx(
                "rounded-2xl border p-5 transition-all duration-200",
                activeType === "INCOME"
                  ? "border-emerald-500 bg-emerald-500/[0.03] shadow-md dark:bg-emerald-500/[0.02]"
                  : "border-[var(--border-color)] bg-[var(--card-bg)] hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Pemasukan
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatCurrency(filteredIncome)}
              </p>
            </div>

            {/* Expense Card */}
            <div
              className={clsx(
                "rounded-2xl border p-5 transition-all duration-200",
                activeType === "EXPENSE"
                  ? "border-red-500 bg-red-500/[0.03] shadow-md dark:bg-red-500/[0.02]"
                  : "border-[var(--border-color)] bg-[var(--card-bg)] hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Pengeluaran
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500">
                  <TrendingDown className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xl font-bold text-red-500 dark:text-red-400 tabular-nums">
                {formatCurrency(filteredExpense)}
              </p>
            </div>

            {/* Net Card */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Selisih
                </span>
                <div
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isNetPositive
                      ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500"
                      : "bg-red-50 dark:bg-red-950/30 text-red-500"
                  )}
                >
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <p
                className={clsx(
                  "text-xl font-bold tabular-nums",
                  isNetPositive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-red-500 dark:text-red-400"
                )}
              >
                {isNetPositive ? "+" : ""}
                {formatCurrency(netValue)}
              </p>
            </div>
          </div>

          {/* SECTION 2: Income vs Expense Bar Chart */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarIcon className="h-4 w-4 text-indigo-500" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Perbandingan Arus Kas
              </h2>
            </div>
            <div className="h-[200px] lg:h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--text-tertiary)"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCompactNumber(v)}
                  />
                  <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "var(--bg-tertiary)", opacity: 0.15 }} />
                  <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                  <Bar
                    dataKey="Pemasukan"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    barSize={activePeriod === "Bulan" ? 6 : 12}
                  />
                  <Bar
                    dataKey="Pengeluaran"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                    barSize={activePeriod === "Bulan" ? 6 : 12}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Grid for Donut Chart & Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SECTION 3: Category Donut Chart & List (Redesigned) */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <PieIcon className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-base font-bold text-[var(--text-primary)]">
                    Distribusi {activeType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </h2>
                </div>

                {categorySummary.list.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-sm text-[var(--text-tertiary)]">
                      Tidak ada {activeType === "INCOME" ? "pemasukan" : "pengeluaran"} di periode ini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Top Part: Donut Chart + Legend */}
                    <div className="flex flex-col md:flex-row items-center justify-center md:justify-around gap-6">
                      {/* Left: Donut Chart */}
                      <div className="relative h-[180px] w-[180px] shrink-0 flex items-center justify-center">
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
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none w-[100px]">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] leading-tight">
                            Total
                          </p>
                          <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5 truncate leading-tight tabular-nums" title={formatCurrency(categorySummary.total)}>
                            {formatCompactNumber(categorySummary.total)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Legend */}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3 w-full max-w-xs">
                        {categorySummary.list.slice(0, 6).map((cat) => (
                          <div key={cat.id} className="flex items-center gap-2 text-xs">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="truncate text-[var(--text-primary)] font-medium max-w-[100px] md:max-w-none">
                              {cat.name}
                            </span>
                            <span className="text-[var(--text-tertiary)] font-bold tabular-nums">
                              ({cat.percentage.toFixed(0)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-[var(--border-color)]" />

                    {/* Bottom Part: Category list with Progress bars */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                        Rincian Kategori
                      </h3>
                      <div className="space-y-3.5">
                        {categorySummary.list.map((cat) => {
                          const CatIcon = LucideIcons[cat.icon] || LucideIcons.Tag;
                          return (
                            <div key={cat.id} className="flex items-center gap-4">
                              {/* Dynamic Icon */}
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                                style={{ backgroundColor: `${cat.color}15` }}
                              >
                                <CatIcon className="h-4.5 w-4.5" style={{ color: cat.color }} />
                              </div>

                              {/* Progress bar and text details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] mb-1">
                                  <span className="truncate">{cat.name}</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${cat.percentage}%`,
                                      backgroundColor: cat.color,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Percentage and Amount */}
                              <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                                  {cat.percentage.toFixed(0)}%
                                </p>
                                <p className="text-[10px] text-[var(--text-tertiary)] font-semibold tabular-nums mt-0.5">
                                  {formatCurrency(cat.amount)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Expense Trend Line/Area Chart */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendIcon className="h-4 w-4 text-indigo-500" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Tren Akumulasi {activeType === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
                </h2>
              </div>
              <div className="h-[200px] lg:h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--text-tertiary)"
                      fontSize={10}
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
          </div>

          {/* SECTION 5: Wallet Activity Summary List */}
          <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
            <div className="flex items-center gap-2 mb-4">
              <WalletActivityIcon className="h-4 w-4 text-indigo-500" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Aktivitas Dompet & Rekening
              </h2>
            </div>

            {walletSummaries.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-[var(--text-tertiary)]">Tidak ada dompet terdaftar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletSummaries.map((w) => {
                  const WalletIcon = walletIconMap[w.type] || Banknote;
                  return (
                    <div
                      key={w.id}
                      className="border border-[var(--border-color)] bg-[var(--bg-primary)] rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: w.color }}
                          >
                            <WalletIcon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {w.name}
                            </h3>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">
                              {w.type === "cash" ? "Tunai" : w.type === "bank" ? "Bank" : "E-Wallet"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                            {formatCurrency(w.balance)}
                          </p>
                          <span className="text-[10px] text-[var(--text-tertiary)] font-medium">
                            Saldo Saat Ini
                          </span>
                        </div>
                      </div>

                      {/* Cashflow Summary */}
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3 border-t border-[var(--border-color)] pt-3">
                        <div>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-medium mb-0.5">
                            Dana Masuk
                          </p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +{formatCurrency(w.income)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-medium mb-0.5">
                            Dana Keluar
                          </p>
                          <p className="font-bold text-red-500 dark:text-red-400 tabular-nums">
                            -{formatCurrency(w.expense)}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar of Outflow/Inflow Ratio */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-[var(--text-secondary)] font-medium">Rasio Pengeluaran</span>
                          <span className="font-bold text-[var(--text-primary)] tabular-nums">
                            {w.ratio.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                          <div
                            className={clsx(
                              "h-full rounded-full transition-all duration-500",
                              w.ratio > 100
                                ? "bg-red-600"
                                : w.ratio > 80
                                ? "bg-red-500"
                                : w.ratio > 50
                                ? "bg-amber-500"
                                : "bg-indigo-600"
                            )}
                            style={{ width: `${Math.min(w.ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default StatisticsPage;
