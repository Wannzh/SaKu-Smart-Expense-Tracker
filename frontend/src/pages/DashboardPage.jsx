import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTransaction } from "../hooks/useTransaction";
import { useWallet } from "../hooks/useWallet";
import { useTheme } from "../hooks/useTheme";
import TransactionDetail from "../components/transaction/TransactionDetail";
import TransactionForm from "../components/transaction/TransactionForm";
import { useTransfer } from "../hooks/useTransfer";
import { formatCurrency, cleanDescription } from "../utils/format";
import { LIGHT_CARD_GRADIENTS, DARK_CARD_GRADIENTS } from "../utils/constants";
import { useBudget } from "../hooks/useBudget";
import { useBill } from "../hooks/useBill";
import UserAvatar from "../components/common/UserAvatar";
import * as LucideIcons from "lucide-react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  MessageSquare,
  PieChart,
  RefreshCw,
  ScanLine,
  Smartphone,
  Star,
  Target,
  Bell,
  Sparkles,
  Filter,
  MoreHorizontal,
  ReceiptText,
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import toast from "react-hot-toast";

dayjs.extend(isoWeek);

// ─── Period filter tabs ──────────────────────────────────────
const PERIODS = ["Hari", "Minggu", "Bulan", "Tahun", "Semua"];

