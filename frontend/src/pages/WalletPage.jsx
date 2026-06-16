import { memo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency } from "../utils/format";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Modal from "../components/common/Modal";
import TransactionCard from "../components/transaction/TransactionCard";
import { useMoneyInput } from "../hooks/useMoneyInput";
import { useTheme } from "../hooks/useTheme";
import * as LucideIcons from "lucide-react";
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
  Banknote,
  Building2,
  Smartphone,
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

// ─── Wallet type options ────────────────────────────────────
const walletTypes = [
  { value: "cash", label: "Tunai", icon: Banknote },
  { value: "bank", label: "Bank", icon: Building2 },
  { value: "ewallet", label: "E-Wallet", icon: Smartphone },
];

const walletIconMap = { cash: Banknote, bank: Building2, ewallet: Smartphone };

const defaultColors = ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#6B7280"];

// ─── Wallet Form ────────────────────────────────────────────
const WalletForm = memo(function WalletForm({ onSubmit, onCancel, initialData }) {
  const isEdit = Boolean(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const {
    displayValue: initialBalanceDisplay,
    numericValue: initialBalanceVal,
    handleChange: handleInitialBalanceChange,
    setValue: setInitialBalanceValue
  } = useMoneyInput(0);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "cash",
    icon: initialData?.icon || "cash",
    color: initialData?.color || "#4F46E5",
    bankName: initialData?.bankName || "",
  });

  useEffect(() => {
    if (initialData) {
      setInitialBalanceValue(initialData.initialBalance || 0);
    }
  }, [initialData, setInitialBalanceValue]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        ...form,
        initialBalance: isEdit ? (initialData.initialBalance || 0) : initialBalanceVal,
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
          {walletTypes.map(({ value, label, icon: WIcon }) => (
            <button key={value} type="button" onClick={() => setForm((prev) => ({ ...prev, type: value, icon: value }))}
              className={clsx(
                "flex-1 flex flex-col items-center gap-1 rounded-xl py-3 border-2 text-sm font-medium transition-all cursor-pointer",
                form.type === value ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300" : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-gray-300"
              )}>
              <WIcon className="h-5 w-5" style={{ color: form.type === value ? undefined : 'var(--text-tertiary)' }} />
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">
            Saldo Awal <span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)] pointer-events-none select-none">
              Rp
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={initialBalanceDisplay}
              onChange={handleInitialBalanceChange}
              placeholder="0"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold tabular-nums text-right focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all text-sm"
            />
          </div>
        </div>
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

// ─── Main Page ──────────────────────────────────────────────
const WalletPage = memo(function WalletPage() {
  const navigate = useNavigate();
  const { wallets, activeWallet, isLoading, getWallets, getWallet, createWallet, updateWallet, deleteWallet } = useWallet();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showBalance, toggleShowBalance: handleToggleBalance } = useTheme();

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

  // Calculate flow ratios for selected wallet
  const totalFlow = activeWallet ? (activeWallet.totalIncome || 0) + (activeWallet.totalExpense || 0) || 1 : 1;
  const incomePercent = activeWallet ? Math.round(((activeWallet.totalIncome || 0) / totalFlow) * 100) : 0;
  const expensePercent = activeWallet ? Math.round(((activeWallet.totalExpense || 0) / totalFlow) * 100) : 0;

  return (
    <>
      <div className="animate-fade-slide-up pb-24 max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Wallet</h2>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">Kelola sumber dana dan pantau pengeluaran Anda.</p>
          </div>
        </header>

        {/* Top Section Layout */}
        <section className="flex flex-col lg:grid lg:grid-cols-10 gap-8 mb-12">
          {/* Left Column (40%) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Total Balance Card */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-[2rem] p-8 h-[240px] flex flex-col justify-between shadow-xl">
              {/* Pattern Overlay */}
              <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <svg height="200" viewBox="0 0 200 200" width="200">
                  <rect fill="none" height="180" rx="16" stroke="currentColor" strokeWidth="2" width="180" x="10" y="10" />
                  <rect fill="none" height="140" rx="12" stroke="currentColor" strokeWidth="2" width="140" x="30" y="30" />
                  <rect fill="none" height="100" rx="8" stroke="currentColor" strokeWidth="2" width="100" x="50" y="50" />
                </svg>
              </div>
              <div className="flex justify-between items-start z-10">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Total Saldo Bersih</span>
                <button 
                  onClick={handleToggleBalance}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  {showBalance ? <LucideIcons.Eye className="w-5 h-5" /> : <LucideIcons.EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <div className="z-10">
                <p className="text-xs font-semibold text-indigo-200 mb-1">IDR</p>
                <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight tabular-nums">
                  {showBalance ? formatCurrency(totalBalance) : "••••••••"}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 z-10 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                <LucideIcons.TrendingUp className="w-3.5 h-3.5 text-indigo-200" />
                <span className="text-[11px] font-medium text-white/90">+12.4% vs bulan lalu</span>
              </div>
            </div>

            <button 
              onClick={() => setIsCreateOpen(true)}
              className="w-full bg-[var(--card-bg)] border-2 border-dashed border-[var(--border-color)] text-[var(--text-secondary)] py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-400 dark:hover:text-indigo-400 transition-all group cursor-pointer"
            >
              <LucideIcons.Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Tambah Dompet Baru</span>
            </button>
          </div>

          {/* Right Column (60%) */}
          <div className="lg:col-span-6">
            {isLoading && wallets.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            ) : wallets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wallets.map((w) => {
                  const WalletIcon = walletIconMap[w.type] || Banknote;
                  const isSelected = activeWallet?.id === w.id;
                  return (
                    <div 
                      key={w.id}
                      onClick={() => handleSelect(w.id)}
                      className={clsx(
                        "group relative bg-[var(--card-bg)] border p-6 rounded-2xl cursor-pointer transition-all duration-300",
                        isSelected 
                          ? "border-indigo-600 dark:border-indigo-400 shadow-md ring-2 ring-indigo-600/20" 
                          : "border-[var(--border-color)] hover:shadow-lg hover:border-indigo-600/30"
                      )}
                      style={{ transform: isSelected ? "translateY(-4px)" : undefined }}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${w.color}15`, color: w.color }}
                        >
                          <WalletIcon className="w-6 h-6" />
                        </div>
                        {/* Edit/Delete Actions */}
                        <div className="lg:opacity-0 lg:group-hover:opacity-100 flex gap-1 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditTarget(w); }}
                            className="p-1.5 text-[var(--text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-[var(--bg-tertiary)]/50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(w); }}
                            className="p-1.5 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-1 truncate">{w.name}</h4>
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-4">
                          {w.type === "cash" ? "Cash" : w.type === "bank" ? `Bank Account • ${w.bankName}` : "Digital Wallet"}
                        </p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">Saldo</p>
                            <p className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
                              {showBalance ? formatCurrency(w.balance || 0) : "••••••••"}
                            </p>
                          </div>
                          {isSelected ? (
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-600/10 px-2 py-0.5 rounded-md">Aktif</span>
                          ) : (
                            <span className="text-[10px] text-[var(--text-tertiary)]">
                              {w._count?.transactions || 0} Transaksi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-tertiary)]">
                  <Sparkles className="h-8 w-8 text-[var(--text-tertiary)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Belum ada wallet</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">Klik Tambah Dompet Baru untuk membuat dompet pertama</p>
              </div>
            )}
          </div>
        </section>

        {/* Bottom Section: Selected Wallet Detail */}
        {activeWallet && (
          <section className="bg-[var(--bg-tertiary)]/20 border border-[var(--border-color)]/50 rounded-[2rem] p-6 lg:p-10 animate-fade-slide-up">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: activeWallet.color || "#4F46E5" }}
                >
                  {(() => {
                    const WalletIcon = walletIconMap[activeWallet.type] || Banknote;
                    return <WalletIcon className="w-5 h-5" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Detail {activeWallet.name}</h3>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <span className="px-4 py-2 bg-[var(--card-bg)] rounded-full text-xs font-semibold border border-[var(--border-color)] text-[var(--text-secondary)] whitespace-nowrap">
                  {dayjs().format("MMMM YYYY")}
                </span>
                <button 
                  onClick={() => navigate("/export")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <span>Ekspor Laporan</span>
                  <LucideIcons.Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
              {/* Stats Cards */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                <div className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <LucideIcons.TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Pemasukan</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(activeWallet.totalIncome || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${incomePercent}%` }}
                    />
                  </div>
                </div>

                <div className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border-color)] shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                      <LucideIcons.TrendingDown className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Pengeluaran</p>
                      <p className="text-lg font-bold text-rose-500 dark:text-rose-400 tabular-nums">
                        {formatCurrency(activeWallet.totalExpense || 0)}
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                      style={{ width: `${expensePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Transactions List */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-tertiary)]/30">
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Transaksi Terakhir</h4>
                    <button 
                      onClick={() => navigate("/transactions")}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:underline cursor-pointer"
                    >
                      Lihat Semua
                    </button>
                  </div>
                  <div className="divide-y divide-[var(--border-color)]">
                    {activeWallet.transactions?.length > 0 ? (
                      activeWallet.transactions.slice(0, 5).map((tx) => (
                        <TransactionCard key={tx.id} transaction={tx} />
                      ))
                    ) : (
                      <p className="text-xs text-[var(--text-tertiary)] py-8 text-center">Belum ada transaksi di wallet ini</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* AI Smart Actions FAB */}
      <button 
        onClick={() => navigate("/chat")}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-14 h-14 lg:w-16 lg:h-16 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50 group cursor-pointer animate-pulse-glow"
      >
        <LucideIcons.Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
        <div className="absolute right-16 lg:right-20 bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] shadow-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none">
          Tanya AI tentang Wallet Anda
        </div>
      </button>

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
