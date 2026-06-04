import { memo, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTransaction } from "../hooks/useTransaction";
import { useTheme } from "../hooks/useTheme";
import { formatCurrency, formatDate } from "../utils/format";
import { LIGHT_CARD_GRADIENTS, DARK_CARD_GRADIENTS } from "../utils/constants";
import TransactionCard from "../components/transaction/TransactionCard";
import TransactionForm from "../components/transaction/TransactionForm";
import Modal from "../components/common/Modal";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

const quotes = [
  "💡 Catatan keuangan yang rapi = langkah awal menuju financial freedom",
  "🎯 Setiap rupiah yang dicatat, selangkah lebih dekat ke tujuan finansial",
  "📊 Kenali pola pengeluaranmu, kendalikan keuanganmu",
  "🌱 Menabung sedikit setiap hari, hasilnya luar biasa",
  "🚀 Kebiasaan kecil hari ini, kekayaan besar di masa depan",
];

const DashboardPage = memo(function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resolvedTheme, cardStyle } = useTheme();
  const {
    transactions,
    summary,
    isLoading,
    getTransactions,
    getSummary,
    createTransaction,
  } = useTransaction();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getTransactions();
    getSummary();
  }, [getTransactions, getSummary]);

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const todayDate = useMemo(() => formatDate(new Date()), []);

  const dailyQuote = useMemo(
    () => quotes[new Date().getDate() % quotes.length],
    []
  );

  // Gradient for hero card
  const activeGradient = useMemo(() => {
    const gradients = resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS;
    const safeIndex = Math.min(cardStyle, gradients.length - 1);
    return gradients[safeIndex];
  }, [resolvedTheme, cardStyle]);

  const balanceIsNegative = (summary.balance || 0) < 0;

  const handleCreateTransaction = async (data) => {
    await createTransaction(data);
    setIsModalOpen(false);
    getTransactions();
    getSummary();
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <>
    <div className="animate-fade-slide-up pb-24">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Halo, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">{todayDate}</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-2 italic">
          {dailyQuote}
        </p>
      </div>

      {/* Hero Balance Card — uses card gradient */}
      <div
        className="rounded-2xl p-6 mb-6 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${activeGradient.from}, ${activeGradient.to})` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/70">Saldo</span>
        </div>
        <p className="text-3xl font-bold tabular-nums mb-4">
          {formatCurrency(summary.balance ?? 0)}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase">Pemasukan</span>
            </div>
            <p className="text-base font-bold tabular-nums">{formatCurrency(summary.totalIncome ?? 0)}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="h-3.5 w-3.5" />
              <span className="text-[10px] font-semibold uppercase">Pengeluaran</span>
            </div>
            <p className="text-base font-bold tabular-nums">{formatCurrency(summary.totalExpense ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Transaksi Terbaru */}
      <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Transaksi Terbaru
          </h2>
          <button
            onClick={() => navigate("/transactions")}
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
          >
            Lihat Semua
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentTransactions.map((tx) => (
              <TransactionCard key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
              <Sparkles className="h-8 w-8 text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              Belum ada transaksi
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Tap tombol <span className="text-indigo-600 font-semibold">+</span> untuk menambah transaksi pertama
            </p>
          </div>
        )}
      </div>
    </div>

    {/* FAB — outside animated container to avoid transform trapping fixed position */}
    <div className="fixed bottom-8 right-8 z-40 group">
      <button
        onClick={() => setIsModalOpen(true)}
        className={clsx(
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white",
          "shadow-lg shadow-indigo-300/50 dark:shadow-indigo-900/50",
          "hover:shadow-xl hover:shadow-indigo-300/60 hover:scale-105 active:scale-95",
          "transition-all duration-200 cursor-pointer"
        )}
      >
        <Plus className="h-6 w-6" />
      </button>
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Tambah Transaksi
        <div className="absolute top-full right-5 border-4 border-transparent border-t-gray-800" />
      </div>
    </div>

    {/* Modal */}
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Tambah Transaksi"
    >
      <TransactionForm
        onSubmit={handleCreateTransaction}
        onCancel={() => setIsModalOpen(false)}
      />
    </Modal>
    </>
  );
});

export default DashboardPage;
