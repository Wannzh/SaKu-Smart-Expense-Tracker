import { memo, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTransaction } from "../hooks/useTransaction";
import { formatCurrency, formatDate } from "../utils/format";
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

const summaryCards = [
  {
    key: "income",
    label: "Total Pemasukan",
    icon: TrendingUp,
    field: "totalIncome",
    color: "text-emerald-700",
    gradient: "from-emerald-50 to-emerald-100/30",
    iconBg: "bg-emerald-200/60 text-emerald-700",
    border: "border-emerald-100",
  },
  {
    key: "expense",
    label: "Total Pengeluaran",
    icon: TrendingDown,
    field: "totalExpense",
    color: "text-red-600",
    gradient: "from-red-50 to-red-100/30",
    iconBg: "bg-red-200/60 text-red-600",
    border: "border-red-100",
  },
  {
    key: "balance",
    label: "Saldo",
    icon: Wallet,
    field: "balance",
    color: null, // dynamic
    gradient: null, // dynamic
    iconBg: null, // dynamic
    border: null, // dynamic
  },
];

const DashboardPage = memo(function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Dynamic balance card style
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
    <div className="max-w-4xl animate-fade-slide-up">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Halo, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">{todayDate}</p>
        <p className="text-xs text-gray-400/80 mt-2 italic">
          {dailyQuote}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryCards.map(({ key, label, icon: Icon, field, color, gradient, iconBg, border }) => {
          // Dynamic styles for balance card
          const isBalance = key === "balance";
          const finalColor = isBalance
            ? balanceIsNegative ? "text-red-600" : "text-indigo-700"
            : color;
          const finalGradient = isBalance
            ? balanceIsNegative ? "from-red-50 to-red-100/30" : "from-indigo-50 to-indigo-100/30"
            : gradient;
          const finalIconBg = isBalance
            ? balanceIsNegative ? "bg-red-200/60 text-red-600" : "bg-indigo-200/60 text-indigo-700"
            : iconBg;
          const finalBorder = isBalance
            ? balanceIsNegative ? "border-red-100" : "border-indigo-100"
            : border;

          return (
            <div
              key={key}
              className={clsx(
                "rounded-2xl p-5 border bg-gradient-to-br",
                "hover:shadow-lg transition-all duration-300",
                finalGradient,
                finalBorder
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={clsx(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    finalIconBg
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  {label}
                </span>
              </div>
              <p className={clsx("text-xl font-bold tabular-nums", finalColor)}>
                {formatCurrency(summary[field] || 0)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Transaksi Terbaru */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-800">
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
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
              <Sparkles className="h-8 w-8 text-gray-200" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Belum ada transaksi
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Tap tombol <span className="text-indigo-600 font-semibold">+</span> untuk menambah transaksi pertama
            </p>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-30 group">
        <button
          onClick={() => setIsModalOpen(true)}
          className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-full",
            "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white",
            "shadow-lg shadow-indigo-300/50",
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
    </div>
  );
});

export default DashboardPage;
