import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useTransaction } from "../hooks/useTransaction";
import { useCategory } from "../hooks/useCategory";
import TransactionCard from "../components/transaction/TransactionCard";
import TransactionForm from "../components/transaction/TransactionForm";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import {
  Plus,
  Loader2,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  Search,
} from "lucide-react";
import clsx from "clsx";

const typeFilters = [
  { value: "", label: "Semua" },
  { value: "INCOME", label: "Pemasukan" },
  { value: "EXPENSE", label: "Pengeluaran" },
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

  useEffect(() => {
    getTransactions(cleanFilters);
  }, [cleanFilters, getTransactions]);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ type: "", categoryId: "", dateFrom: "", dateTo: "" });
  }, []);

  const hasActiveFilters =
    filters.type || filters.categoryId || filters.dateFrom || filters.dateTo;

  const handleCreate = async (data) => {
    await createTransaction(data);
    setIsCreateOpen(false);
    getTransactions(cleanFilters);
  };

  const handleEdit = async (data) => {
    await updateTransaction(editTarget.id, data);
    setEditTarget(null);
    getTransactions(cleanFilters);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);
      getTransactions(cleanFilters);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Transaksi</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          {/* Type toggle — pill style */}
          <div className="flex gap-1 rounded-full bg-gray-100 p-1">
            {typeFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleFilterChange("type", value)}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all cursor-pointer",
                  filters.type === value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Kategori</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange("categoryId", e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white transition-all"
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
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Dari</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Sampai</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      {transactions.length > 0 && (
        <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
          <Search className="h-3.5 w-3.5" />
          Menampilkan {transactions.length} transaksi
        </p>
      )}

      {/* Transaction List */}
      {isLoading && transactions.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              showActions
              onEdit={setEditTarget}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
            {hasActiveFilters ? (
              <Search className="h-8 w-8 text-gray-200" />
            ) : (
              <ArrowLeftRight className="h-8 w-8 text-gray-200" />
            )}
          </div>
          <p className="text-sm font-medium text-gray-500">
            {hasActiveFilters
              ? "Tidak ada transaksi yang cocok"
              : "Belum ada transaksi"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h4 className="text-base font-semibold text-gray-800 mb-1">Yakin hapus transaksi ini?</h4>
          <p className="text-sm text-gray-400 mb-6">
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
    </div>
  );
});

export default TransactionsPage;