// ─── Menu items (Section 2) ─────────────────────────────────
const menuItems = [
  { label: "Anggaran",   icon: PieChart,       color: "#F97316", available: true, path: "/budget" },
  { label: "Berulang",   icon: RefreshCw,      color: "#3B82F6", available: true, path: "/recurring" },
  { label: "Keinginan",  icon: Star,           color: "#FBBF24", available: true, path: "/wishlist" },
  { label: "Tagihan",    icon: ReceiptText,    color: "#EF4444", available: true, path: "/bills" },
  { label: "Utang",      icon: CreditCard,     color: "#8B5CF6", available: true, path: "/debts" },
  { label: "Scan Struk", icon: ScanLine,       color: "#06B6D4", available: true, path: "/scan" },
  { label: "Chat AI",    icon: MessageSquare,  color: "#4F46E5", available: true, path: "/chat", isAI: true },
  { label: "Kartu",      icon: CreditCard,     color: "#3525cd", available: true, path: "/cards" },
];

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENT: BUDGET CARD
// ═══════════════════════════════════════════════════════════════
const BudgetCard = memo(function BudgetCard({ activePeriod, filteredTransactions = [], onNavigate }) {
  const { budgets, getBudgets } = useBudget();

  useEffect(() => {
    const now = dayjs();
    getBudgets(now.month() + 1, now.year());
  }, [getBudgets]);

  const handleClick = useCallback(() => {
    onNavigate("/budget");
  }, [onNavigate]);

  const computedBudgets = useMemo(() => {
    const daysInMonth = dayjs().daysInMonth();

    return budgets.map((b) => {
      const monthlyLimit = Number(b.amount);
      let limit = monthlyLimit;

      if (activePeriod === "Hari") {
        limit = monthlyLimit / daysInMonth;
      } else if (activePeriod === "Minggu") {
        limit = (monthlyLimit * 7) / daysInMonth;
      } else if (activePeriod === "Bulan") {
        limit = monthlyLimit;
      } else if (activePeriod === "Tahun") {
        limit = monthlyLimit * 12;
      } else if (activePeriod === "Semua") {
        limit = monthlyLimit;
      }

      const spent = filteredTransactions
        .filter((tx) => tx.type === "EXPENSE" && tx.categoryId === b.categoryId)
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

      return {
        ...b,
        limit,
        spent,
        percentage,
      };
    });
  }, [budgets, activePeriod, filteredTransactions]);

  const topBudgets = useMemo(() => {
    return [...computedBudgets]
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 3);
  }, [computedBudgets]);

  const totalLimit = computedBudgets.reduce((sum, b) => sum + Number(b.limit || 0), 0);
  const totalSpent = computedBudgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);
  const percentage = totalLimit > 0 ? Math.min(100, Math.round((totalSpent / totalLimit) * 100)) : 0;
  const totalRemaining = Math.max(0, totalLimit - totalSpent);

  if (budgets.length === 0) {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--border-color)]/30 rounded-2xl p-5 text-left border-l-4 border-l-indigo-500 transition-all hover:shadow-md cursor-pointer group"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/20">
          <PieChart className="h-5 w-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)]">Anggaran Bulanan</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            Belum ada anggaran. Ketuk untuk membuat!
          </p>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile view */}
      <div
        onClick={handleClick}
        className="lg:hidden w-full bg-[var(--card-bg)] border border-[var(--border-color)]/30 rounded-2xl p-5 border-l-4 border-l-indigo-500 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <PieChart className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">Anggaran Bulanan</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{percentage}% telah digunakan</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-extrabold text-[var(--text-primary)] tabular-nums">{formatCurrency(totalRemaining)}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">tersisa</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              percentage < 50
                ? "bg-emerald-500"
                : percentage <= 80
                ? "bg-amber-500"
                : percentage <= 100
                ? "bg-orange-500"
                : "bg-red-500"
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Desktop view */}
      <div
        onClick={handleClick}
        className="hidden lg:flex w-full bg-[var(--card-bg)] border border-[var(--border-color)]/30 rounded-2xl p-6 text-left transition-all hover:shadow-md cursor-pointer group flex-col gap-3"
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/20">
              <PieChart className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Anggaran Bulanan</p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                Klik untuk detail anggaran
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors" />
        </div>

        <div className="space-y-3 pt-1 w-full">
          {topBudgets.map((budget) => {
            const Icon = LucideIcons[budget.category.icon] || LucideIcons.Tag;
            const isOver = budget.percentage > 100;
            return (
              <div key={budget.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs select-none">
                  <div className="flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: budget.category.color }} />
                    <span>{budget.category.name}</span>
                  </div>
                  <span className={clsx("font-bold", isOver ? "text-red-500" : "text-[var(--text-primary)]")}>
                    {budget.percentage}%
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={clsx(
                      "h-1.5 rounded-full transition-all duration-500",
                      budget.percentage < 50
                        ? "bg-emerald-500"
                        : budget.percentage <= 80
                        ? "bg-amber-500"
                        : budget.percentage <= 100
                        ? "bg-orange-500"
                        : "bg-red-500"
                    )}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--text-tertiary)] font-bold mt-0.5 select-none font-bold">
                  <span>{formatCurrency(budget.spent)}</span>
                  <span>{formatCurrency(budget.limit)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT: DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
const walletTypeLabels = { cash: "CASH", bank: "BANK", ewallet: "EWALLET" };
const walletIcons = { cash: Banknote, bank: Building2, ewallet: Smartphone };

const DashboardPage = memo(function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, getTransactions, updateTransaction, deleteTransaction } = useTransaction();
  const { transfers, getTransfers, deleteTransfer } = useTransfer();
  const { wallets, getWallets } = useWallet();
  const { fetchBills, summary } = useBill();

  const unpaidCount = summary.countUnpaid || 0;

  const [activePeriod, setActivePeriod] = useState("Bulan");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const { resolvedTheme, cardStyle } = useTheme();

  const activeGradient = useMemo(() => {
    const list = resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS;
    const index = Math.min(Math.max(0, cardStyle), list.length - 1);
    return list[index] || { from: "#4F46E5", to: "#818CF8" };
  }, [resolvedTheme, cardStyle]);

  const mobileMenuItems = useMemo(() => [
    { label: "Anggaran", icon: LucideIcons.PieChart, color: "#F97316", bg: "rgba(249, 115, 22, 0.12)", path: "/budget", available: true },
    { label: "Utang", icon: LucideIcons.CreditCard, color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)", path: "/debts", available: true },
    { label: "Statistik", icon: LucideIcons.BarChart2, color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)", path: "/statistics", available: true },
    { label: "Berulang", icon: LucideIcons.RefreshCw, color: "#06B6D4", bg: "rgba(6, 182, 212, 0.12)", path: "/recurring", available: true },
    { label: "Keinginan", icon: LucideIcons.Star, color: "#FBBF24", bg: "rgba(251, 191, 36, 0.12)", path: "/wishlist", available: true },
    { label: "Tagihan", icon: LucideIcons.ReceiptText || LucideIcons.Receipt, color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)", path: "/bills", available: true },
    { label: "Scan Struk", icon: LucideIcons.ScanLine, color: "#10B981", bg: "rgba(16, 185, 129, 0.12)", path: "/scan", available: true },
    { label: "Kartu", icon: LucideIcons.CreditCard, color: "#6B7280", bg: "rgba(107, 114, 128, 0.12)", path: "/cards", available: true },
  ], []);

  const refreshData = useCallback(() => {
    getTransactions();
    getTransfers();
    getWallets();
    fetchBills();
  }, [getTransactions, getTransfers, getWallets, fetchBills]);

  // Fetch on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Listen to refresh-data event
  useEffect(() => {
    const handleRefresh = () => refreshData();
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, [refreshData]);

  // Merge transactions and transfers
  const allItems = useMemo(() => {
    const mappedTransfers = transfers.map((t) => ({ ...t, type: "TRANSFER" }));
    return [...transactions, ...mappedTransfers];
  }, [transactions, transfers]);

  // Total wallet balance
  const totalWalletBalance = useMemo(
    () => wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0),
    [wallets]
  );

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    const now = dayjs();
    const items = allItems;
    if (activePeriod === "Hari") return items.filter((tx) => dayjs(tx.date).isSame(now, "day"));
    if (activePeriod === "Minggu") return items.filter((tx) => dayjs(tx.date).isSame(now, "week"));
    if (activePeriod === "Bulan") return items.filter((tx) => dayjs(tx.date).isSame(now, "month"));
    if (activePeriod === "Tahun") return items.filter((tx) => dayjs(tx.date).isSame(now, "year"));
    return items; // "Semua"
  }, [allItems, activePeriod]);

  const { filteredIncome, filteredExpense } = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === "INCOME")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const expense = filteredTransactions
      .filter((tx) => tx.type === "EXPENSE")
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    return { filteredIncome: income, filteredExpense: expense };
  }, [filteredTransactions]);

  // Recent 5 transactions (filtered by period)
  const recentTransactions = useMemo(
    () =>
      [...filteredTransactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5),
    [filteredTransactions]
  );

  const handleNavigate = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handlePeriodChange = useCallback((period) => {
    setActivePeriod(period);
  }, []);

  const handleEdit = useCallback(async (data) => {
    if (editTarget) {
      await updateTransaction(editTarget.id, data);
      setEditTarget(null);
      getTransactions();
      getWallets();
    }
  }, [editTarget, updateTransaction, getTransactions, getWallets]);

  const handleDelete = useCallback(async (id) => {
    if (selectedTransaction?.type === "TRANSFER") {
      await deleteTransfer(id);
    } else {
      await deleteTransaction(id);
    }
    refreshData();
  }, [selectedTransaction, deleteTransaction, deleteTransfer, refreshData]);

  const handleOpenDetail = useCallback((tx) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  }, []);

  const firstName = user?.name?.split(" ")[0] || "User";

  return (
    <div className="space-y-6 pb-6 animate-fade-slide-up">
      {/* ─── MOBILE VIEW (lg:hidden) ─── */}
      <div className="block lg:hidden space-y-6 px-1">
        {/* Header Section */}
        <header className="pt-2 pb-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Selamat pagi,</p>
            <div className="flex items-center gap-2 mt-1">
              <img src="/saku.svg" className="w-8 h-8 object-contain dark:bg-white dark:rounded-md dark:p-0.5" alt="SaKu Logo" />
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Halo, {firstName}</h1>
            </div>
          </div>
          <div className="relative">
            <UserAvatar user={user} size="md" className="!w-12 !h-12 !text-base border-2 border-indigo-200 dark:border-indigo-900 shadow-sm" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[var(--card-bg)] rounded-full"></span>
          </div>
        </header>

        {/* Summary Card */}
        <section 
          className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.to})`
          }}
        >
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-200/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

          <div className="relative z-10 flex justify-between items-center mb-6">
            <div className="relative bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-2">
              <select
                value={activePeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer appearance-none pr-5 text-white"
                style={{ colorScheme: "dark" }}
              >
                {PERIODS.map((p) => (
                  <option key={p} value={p} className="text-slate-900 bg-white">
                    {p === "Hari" ? "Hari ini" : p === "Minggu" ? "Minggu ini" : p === "Bulan" ? "Bulan ini" : p === "Tahun" ? "Tahun ini" : "Semua"}
                  </option>
                ))}
              </select>
              <LucideIcons.ChevronDown className="h-3 w-3 absolute right-2.5 pointer-events-none text-white" />
            </div>
            <button 
              onClick={() => setShowBalance(!showBalance)}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform"
            >
              {showBalance ? (
                <LucideIcons.Eye className="h-5 w-5 text-white" />
              ) : (
                <LucideIcons.EyeOff className="h-5 w-5 text-white" />
              )}
            </button>
          </div>

          <div className="relative z-10 mb-6">
            <p className="text-xs text-indigo-100/80 mb-1">Total Saldo</p>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold opacity-80">Rp</span>
              <span className="text-3xl font-extrabold tracking-tight tabular-nums">
                {showBalance ? formatCurrency(totalWalletBalance).replace("Rp", "").trim() : "••••••"}
              </span>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                  <LucideIcons.ArrowDownLeft className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs opacity-80">Pemasukan</span>
              </div>
              <p className="font-bold text-sm tabular-nums truncate">
                {showBalance ? formatCurrency(filteredIncome) : "••••••"}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-300">
                  <LucideIcons.ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs opacity-80">Pengeluaran</span>
              </div>
              <p className="font-bold text-sm tabular-nums truncate">
                {showBalance ? formatCurrency(filteredExpense) : "••••••"}
              </p>
            </div>
          </div>
        </section>

        {/* Rekam Cepat */}
        <section>
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-1">Rekam Cepat</h2>
          <div className="flex justify-around items-center gap-4 bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-color)]/30 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => handleNavigate("/chat")}
                className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform cursor-pointer"
              >
                <LucideIcons.MessageSquare className="h-6 w-6" />
              </button>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">Chat AI</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => handleNavigate("/scan")}
                className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform cursor-pointer"
              >
                <LucideIcons.ScanLine className="h-6 w-6" />
              </button>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">Pindai</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => toast.success("Fitur suara segera hadir! 🎙️")}
                className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400 active:scale-95 transition-transform cursor-pointer"
              >
                <LucideIcons.Mic className="h-6 w-6" />
              </button>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">Suara</span>
            </div>
          </div>
        </section>

        {/* Menu Grid */}
        <section className="grid grid-cols-4 gap-y-6 gap-x-2 py-2">
          {mobileMenuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                onClick={() => {
                  if (item.available && item.path) {
                    handleNavigate(item.path);
                  } else if (item.label === "Kartu") {
                    toast.success("Fitur Kartu akan segera hadir! 🚀");
                  } else {
                    toast.success("Segera hadir! 🚀");
                  }
                }}
                className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform relative"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                  style={{ backgroundColor: item.bg, color: item.color }}
                >
                  <Icon className="h-5 w-5" />
                  {item.label === "Tagihan" && unpaidCount > 0 && (
                    <span className="absolute -top-1 -right-1 
                      w-5 h-5 bg-red-500 text-white text-[10px] 
                      font-black rounded-full flex items-center 
                      justify-center">
                      {unpaidCount > 9 ? "9+" : unpaidCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold text-[var(--text-secondary)] text-center truncate w-full px-0.5">
                  {item.label}
                </span>
              </div>
            );
          })}
        </section>

        {/* Budget Progress Tracker */}
        <BudgetCard
          activePeriod={activePeriod}
          filteredTransactions={filteredTransactions}
          onNavigate={handleNavigate}
        />

        {/* Recent Transactions */}
        <section className="space-y-3">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Transaksi Terakhir</h2>
            <button 
              onClick={() => handleNavigate("/transactions")}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => {
                const IconComponent = LucideIcons[tx.category?.icon] || LucideIcons.Tag;
                const catColor = tx.category?.color || (tx.type === "INCOME" ? "#10B981" : "#EF4444");

                return (
                  <div
                    key={tx.id}
                    onClick={() => handleOpenDetail(tx)}
                    className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]/30 shadow-sm cursor-pointer active:scale-98 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${catColor}15`, color: catColor }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                          {tx.type === "TRANSFER" ? "Transfer Saldo" : cleanDescription(tx.description)}
                        </p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                          {dayjs(tx.date).format("D MMM YYYY")} • {tx.type === "TRANSFER" ? `${tx.fromWallet?.name || "-"} → ${tx.toWallet?.name || "-"}` : tx.category?.name || "Lain-lain"}
                        </p>
                      </div>
                    </div>
                    <span className={clsx("font-extrabold text-sm tabular-nums shrink-0 ml-3", tx.type === "INCOME" ? "text-emerald-500" : "text-red-500")}>
                      {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[var(--text-tertiary)] italic bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]/30">
                Belum ada transaksi
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ─── DESKTOP VIEW (hidden lg:block) ─── */}
      <div className="hidden lg:block space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">~ Hai, {firstName}!</h2>
            <p className="text-sm text-[var(--text-tertiary)]">Kelola keuanganmu dengan presisi hari ini.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer">
              <Bell className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <UserAvatar user={user} size="md" className="!w-12 !h-12 !rounded-xl border-2 border-[var(--card-bg)] shadow-sm font-bold text-lg" />
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6 max-w-[1280px] mx-auto">
          {/* Left Column: Summary, Menu, and Wallets */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Summary Card */}
            <div 
              className="relative overflow-hidden rounded-[24px] p-6 md:p-8 text-white shadow-xl shadow-indigo-600/20"
              style={{
                background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.to})`
              }}
            >
              {/* Decorative background shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-200/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 max-w-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/20 backdrop-blur-md rounded-lg flex p-1 border border-white/30 overflow-x-auto scrollbar-none flex-nowrap max-w-full">
                      {PERIODS.map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePeriodChange(p)}
                          className={clsx(
                            "px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer shrink-0",
                            activePeriod === p
                              ? "bg-white text-indigo-600"
                              : "hover:bg-white/10 text-white"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-indigo-100/80 uppercase tracking-widest font-semibold">Total Saldo</p>
                  <h3 className="text-3xl lg:text-4xl font-extrabold mt-1 tabular-nums break-words">
                    {formatCurrency(totalWalletBalance)}
                  </h3>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {/* Pemasukan */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                    <ArrowDownLeft className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/70">Pemasukan</p>
                    <p className="text-base font-bold text-white tabular-nums truncate">{formatCurrency(filteredIncome)}</p>
                  </div>
                </div>
                {/* Pengeluaran */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/70">Pengeluaran</p>
                    <p className="text-base font-bold text-white tabular-nums truncate">{formatCurrency(filteredExpense)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    onClick={() => {
                      if (item.available && item.path) {
                        handleNavigate(item.path);
                      } else if (item.label === "Kartu") {
                        toast.success("Fitur Kartu akan segera hadir! 🚀");
                      } else {
                        toast.success("Segera hadir! 🚀");
                      }
                    }}
                    className={clsx(
                      "bento-card rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer",
                      item.isAI && "border-amber-500/20 bg-amber-500/5 dark:bg-amber-950/10"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative",
                        item.isAI && "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                      )}
                      style={
                        !item.isAI
                          ? {
                              backgroundColor: `${item.color}1a`,
                              color: item.color,
                            }
                          : undefined
                      }
                    >
                      <Icon className="w-5 h-5" />
                      {item.label === "Tagihan" && unpaidCount > 0 && (
                        <span className="absolute -top-1 -right-1 
                          w-5 h-5 bg-red-500 text-white text-[10px] 
                          font-black rounded-full flex items-center 
                          justify-center">
                          {unpaidCount > 9 ? "9+" : unpaidCount}
                        </span>
                      )}
                    </div>
                    <span
                      className={clsx(
                        "text-xs font-semibold leading-tight",
                        item.isAI
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-[var(--text-secondary)]"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Budget Progress Tracker */}
            <BudgetCard
              activePeriod={activePeriod}
              filteredTransactions={filteredTransactions}
              onNavigate={handleNavigate}
            />

            {/* Wallet Section */}
            <section>
              <div className="flex justify-between items-center mb-4 px-2">
                <h4 className="text-lg font-bold text-[var(--text-primary)]">Dompet Saya</h4>
                <button
                  onClick={() => handleNavigate("/wallets")}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-xs cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wallets.length > 0 ? (
                  wallets.slice(0, 4).map((w) => {
                    const WIcon = walletIcons[w.type] || Banknote;
                    return (
                      <div
                        key={w.id}
                        onClick={() => handleNavigate("/wallets")}
                        className="bento-card rounded-2xl p-5 flex items-center gap-4 cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/30 shrink-0">
                          <WIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-[var(--text-primary)] truncate">{w.name}</h5>
                          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-0.5">
                            {walletTypeLabels[w.type] || w.type} • IDR
                          </p>
                          <p className="font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
                            {formatCurrency(Number(w.balance || 0))}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] py-8 text-center">
                    <p className="text-sm text-[var(--text-tertiary)] font-medium">Belum ada wallet</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Recent Transactions */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bento-card rounded-[24px] p-6 flex flex-col h-full min-h-[480px]">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-[var(--text-primary)]">Transaksi Terakhir</h4>
                <Filter className="w-5 h-5 text-[var(--text-tertiary)] cursor-pointer hover:text-[var(--text-secondary)] transition-colors" />
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-none max-h-[420px]">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((tx) => {
                    const IconComponent = LucideIcons[tx.category?.icon] || LucideIcons.Tag;
                    const catColor = tx.category?.color || (tx.type === "INCOME" ? "#10B981" : "#EF4444");

                    return (
                      <div
                        key={tx.id}
                        onClick={() => handleOpenDetail(tx)}
                        className="flex items-center gap-4 group cursor-pointer"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${catColor}15`, color: catColor }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="font-bold text-[var(--text-primary)] group-hover:text-indigo-600 transition-colors truncate">
                            {tx.type === "TRANSFER" ? "Transfer" : cleanDescription(tx.description)}
                          </h6>
                          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                            {dayjs(tx.date).format("D MMM YYYY")} • {tx.type === "TRANSFER" ? `${tx.fromWallet?.name || "-"} → ${tx.toWallet?.name || "-"}` : tx.category?.name || "Lain-lain"}
                          </p>
                        </div>
                        <p className={clsx("font-bold tabular-nums shrink-0 text-sm", tx.type === "INCOME" ? "text-emerald-500" : "text-red-500")}>
                          {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-[var(--text-tertiary)] italic">
                    Belum ada transaksi
                  </div>
                )}
              </div>

              {/* View all button */}
              {recentTransactions.length > 0 && (
                <button
                  onClick={() => handleNavigate("/transactions")}
                  className="w-full mt-6 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                >
                  Lihat Semua Transaksi
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedTransaction}
        onEdit={setEditTarget}
        onDelete={handleDelete}
      />

      {editTarget && (
        <TransactionForm
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          initialData={editTarget}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}
    </div>
  );
});

export default DashboardPage;
