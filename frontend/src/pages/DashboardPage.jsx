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
} from "lucide-react";
import clsx from "clsx";

const summaryCards = [
  {
    key: "income",
    label: "Total Pemasukan",
    icon: TrendingUp,
    field: "totalIncome",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
  },
  {
    key: "expense",
    label: "Total Pengeluaran",
    icon: TrendingDown,
    field: "totalExpense",
    color: "text-red-500",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
  },
  {
    key: "balance",
    label: "Saldo",
    icon: Wallet,
    field: "balance",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    iconBg: "bg-indigo-100",
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

  // 5 transaksi terbaru
  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  );

  const todayDate = useMemo(
    () => formatDate(new Date()),
    []
  );

  const handleCreateTransaction = async (data) => {
    await createTransaction(data);
    setIsModalOpen(false);
    // Refresh data
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
    <div className="max-w-4xl">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Halo, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-400 mt-1">{todayDate}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {summaryCards.map(({ key, label, icon: Icon, field, color, bg, iconBg }) => (
          <div
            key={key}
            className={clsx(
              "rounded-2xl p-5 border border-gray-100 bg-white",
              "hover:shadow-md transition-shadow duration-200"
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  iconBg
                )}
              >
                <Icon className={clsx("h-5 w-5", color)} />
              </div>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {label}
              </span>
            </div>
            <p className={clsx("text-xl font-bold", color)}>
              {formatCurrency(summary[field] || 0)}
            </p>
          </div>
        ))}
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
            <Wallet className="h-12 w-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Belum ada transaksi</p>
            <p className="text-xs text-gray-300 mt-1">
              Tap tombol + untuk menambah transaksi pertama
            </p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={clsx(
          "fixed bottom-8 right-8 z-30",
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-indigo-600 text-white shadow-lg shadow-indigo-200",
          "hover:bg-indigo-700 hover:scale-105 active:scale-95",
          "transition-all duration-200 cursor-pointer"
        )}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal Tambah Transaksi */}
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
