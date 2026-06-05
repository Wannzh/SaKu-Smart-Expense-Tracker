import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTransaction } from "../hooks/useTransaction";
import { useWallet } from "../hooks/useWallet";
import { useTheme } from "../hooks/useTheme";
import TransactionCard from "../components/transaction/TransactionCard";
import TransactionDetail from "../components/transaction/TransactionDetail";
import TransactionForm from "../components/transaction/TransactionForm";
import Modal from "../components/common/Modal";
import { useTransfer } from "../hooks/useTransfer";
import { formatCurrency } from "../utils/format";
import { LIGHT_CARD_GRADIENTS, DARK_CARD_GRADIENTS } from "../utils/constants";
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
  Mic,
  MoreHorizontal,
  PieChart,
  RefreshCw,
  ScanLine,
  Smartphone,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
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
  { label: "Anggaran",   icon: PieChart,       color: "#F97316", available: false },
  { label: "Berulang",   icon: RefreshCw,      color: "#3B82F6", available: false },
  { label: "Target",     icon: Target,         color: "#10B981", available: false },
  { label: "Tagihan",    icon: FileText,       color: "#EF4444", available: false },
  { label: "Utang",      icon: CreditCard,     color: "#8B5CF6", available: false },
  { label: "Scan Struk", icon: ScanLine,       color: "#06B6D4", available: true, path: "/scan" },
  { label: "Chat AI",    icon: MessageSquare,  color: "#4F46E5", available: true, path: "/chat" },
  { label: "Keinginan",  icon: Star,           color: "#FBBF24", available: false },
];

