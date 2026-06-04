import { memo, useState, useEffect, useCallback } from "react";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency } from "../utils/format";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import TransactionCard from "../components/transaction/TransactionCard";
import {
  Plus,
  Loader2,
  Wallet,
  Pencil,
  Trash2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import clsx from "clsx";

// ─── Wallet type options ────────────────────────────────────
const walletTypes = [
  { value: "cash", label: "Tunai", icon: "💵" },
  { value: "bank", label: "Bank", icon: "🏦" },
  { value: "ewallet", label: "E-Wallet", icon: "💳" },
];

const defaultColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#6B7280"];

// ─── Wallet Form ────────────────────────────────────────────
const WalletForm = memo(function WalletForm({ onSubmit, onCancel, initialData }) {
  const isEdit = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "cash",
    initialBalance: initialData?.initialBalance?.toString() || "0",
    icon: initialData?.icon || "💵",
    color: initialData?.color || "#4F46E5",
    bankName: initialData?.bankName || "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...form,
        initialBalance: parseFloat(form.initialBalance) || 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Nama Wallet" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Dompet Utama" required />

      {/* Type toggle */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]">Tipe</label>
        <div className="flex gap-2">
          {walletTypes.map(({ value, label, icon }) => (
            <button key={value} type="button" onClick={() => setForm((prev) => ({ ...prev, type: value, icon }))}
              className={clsx(
                "flex-1 flex flex-col items-center gap-1 rounded-xl py-3 border-2 text-sm font-medium transition-all cursor-pointer",
                form.type === value ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gray-300"
              )}>
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bank name (only if bank type) */}
      {form.type === "bank" && (
        <Input label="Nama Bank" name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. BCA, Mandiri, BRI" />
      )}

      {/* Initial balance (only on create) */}
      {!isEdit && (
        <Input label="Saldo Awal (Rp)" type="number" name="initialBalance" value={form.initialBalance} onChange={handleChange} placeholder="0" />
      )}

      {/* Color picker */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[var(--text-primary)]">Warna</label>
        <div className="flex gap-2 flex-wrap">
          {defaultColors.map((c) => (
            <button key={c} type="button" onClick={() => setForm((prev) => ({ ...prev, color: c }))}
              className={clsx(
                "h-8 w-8 rounded-full border-2 transition-all cursor-pointer",
                form.color === c ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Batal</Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {isLoading ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
        </Button>
      </div>
    </form>
  );
});

// ─── Wallet Card ────────────────────────────────────────────
const WalletCard = memo(function WalletCard({ wallet, isActive, onClick, onEdit, onDelete }) {
  const balance = Number(wallet.balance || 0);
  const isNegative = balance < 0;

  return (
    <div onClick={onClick}
      className={clsx(
        "rounded-2xl p-5 border-2 cursor-pointer transition-all duration-200 group",
        "hover:shadow-lg hover:-translate-y-0.5",
        isActive ? "border-indigo-600 shadow-md" : "border-transparent bg-[var(--card-bg)] shadow-sm"
      )}
      style={{ borderColor: isActive ? wallet.color || "#4F46E5" : undefined }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg" style={{ backgroundColor: (wallet.color || "#4F46E5") + "15" }}>
            {wallet.icon || "💵"}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">{wallet.name}</p>
            <p className="text-[11px] text-[var(--text-tertiary)] capitalize">{wallet.type}{wallet.bankName ? ` • ${wallet.bankName}` : ""}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onEdit(wallet); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-colors cursor-pointer">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(wallet); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors cursor-pointer">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <p className={clsx("text-xl font-bold tabular-nums", isNegative ? "text-red-600 dark:text-red-400" : "text-[var(--text-primary)]")}>
        {formatCurrency(balance)}
      </p>
      <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{wallet._count?.transactions || 0} transaksi</p>
    </div>
  );
});

// ─── Main Page ──────────────────────────────────────────────
const WalletPage = memo(function WalletPage() {
  const { wallets, activeWallet, isLoading, getWallets, getWallet, createWallet, updateWallet, deleteWallet } = useWallet();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { getWallets(); }, [getWallets]);

  const handleSelect = useCallback((id) => {
    getWallet(id);
  }, [getWallet]);

  const handleCreate = async (data) => {
    await createWallet(data);
    setIsCreateOpen(false);
    getWallets();
  };

  const handleEdit = async (data) => {
    await updateWallet(editTarget.id, data);
    setEditTarget(null);
    getWallets();
    if (activeWallet?.id === editTarget.id) getWallet(editTarget.id);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteWallet(deleteTarget.id);
      setDeleteTarget(null);
      getWallets();
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute total balance
  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);

  return (
    <>
    <div className="animate-fade-slide-up pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Wallet</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Kelola semua dompet dan rekening kamu</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah
        </Button>
      </div>

      {/* Total Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-4 lg:p-6 mb-6 text-white shadow-lg shadow-indigo-200/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">Total Saldo</span>
        </div>
        <p className="text-2xl lg:text-3xl font-bold tabular-nums">{formatCurrency(totalBalance)}</p>
        <p className="text-xs text-indigo-200 mt-1">{wallets.length} wallet aktif</p>
      </div>

      {/* Wallet Grid */}
      {isLoading && wallets.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : wallets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {wallets.map((w) => (
            <WalletCard key={w.id} wallet={w} isActive={activeWallet?.id === w.id}
              onClick={() => handleSelect(w.id)} onEdit={setEditTarget} onDelete={setDeleteTarget} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] py-16 text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
            <Sparkles className="h-8 w-8 text-[var(--text-tertiary)]" />
          </div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">Belum ada wallet</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">Klik Tambah untuk membuat wallet pertama</p>
        </div>
      )}

      {/* Active Wallet Detail */}
      {activeWallet && (
        <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] p-6 animate-fade-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: (activeWallet.color || "#4F46E5") + "15" }}>
              {activeWallet.icon || "💵"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{activeWallet.name}</h2>
              <p className="text-xs text-[var(--text-tertiary)] capitalize">{activeWallet.type}{activeWallet.bankName ? ` • ${activeWallet.bankName}` : ""}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">Pemasukan</span>
              </div>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{formatCurrency(activeWallet.totalIncome || 0)}</p>
            </div>
            <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-[11px] font-semibold text-red-500 uppercase">Pengeluaran</span>
              </div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">{formatCurrency(activeWallet.totalExpense || 0)}</p>
            </div>
          </div>

          {/* Recent transactions */}
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Transaksi Terbaru</h3>
          {activeWallet.transactions?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activeWallet.transactions.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] py-6 text-center">Belum ada transaksi di wallet ini</p>
          )}
        </div>
      )}
    </div>

    {/* Modal Create */}
    <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Wallet">
      <WalletForm onSubmit={handleCreate} onCancel={() => setIsCreateOpen(false)} />
    </Modal>

    {/* Modal Edit */}
    <Modal isOpen={Boolean(editTarget)} onClose={() => setEditTarget(null)} title="Edit Wallet">
      {editTarget && <WalletForm key={editTarget.id} initialData={editTarget} onSubmit={handleEdit} onCancel={() => setEditTarget(null)} />}
    </Modal>

    {/* Modal Delete */}
    <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} title="Hapus Wallet">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h4 className="text-base font-semibold text-[var(--text-primary)] mb-1">Yakin hapus wallet ini?</h4>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">Transaksi terkait tidak akan dihapus, hanya koneksi walletnya.</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)} className="flex-1">Batal</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={isDeleting} className="flex-1">
            {isDeleting ? "Menghapus..." : "Hapus"}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
});

export default WalletPage;
