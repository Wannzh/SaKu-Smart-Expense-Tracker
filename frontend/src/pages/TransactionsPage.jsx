import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useTransaction } from "../hooks/useTransaction";
import { useTransfer } from "../hooks/useTransfer";
import { useCategory } from "../hooks/useCategory";
import TransactionCard from "../components/transaction/TransactionCard";
import TransactionForm from "../components/transaction/TransactionForm";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import TransactionDetail from "../components/transaction/TransactionDetail";
import {
  Plus,
  Loader2,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  Search,
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";

const typeFilters = [
  { value: "", label: "Semua" },
  { value: "INCOME", label: "Pemasukan" },
  { value: "EXPENSE", label: "Pengeluaran" },
  { value: "TRANSFER", label: "Transfer" },
];

const TransactionsPage = memo(function TransactionsPage() {
  const {
    transactions,
    isLoading,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransaction();

  const {
    transfers,
    getTransfers,
    createTransfer,
    deleteTransfer,
  } = useTransfer();

  const { categories, getCategories } = useCategory();

  const [filters, setFilters] = useState({
    type: "",
    categoryId: "",
    dateFrom: "",
    dateTo: "",
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const cleanFilters = useMemo(() => {
    const cf = {};
    if (filters.type) cf.type = filters.type;
    if (filters.categoryId) cf.categoryId = filters.categoryId;
    if (filters.dateFrom) cf.dateFrom = filters.dateFrom;
    if (filters.dateTo) cf.dateTo = filters.dateTo;
    return cf;
  }, [filters]);

  const refreshAll = useCallback(() => {
    const txFilters = { ...cleanFilters };
    if (txFilters.type === "TRANSFER") {
      delete txFilters.type;
    }
    getTransactions(txFilters);
    getTransfers();
  }, [cleanFilters, getTransactions, getTransfers]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Listen to refresh-data event
  useEffect(() => {
    const handleRefresh = () => refreshAll();
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, [refreshAll]);

  // Merge, filter and sort transactions & transfers on client-side
  const filteredMergedItems = useMemo(() => {
    let items = [];

    // 1. Filter type
    if (filters.type === "TRANSFER") {
      items = transfers.map(t => ({ ...t, type: "TRANSFER" }));
    } else if (filters.type === "INCOME" || filters.type === "EXPENSE") {
      items = transactions.filter(t => t.type === filters.type);
    } else {
      const mappedTransfers = transfers.map(t => ({ ...t, type: "TRANSFER" }));
      items = [...transactions, ...mappedTransfers];
    }

    // 2. Filter categoryId
    if (filters.categoryId) {
      items = items.filter(t => t.type !== "TRANSFER" && t.categoryId === filters.categoryId);
    }

    // 3. Filter dateFrom / dateTo
    if (filters.dateFrom) {
      const fromDate = dayjs(filters.dateFrom).startOf("day");
      items = items.filter(t => dayjs(t.date).isAfter(fromDate) || dayjs(t.date).isSame(fromDate, "day"));
    }
    if (filters.dateTo) {
      const toDate = dayjs(filters.dateTo).endOf("day");
      items = items.filter(t => dayjs(t.date).isBefore(toDate) || dayjs(t.date).isSame(toDate, "day"));
    }

    // 4. Sort
    return items.sort((a, b) => {
      const diff = new Date(b.date) - new Date(a.date);
      if (diff !== 0) return diff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [transactions, transfers, filters]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ type: "", categoryId: "", dateFrom: "", dateTo: "" });
  }, []);

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.dateFrom || filters.dateTo;

  const handleCreate = async (data) => {
    if (data.type === "TRANSFER") {
      await createTransfer({
        fromWalletId: data.fromWalletId,
        toWalletId: data.toWalletId,
        amount: data.amount,
        description: data.description,
        date: data.date,
      });
    } else {
      await createTransaction(data);
    }
    setIsCreateOpen(false);
    refreshAll();
  };

  const handleEdit = async (data) => {
    await updateTransaction(editTarget.id, data);
    setEditTarget(null);
    refreshAll();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === "TRANSFER") {
        await deleteTransfer(deleteTarget.id);
      } else {
        await deleteTransaction(deleteTarget.id);
      }
      setDeleteTarget(null);
      refreshAll();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDetailDelete = useCallback(async (id) => {
    if (selectedTransaction?.type === "TRANSFER") {
      await deleteTransfer(id);
    } else {
      await deleteTransaction(id);
    }
    refreshAll();
  }, [selectedTransaction, deleteTransaction, deleteTransfer, refreshAll]);

  const handleOpenDetail = useCallback((tx) => {
    setSelectedTransaction(tx);
    setIsDetailOpen(true);
  }, []);

  return (
    <div className="animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Transaksi</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-3 lg:gap-4">
          {/* Type toggle — pill style */}
          <div className="flex gap-1 rounded-full bg-[var(--bg-tertiary)] p-1">
            {typeFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange("type", value)}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer",
                  filters.type === value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Kategori</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
              className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-[var(--bg-secondary)] transition-all"
            >
              <option value="">Semua</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1 flex-1 min-w-[8rem] sm:flex-none">
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Dari</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1 flex-1 min-w-[8rem] sm:flex-none">
            <label className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Sampai</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      {filteredMergedItems.length > 0 && (
        <p className="text-xs text-[var(--text-tertiary)] mb-3 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5" />
          Menampilkan {filteredMergedItems.length} transaksi
        </p>
      )}

      {/* Transaction List */}
      {isLoading && filteredMergedItems.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredMergedItems.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredMergedItems.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              showActions
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
              onClick={handleOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
            {hasActiveFilters ? (
              <Search className="h-8 w-8 text-[var(--text-tertiary)]" />
            ) : (
              <ArrowLeftRight className="h-8 w-8 text-[var(--text-tertiary)]" />
            )}
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            {hasActiveFilters
              ? "Tidak ada transaksi yang cocok"
              : "Belum ada transaksi"}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {hasActiveFilters
              ? "Coba ubah atau reset filter kamu"
              : "Klik tombol Tambah untuk membuat transaksi pertama"}
          </p>
        </div>
      )}

      {/* Modal Create */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Transaksi">
        <TransactionForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit Transaksi">
        {editTarget && (
          <TransactionForm key={editTarget.id} initialData={editTarget} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>

      {/* Modal Delete */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Hapus Transaksi">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">Yakin hapus transaksi ini?</h4>
          <p className="text-sm text-[var(--text-tertiary)] mb-6">
            Tindakan ini tidak bisa dibatalkan.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">
              Batal
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="flex-1">
              {isDeleting ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Transaction Detail Sheet */}
      <TransactionDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        transaction={selectedTransaction}
        onEdit={setEditTarget}
        onDelete={handleDetailDelete}
      />
    </div>
  );
});

export default TransactionsPage;
