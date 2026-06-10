import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDebt } from "../hooks/useDebt";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency, toISODate } from "../utils/format";
import * as LucideIcons from "lucide-react";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  User,
  Calendar,
  Wallet as WalletIcon,
  FileText,
  Clock,
  ChevronRight,
  Coins,
  Check
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import clsx from "clsx";
import WalletPicker from "../components/transaction/WalletPicker";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";

dayjs.locale("id");

// Helper to compute initials for avatar
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const DebtPage = memo(function DebtPage() {
  const navigate = useNavigate();
  const { debts, isLoading, getDebts, createDebt, updateDebt, payDebt, deleteDebt } = useDebt();
  const { wallets, getWallets } = useWallet();

  // Navigation and Tab states
  const [activeTab, setActiveTab] = useState("DEBT"); // DEBT | LOAN
  const [selectedDebt, setSelectedDebt] = useState(null); // Debt object for detail view

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isPayWalletPickerOpen, setIsPayWalletPickerOpen] = useState(false);

  // Form states
  const [form, setForm] = useState({
    type: "DEBT",
    personName: "",
    amount: "",
    borrowDate: toISODate(new Date()),
    dueDate: "",
    walletId: "",
    notes: "",
  });

  const [payForm, setPayForm] = useState({
    paidAmount: "",
    walletId: "",
  });

  // Fetch debts and wallets on mount
  useEffect(() => {
    getDebts();
    getWallets();
  }, [getDebts, getWallets]);

  // Handle Input Changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePayInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setPayForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Summary Metrics calculations
  const summary = useMemo(() => {
    let totalDebt = 0;
    let totalLoan = 0;

    debts.forEach((d) => {
      const remaining = Number(d.amount) - Number(d.paidAmount);
      if (d.status !== "PAID") {
        if (d.type === "DEBT") {
          totalDebt += remaining;
        } else if (d.type === "LOAN") {
          totalLoan += remaining;
        }
      }
    });

    const net = totalLoan - totalDebt;
    const totalCombined = totalDebt + totalLoan;
    const debtPercent = totalCombined > 0 ? Math.round((totalDebt / totalCombined) * 100) : 50;
    const loanPercent = totalCombined > 0 ? Math.round((totalLoan / totalCombined) * 100) : 50;

    let statusText = "Seimbang";
    if (totalDebt > totalLoan) statusText = "Lebih banyak hutang";
    if (totalLoan > totalDebt) statusText = "Lebih banyak piutang";

    return {
      totalDebt,
      totalLoan,
      net,
      debtPercent,
      loanPercent,
      statusText,
    };
  }, [debts]);

  // Filtered Debts List based on active tab
  const filteredDebts = useMemo(() => {
    return debts.filter((d) => d.type === activeTab);
  }, [debts, activeTab]);

  // Open Add Form Modal
  const handleOpenAdd = useCallback(() => {
    setForm({
      type: activeTab,
      personName: "",
      amount: "",
      borrowDate: toISODate(new Date()),
      dueDate: "",
      walletId: wallets[0]?.id || "",
      notes: "",
    });
    setIsFormOpen(true);
  }, [activeTab, wallets]);

  // Create or Update Debt Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      type: form.type,
      personName: form.personName,
      amount: parseFloat(form.amount),
      borrowDate: dayjs(form.borrowDate).toISOString(),
      dueDate: form.dueDate ? dayjs(form.dueDate).toISOString() : null,
      walletId: form.walletId || null,
      notes: form.notes || null,
    };

    let result;
    if (form.id) {
      result = await updateDebt(form.id, payload);
    } else {
      result = await createDebt(payload);
    }

    if (result) {
      setIsFormOpen(false);
      getDebts();
      getWallets(); // refresh wallet balances
    }
  };

  // Open Detail view
  const handleOpenDetail = useCallback((debt) => {
    setSelectedDebt(debt);
    setIsDetailOpen(true);
  }, []);

  // Open Pay Modal
  const handleOpenPay = useCallback((debt) => {
    const remaining = Number(debt.amount) - Number(debt.paidAmount);
    setPayForm({
      paidAmount: remaining.toString(),
      walletId: wallets[0]?.id || "",
    });
    setSelectedDebt(debt);
    setIsPayOpen(true);
  }, [wallets]);

  // Submit Repayment
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDebt) return;

    const result = await payDebt(selectedDebt.id, {
      paidAmount: parseFloat(payForm.paidAmount),
      walletId: payForm.walletId || null,
    });

    if (result) {
      setIsPayOpen(false);
      setIsDetailOpen(false);
      getDebts();
      getWallets(); // refresh wallet balances
    }
  };

  // Delete Debt
  const handleDelete = async (debtId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan utang/piutang ini? Tindakan ini akan mengembalikan saldo dompet Anda.")) {
      const result = await deleteDebt(debtId);
      if (result) {
        setIsDetailOpen(false);
        getDebts();
        getWallets();
      }
    }
  };

  const getStatusBadge = (debt) => {
    if (debt.status === "PAID") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50">
          Lunas
        </span>
      );
    }
    if (debt.status === "OVERDUE") {
      const days = Math.max(1, dayjs().diff(dayjs(debt.dueDate), "day"));
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200/50">
          Terlambat {days} hari
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-200/50">
        Berjalan
      </span>
    );
  };

  const selectedWalletName = useMemo(() => {
    return wallets.find((w) => w.id === form.walletId)?.name || "Pilih Dompet...";
  }, [wallets, form.walletId]);

  const selectedPayWalletName = useMemo(() => {
    return wallets.find((w) => w.id === payForm.walletId)?.name || "Pilih Dompet...";
  }, [wallets, payForm.walletId]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-24 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-4 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)] cursor-pointer transition-colors lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Utang & Piutang</h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5 hidden sm:block">Kelola pinjaman masuk dan keluar dengan pencatatan wallet terintegrasi.</p>
          </div>
        </div>

        {/* Tombol Catat Baru khusus Desktop (Disembunyikan di mobile) */}
        <button
          onClick={handleOpenAdd}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Catat Baru
        </button>
      </div>

      {/* SUMMARY CARD (Gaya Ollo) */}
      <div className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-6 select-none bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-500">
        {/* Glow circles */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-white/15">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-100">Selisih Saldo Bersih</span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 tabular-nums">
            {summary.net < 0 ? "-" : ""}{formatCurrency(Math.abs(summary.net))}
          </h1>
          <span className="mt-2 text-[10px] font-bold bg-white/20 rounded-full px-3 py-1 uppercase tracking-wider">
            {summary.statusText}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="py-4">
          <div className="flex justify-between text-xs font-black text-indigo-100 mb-1.5 uppercase tracking-wider">
            <span>Utang: {summary.debtPercent}%</span>
            <span>Piutang: {summary.loanPercent}%</span>
          </div>
          <div className="h-3 w-full bg-white/25 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${summary.debtPercent}%` }}
              className="h-full bg-red-400 transition-all duration-500 ease-out"
            />
            <div
              style={{ width: `${summary.loanPercent}%` }}
              className="h-full bg-sky-300 transition-all duration-500 ease-out"
            />
          </div>
        </div>

        {/* Mini Cards Container */}
        <div className="grid grid-cols-2 gap-4 mt-2 pt-2">
          <div className="bg-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-red-300">
              <ArrowDown className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-extrabold text-indigo-100 tracking-wider">Utang Saya</p>
              <p className="text-sm font-extrabold truncate mt-0.5 tabular-nums">{formatCurrency(summary.totalDebt)}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/20 text-sky-200">
              <ArrowUp className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] uppercase font-extrabold text-indigo-100 tracking-wider">Piutang Saya</p>
              <p className="text-sm font-extrabold truncate mt-0.5 tabular-nums">{formatCurrency(summary.totalLoan)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] mb-5 select-none">
        <button
          onClick={() => setActiveTab("DEBT")}
          className={clsx(
            "flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer",
            activeTab === "DEBT"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Hutang Saya (Uang Masuk)
        </button>
        <button
          onClick={() => setActiveTab("LOAN")}
          className={clsx(
            "flex-1 py-3 text-center font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer",
            activeTab === "LOAN"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Piutang Saya (Pinjaman Keluar)
        </button>
      </div>

      {/* Content list container */}
      {isLoading && filteredDebts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 select-none">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2.5" />
          <p className="text-xs text-[var(--text-secondary)] font-medium">Memuat data utang & piutang...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDebts.length > 0 ? (
            filteredDebts.map((item) => {
              const remaining = Number(item.amount) - Number(item.paidAmount);
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all duration-200 group shadow-xs active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Avatar Circle */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 text-xs font-black select-none">
                      {getInitials(item.personName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {item.personName}
                        </h4>
                        {getStatusBadge(item)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-[var(--text-tertiary)] font-semibold mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Pinjam: {dayjs(item.borrowDate).format("D MMM YYYY")}
                        </span>
                        {item.dueDate && (
                          <span className="flex items-center gap-1 border-l border-[var(--border-color)]/80 pl-2.5">
                            <Clock className="h-3 w-3" />
                            Tempo: {dayjs(item.dueDate).format("D MMM YYYY")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-[var(--border-color)]/40 sm:border-t-0">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-tertiary)] select-none">Sisa Tagihan</p>
                      <p className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5 tabular-nums">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                    {item.status !== "PAID" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPay(item);
                        }}
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all cursor-pointer select-none active:scale-95 shadow-xs shrink-0"
                      >
                        Bayar
                      </button>
                    )}
                    <ChevronRight className="h-4.5 w-4.5 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-16 px-6 text-center shadow-xs select-none">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-transparent">
                <CheckCircle className="h-7 w-7" />
              </div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
                {activeTab === "DEBT" ? "Anda Bebas Hutang! 🎉" : "Tidak Ada Piutang"}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto font-medium leading-relaxed">
                {activeTab === "DEBT"
                  ? "Semua kewajiban keuangan Anda telah lunas diselesaikan dengan tertib."
                  : "Tidak ada catatan pihak lain yang meminjam dana dari Anda untuk saat ini."}
              </p>
              <Button onClick={handleOpenAdd} className="mt-6 text-xs py-2 px-4">
                <Plus className="h-4.5 w-4.5" />
                Catat {activeTab === "DEBT" ? "Hutang Baru" : "Piutang Baru"}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* FAB (Floating Action Button) - Diposisikan tetap di paling kanan bawah layar pada mode mobile */}
      <button
        onClick={handleOpenAdd}
        className="sm:hidden fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
        title="Catat Baru"
      >
        <Plus className="h-7 w-7" />
      </button>

      {/* MODAL FORM ADD/EDIT */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={form.id ? "Edit Catatan" : "Catat Baru"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Toggle Type */}
          <div className="flex gap-2 rounded-xl bg-[var(--bg-primary)] p-1 border border-[var(--border-color)]/60 select-none">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: "DEBT" }))}
              className={clsx(
                "flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                form.type === "DEBT"
                  ? "bg-red-500 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Saya Berhutang
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, type: "LOAN" }))}
              className={clsx(
                "flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer",
                form.type === "LOAN"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Saya Meminjamkan
            </button>
          </div>

          {/* Person Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
              Nama Kontak / Orang
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                name="personName"
                required
                value={form.personName}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all placeholder-[var(--text-tertiary)]"
                placeholder="Siapa nama kontaknya?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <Input
              label="Jumlah Nominal (Rp)"
              type="number"
              name="amount"
              required
              value={form.amount}
              onChange={handleInputChange}
              placeholder="0"
            />

            {/* Wallet Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
                Dompet/Wallet
              </label>
              <button
                type="button"
                onClick={() => setIsWalletPickerOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left text-sm text-[var(--text-primary)] cursor-pointer transition-all placeholder-[var(--text-tertiary)]"
              >
                <span className="truncate">{selectedWalletName}</span>
                <WalletIcon className="h-4.5 w-4.5 text-[var(--text-tertiary)] shrink-0" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Borrow Date */}
            <Input
              label="Tanggal Pinjam"
              type="date"
              name="borrowDate"
              required
              value={form.borrowDate}
              onChange={handleInputChange}
            />

            {/* Due Date */}
            <Input
              label="Jatuh Tempo (Opsional)"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleInputChange}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
              Catatan / Detail Toko
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3.5 text-[var(--text-tertiary)] pointer-events-none">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <textarea
                name="notes"
                rows="3"
                value={form.notes}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all placeholder-[var(--text-tertiary)]"
                placeholder="Catatan pelengkap..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-[var(--border-color)]/60">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsFormOpen(false)}
              className="flex-1 py-2.5 text-xs font-bold"
            >
              Batal
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
              {form.id ? "Simpan Perubahan" : "Buat Transaksi"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL DETAIL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedTabTitle(selectedDebt?.type)}
      >
        {selectedDebt && (
          <div className="space-y-5">
            <div className="text-center pb-4 border-b border-[var(--border-color)]/60 relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 text-sm font-black mx-auto mb-3 select-none">
                {getInitials(selectedDebt.personName)}
              </div>
              <h2 className="text-lg font-black text-[var(--text-primary)] truncate px-6">
                {selectedDebt.personName}
              </h2>
              <div className="mt-2 flex items-center justify-center gap-2">
                {getStatusBadge(selectedDebt)}
              </div>
            </div>

            {/* Financial Details */}
            <div className="space-y-3 bg-[var(--bg-secondary)] rounded-2xl p-4 border border-[var(--border-color)]/60">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--text-tertiary)] font-bold uppercase tracking-wider select-none">Nominal Pinjaman</span>
                <span className="font-extrabold text-[var(--text-primary)] tabular-nums">{formatCurrency(selectedDebt.amount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-[var(--border-color)]/40 pt-2.5">
                <span className="text-[var(--text-tertiary)] font-bold uppercase tracking-wider select-none">Telah Dibayar</span>
                <span className="font-extrabold text-emerald-600 tabular-nums">{formatCurrency(selectedDebt.paidAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-[var(--border-color)]/45 pt-2.5">
                <span className="text-[var(--text-tertiary)] font-bold uppercase tracking-wider select-none">Sisa Pelunasan</span>
                <span className="font-extrabold text-red-500 tabular-nums">
                  {formatCurrency(Number(selectedDebt.amount) - Number(selectedDebt.paidAmount))}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 select-none">
              <div className="flex justify-between text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                <span>Progress Pelunasan</span>
                <span>
                  {Math.round((Number(selectedDebt.paidAmount) / Number(selectedDebt.amount)) * 100)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.round((Number(selectedDebt.paidAmount) / Number(selectedDebt.amount)) * 100)}%`,
                  }}
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                />
              </div>
            </div>

            {/* Metadatas */}
            <div className="space-y-3.5 text-xs border-t border-[var(--border-color)]/40 pt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[9px] uppercase font-extrabold text-[var(--text-tertiary)] tracking-wider select-none">Tanggal Pinjam</p>
                  <p className="font-bold text-[var(--text-primary)] mt-0.5">{dayjs(selectedDebt.borrowDate).format("D MMMM YYYY")}</p>
                </div>
              </div>

              {selectedDebt.dueDate && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase font-extrabold text-[var(--text-tertiary)] tracking-wider select-none">Batas Jatuh Tempo</p>
                    <p className="font-bold text-[var(--text-primary)] mt-0.5">{dayjs(selectedDebt.dueDate).format("D MMMM YYYY")}</p>
                  </div>
                </div>
              )}

              {selectedDebt.wallet && (
                <div className="flex items-center gap-3">
                  <WalletIcon className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase font-extrabold text-[var(--text-tertiary)] tracking-wider select-none">Alokasi Dompet</p>
                    <p className="font-bold text-[var(--text-primary)] mt-0.5">{selectedDebt.wallet.name}</p>
                  </div>
                </div>
              )}

              {selectedDebt.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-[var(--text-tertiary)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase font-extrabold text-[var(--text-tertiary)] tracking-wider select-none">Catatan Tambahan</p>
                    <p className="font-medium text-[var(--text-secondary)] mt-0.5 break-words whitespace-pre-wrap leading-relaxed">
                      {selectedDebt.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-4 border-t border-[var(--border-color)]/60">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDelete(selectedDebt.id)}
                className="flex-1 py-2 text-xs font-bold border-red-500/20 hover:bg-red-500/10 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Hapus
              </Button>
              {selectedDebt.status !== "PAID" && (
                <Button
                  type="button"
                  onClick={() => handleOpenPay(selectedDebt)}
                  className="flex-1 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Coins className="h-4 w-4" />
                  Lunasi
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL REPAY / LUNASI */}
      <Modal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        title="Pembayaran Pelunasan"
      >
        {selectedDebt && (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="bg-[var(--bg-secondary)] rounded-xl p-3 border border-[var(--border-color)]/60 select-none text-xs flex justify-between">
              <span className="font-semibold text-[var(--text-secondary)]">Sisa Hutang:</span>
              <span className="font-black text-red-500 tabular-nums">
                {formatCurrency(Number(selectedDebt.amount) - Number(selectedDebt.paidAmount))}
              </span>
            </div>

            {/* Nominal Bayar */}
            <Input
              label="Nominal Pembayaran (Rp)"
              type="number"
              name="paidAmount"
              required
              value={payForm.paidAmount}
              onChange={handlePayInputChange}
              placeholder="Masukkan nominal pelunasan..."
            />

            {/* Wallet Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
                Bayar Melalui Dompet
              </label>
              <button
                type="button"
                onClick={() => setIsPayWalletPickerOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left text-sm text-[var(--text-primary)] cursor-pointer transition-all placeholder-[var(--text-tertiary)]"
              >
                <span className="truncate">{selectedPayWalletName}</span>
                <WalletIcon className="h-4.5 w-4.5 text-[var(--text-tertiary)] shrink-0" />
              </button>
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-[var(--border-color)]/60">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPayOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold"
              >
                Batal
              </Button>
              <Button type="submit" isLoading={isLoading} className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
                <Check className="h-4 w-4" />
                Bayar Sekarang
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Wallet Pickers */}
      {isWalletPickerOpen && createPortal(
        <WalletPicker
          isOpen={isWalletPickerOpen}
          onClose={() => setIsWalletPickerOpen(false)}
          title="Pilih Dompet Rekening"
          onSelect={(w) => {
            setForm((prev) => ({ ...prev, walletId: w.id }));
            setIsWalletPickerOpen(false);
          }}
        />,
        document.body
      )}

      {isPayWalletPickerOpen && createPortal(
        <WalletPicker
          isOpen={isPayWalletPickerOpen}
          onClose={() => setIsPayWalletPickerOpen(false)}
          title="Pilih Rekening Sumber Pembayaran"
          onSelect={(w) => {
            setPayForm((prev) => ({ ...prev, walletId: w.id }));
            setIsPayWalletPickerOpen(false);
          }}
        />,
        document.body
      )}
    </div>
  );
});

// Helper for detail title
const selectedTabTitle = (type) => {
  if (type === "DEBT") return "Rincian Hutang Saya";
  if (type === "LOAN") return "Rincian Piutang Saya";
  return "Detail Transaksi";
};

export default DebtPage;