// ─── Quick record items (Section 4) ─────────────────────────
const quickActions = [
  { label: "Chat",   icon: MessageSquare, badge: "AI",   available: true,  path: "/chat" },
  { label: "Pindai", icon: ScanLine,      badge: "OCR",  available: true,  path: "/scan" },
  { label: "Suara",  icon: Mic,           badge: "Soon", available: false },
];

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — HEADER + SUMMARY CARD
// ═══════════════════════════════════════════════════════════════
const SummaryCard = memo(function SummaryCard({
  totalBalance,
  filteredIncome,
  filteredExpense,
  activePeriod,
  onPeriodChange,
  gradient,
}) {
  return (
    <div
      className="rounded-3xl p-5 text-white shadow-lg"
      style={{ background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})` }}
    >
      {/* Period tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-hide">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={clsx(
              "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
              activePeriod === p
                ? "bg-white/20 text-white"
                : "text-white/60 hover:text-white/80"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Main balance */}
      <p className="text-sm text-white/80 mb-1">Total Saldo (IDR)</p>
      <p className="text-3xl font-bold tabular-nums mb-4">{formatCurrency(totalBalance)}</p>

      {/* Income / Expense sub-cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/15 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/30">
              <ArrowDownLeft className="h-3 w-3 text-emerald-300" />
            </div>
            <span className="text-[10px] font-semibold uppercase text-white/70">Pemasukan</span>
          </div>
          <p className="text-base font-bold tabular-nums">{formatCurrency(filteredIncome)}</p>
        </div>
        <div className="rounded-2xl bg-white/15 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-400/30">
              <ArrowUpRight className="h-3 w-3 text-red-300" />
            </div>
            <span className="text-[10px] font-semibold uppercase text-white/70">Pengeluaran</span>
          </div>
          <p className="text-base font-bold tabular-nums">{formatCurrency(filteredExpense)}</p>
        </div>
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — MENU GRID
// ═══════════════════════════════════════════════════════════════
const MenuGrid = memo(function MenuGrid({ onNavigate }) {
  const handleClick = useCallback(
    (item) => {
      if (item.available && item.path) {
        onNavigate(item.path);
      } else {
        toast.success("Segera hadir! 🚀");
      }
    },
    [onNavigate]
  );

  return (
    <div>
      <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
        Menu
      </h2>
      <div className="flex lg:grid lg:grid-cols-4 gap-4 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-1.5 py-2 cursor-pointer group shrink-0 lg:shrink w-20 lg:w-auto"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-105 group-active:scale-95"
                style={{ backgroundColor: item.color + "18" }}
              >
                <Icon className="h-5 w-5" style={{ color: item.color }} />
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)] leading-tight text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — ANGGARAN BULANAN (Placeholder)
// ═══════════════════════════════════════════════════════════════
const BudgetCard = memo(function BudgetCard() {
  const handleClick = useCallback(() => {
    toast.success("Fitur anggaran segera hadir! 🚀");
  }, []);

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 text-left transition-all hover:shadow-md cursor-pointer group"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20">
        <PieChart className="h-5 w-5 text-orange-500" />
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
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4 — REKAM CEPAT
// ═══════════════════════════════════════════════════════════════
const QuickRecord = memo(function QuickRecord({ onNavigate }) {
  const handleClick = useCallback(
    (item) => {
      if (item.available && item.path) {
        onNavigate(item.path);
      } else {
        toast.success("Segera hadir! 🚀");
      }
    },
    [onNavigate]
  );

  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Rekam Cepat</h3>
      <div className="flex gap-6 justify-start lg:justify-center">
        {quickActions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-1.5 cursor-pointer group"
            >
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-tertiary)] transition-transform group-hover:scale-105 group-active:scale-95">
                  <Icon className="h-6 w-6 text-[var(--text-primary)]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white leading-none">
                  {item.badge}
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--text-secondary)]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5 — DOMPET SAYA
// ═══════════════════════════════════════════════════════════════
const walletTypeLabels = { cash: "CASH", bank: "BANK", ewallet: "EWALLET" };
const walletIcons = { cash: Banknote, bank: Building2, ewallet: Smartphone };

const WalletSection = memo(function WalletSection({ wallets, onNavigate }) {
  const visible = wallets.slice(0, 4);
  const remaining = wallets.length - 4;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Dompet Saya</h3>
        <button
          onClick={() => onNavigate("/wallets")}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {wallets.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {visible.map((w) => (
            <div
              key={w.id}
              onClick={() => onNavigate("/wallets")}
              className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-2 mb-2">
                {(() => { const WIcon = walletIcons[w.type] || Banknote; return <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)]"><WIcon className="h-4 w-4 text-[var(--text-secondary)]" /></div>; })()}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{w.name}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
                    {walletTypeLabels[w.type] || w.type} • IDR
                  </p>
                </div>
              </div>
              <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
                {formatCurrency(Number(w.balance || 0))}
              </p>
            </div>
          ))}

          {remaining > 0 && (
            <button
              onClick={() => onNavigate("/wallets")}
              className="rounded-2xl border-2 border-dashed border-[var(--border-color)] p-4 flex flex-col items-center justify-center text-[var(--text-tertiary)] hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <span className="text-2xl font-bold">+{remaining}</span>
              <span className="text-xs mt-1">lainnya</span>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] py-8 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">Belum ada wallet</p>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6 — TRANSAKSI TERAKHIR
// ═══════════════════════════════════════════════════════════════
const PERIOD_LABELS = {
  Hari: "Hari ini",
  Minggu: "Minggu ini",
  Bulan: "Bulan ini",
  Tahun: "Tahun ini",
  Semua: "Semua",
};

const RecentTransactions = memo(function RecentTransactions({
  transactions,
  periodLabel,
  periodExpense,
  onNavigate,
  onClickTransaction,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
          Transaksi Terakhir <span className="text-[var(--text-tertiary)] font-normal">· {periodLabel}</span>
        </h3>
        <div className="text-right">
          {periodExpense > 0 && (
            <p className="text-[11px] font-semibold text-red-500 tabular-nums">
              -{formatCurrency(periodExpense)}
            </p>
          )}
        </div>
      </div>

      {transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onClick={onClickTransaction}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
            <ClipboardList className="h-6 w-6 text-[var(--text-tertiary)]" />
          </div>
          <p className="text-sm text-[var(--text-secondary)]">Belum ada transaksi</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Tap + untuk menambah transaksi pertama</p>
        </div>
      )}

      {/* View all button */}
      {transactions.length > 0 && (
        <button
          onClick={() => onNavigate("/transactions")}
          className="w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
        >
          Lihat Semua Transaksi
        </button>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════
// MAIN — DASHBOARD PAGE
// ═══════════════════════════════════════════════════════════════
const DashboardPage = memo(function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, getTransactions, updateTransaction, deleteTransaction } = useTransaction();
  const { transfers, getTransfers, deleteTransfer } = useTransfer();
  const { wallets, getWallets } = useWallet();
  const { resolvedTheme, cardStyle } = useTheme();

  const [activePeriod, setActivePeriod] = useState("Bulan");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const refreshData = useCallback(() => {
    getTransactions();
    getTransfers();
    getWallets();
  }, [getTransactions, getTransfers, getWallets]);

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

  // Active gradient
  const activeGradient = useMemo(() => {
    const gradients = resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS;
    return gradients[cardStyle % gradients.length] || gradients[0];
  }, [resolvedTheme, cardStyle]);

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
      {/* ── SECTION 1: Header + Summary ────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            ~ Hai, {firstName}!
          </h1>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-sm">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>

        <SummaryCard
          totalBalance={totalWalletBalance}
          filteredIncome={filteredIncome}
          filteredExpense={filteredExpense}
          activePeriod={activePeriod}
          onPeriodChange={handlePeriodChange}
          gradient={activeGradient}
        />
      </div>

      {/* ── SECTION 2: Menu ────────────────────────────────── */}
      <MenuGrid onNavigate={handleNavigate} />

      {/* ── SECTION 3: Anggaran Bulanan ────────────────────── */}
      <BudgetCard />

      {/* ── SECTION 4: Rekam Cepat ─────────────────────────── */}
      <QuickRecord onNavigate={handleNavigate} />

      {/* ── SECTION 5: Dompet Saya ─────────────────────────── */}
      <WalletSection wallets={wallets} onNavigate={handleNavigate} />

      {/* ── SECTION 6: Transaksi Terakhir ──────────────────── */}
      <RecentTransactions
        transactions={recentTransactions}
        periodLabel={PERIOD_LABELS[activePeriod]}
        periodExpense={filteredExpense}
        onNavigate={handleNavigate}
        onClickTransaction={handleOpenDetail}
      />

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
