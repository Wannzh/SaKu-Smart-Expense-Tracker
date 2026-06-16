import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransaction } from "../hooks/useTransaction";
import { useTransfer } from "../hooks/useTransfer";
import { useCategory } from "../hooks/useCategory";
import TransactionCard from "../components/transaction/TransactionCard";
import TransactionForm from "../components/transaction/TransactionForm";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import TransactionDetail from "../components/transaction/TransactionDetail";
import * as LucideIcons from "lucide-react";
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
  const navigate = useNavigate();
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
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const selectedCategory = useMemo(() => 
    categories.find((c) => c.id === filters.categoryId),
    [categories, filters.categoryId]
  );

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
    <>
      <div className="animate-fade-slide-up pb-24 max-w-[1280px] mx-auto">
        {/* Header Section */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 p-6 rounded-2xl border border-[var(--border-color)]/35 bg-[var(--card-bg)] gap-4"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, var(--border-color) 1px, transparent 0)",
            backgroundSize: "24px 24px"
          }}
        >
          <div>
            <h2 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1">Transaksi</h2>
            <p className="text-sm text-[var(--text-tertiary)]">Lacak dan kelola setiap aliran dana Anda dengan presisi.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="w-full sm:w-auto font-bold flex items-center justify-center gap-2">
            <Plus className="h-4.5 w-4.5" />
            <span>Tambah</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-end">
            {/* Type Filter */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Tipe Transaksi</label>
              <div className="flex p-1 bg-[var(--bg-tertiary)]/50 rounded-xl border border-[var(--border-color)]/30">
                {typeFilters.map(({ value, label }) => {
                  const isActive = filters.type === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleFilterChange("type", value)}
                      className={clsx(
                        "flex-1 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer text-center",
                        isActive
                          ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm border border-[var(--border-color)]/50 font-bold"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="col-span-1 lg:col-span-3">
              <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Kategori</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="w-full bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-2.5 pl-4 pr-10 text-sm text-[var(--text-primary)] flex items-center focus:ring-2 focus:ring-indigo-600/20 text-left cursor-pointer min-h-[44px]"
                >
                  <span className="truncate flex items-center gap-2">
                    {selectedCategory ? (
                      <>
                        <span 
                          className="w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0 font-medium text-xs animate-scale-bounce"
                          style={{ backgroundColor: `${selectedCategory.color}15`, color: selectedCategory.color }}
                        >
                          {(() => {
                            const CatIcon = LucideIcons[selectedCategory.icon] || LucideIcons.Tag;
                            return <CatIcon className="w-3.5 h-3.5" />;
                          })()}
                        </span>
                        <span className="truncate font-semibold">{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className="text-[var(--text-secondary)]">Semua Kategori</span>
                    )}
                  </span>
                </button>
                <LucideIcons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] w-4.5 h-4.5" />
              </div>
            </div>

            {/* Date Range */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3">
              <label className="block text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Periode</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  className="flex-1 bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-600/20"
                />
                <span className="text-[var(--text-tertiary)] text-xs">ke</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="flex-1 bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-3 px-4 text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="col-span-1 lg:col-span-2">
              <button
                onClick={handleResetFilters}
                className={clsx(
                  "w-full py-3 border rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer",
                  hasActiveFilters
                    ? "border-red-500 text-red-500 hover:bg-red-500/10 font-bold"
                    : "border-[var(--border-color)] text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)]/30"
                )}
                disabled={!hasActiveFilters}
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Count & Sorting info */}
        <div className="mb-4 flex items-center justify-between px-1">
          <p className="text-xs text-[var(--text-tertiary)]">
            <span className="font-bold text-[var(--text-primary)]">{filteredMergedItems.length}</span> transaksi ditemukan
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Urutkan:</span>
            <button className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer">
              <span>Terbaru</span>
              <LucideIcons.ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transaction List */}
        {isLoading && filteredMergedItems.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : filteredMergedItems.length > 0 ? (
          <div className="space-y-3">
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
      </div>

      {/* AI Smart Actions FAB */}
      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 lg:w-16 lg:h-16 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 group cursor-pointer animate-pulse-glow"
      >
        <LucideIcons.Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
        <div className="absolute right-16 lg:right-20 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
          Butuh bantuan analisis transaksi?
        </div>
      </button>

      {/* Form Create */}
      {isCreateOpen && (
        <TransactionForm
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
        />
      )}

      {/* Form Edit */}
      {editTarget && (
        <TransactionForm
          key={editTarget.id}
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          initialData={editTarget}
          onSubmit={handleEdit}
          onCancel={() => setEditTarget(null)}
        />
      )}

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

      {/* Modal Select Category */}
      <Modal 
        isOpen={isCategoryModalOpen} 
        onClose={() => setIsCategoryModalOpen(false)} 
        title="Pilih Kategori"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {/* Option: Semua Kategori */}
          <button
            type="button"
            onClick={() => {
              handleFilterChange("categoryId", "");
              setIsCategoryModalOpen(false);
            }}
            className={clsx(
              "flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer",
              filters.categoryId === ""
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                : "border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/30"
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
              <LucideIcons.Grid className="w-4.5 h-4.5 text-[var(--text-tertiary)]" />
            </div>
            <span className="text-xs truncate font-semibold">Semua</span>
          </button>

          {/* Map categories */}
          {categories.map((cat) => {
            const CatIcon = LucideIcons[cat.icon] || LucideIcons.Tag;
            const isCatSelected = filters.categoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  handleFilterChange("categoryId", cat.id);
                  setIsCategoryModalOpen(false);
                }}
                className={clsx(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer min-w-0",
                  isCatSelected
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm"
                    : "border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]/30"
                )}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                >
                  <CatIcon className="w-4.5 h-4.5" />
                </div>
                <span className="text-xs truncate font-semibold">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
});

export default TransactionsPage;
