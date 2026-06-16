import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useDebt } from "../hooks/useDebt";
import { useWallet } from "../hooks/useWallet";
import { useTransaction } from "../hooks/useTransaction";
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
import toast from "react-hot-toast";
import WalletPicker from "../components/transaction/WalletPicker";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { useMoneyInput } from "../hooks/useMoneyInput";

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
  const { transactions: allTransactions, getTransactions } = useTransaction();

  // Navigation and Tab states
  const [activeTab, setActiveTab] = useState("DEBT"); // DEBT | LOAN
  const [selectedDebt, setSelectedDebt] = useState(null); // Debt object for detail view

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isPayWalletPickerOpen, setIsPayWalletPickerOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  // Form states
  const [form, setForm] = useState({
    type: "DEBT",
    personName: "",
    borrowDate: toISODate(new Date()),
    borrowTime: dayjs().format("HH:mm"),
    dueDate: toISODate(new Date()),
    dueTime: dayjs().format("HH:mm"),
    walletId: "",
    notes: "",
    currency: "Rp",
  });

  const [payForm, setPayForm] = useState({
    walletId: "",
  });

  const {
    displayValue: amountDisplay,
    numericValue: amountVal,
    handleChange: handleAmountChange,
    setValue: setAmountValue,
    reset: resetAmount,
  } = useMoneyInput(0);

  const {
    displayValue: payAmountDisplay,
    numericValue: payAmountVal,
    handleChange: handlePayAmountChange,
    setValue: setPayAmountValue,
    reset: resetPayAmount,
  } = useMoneyInput(0);

  // Fetch debts, wallets, and transactions on mount
  useEffect(() => {
    getDebts();
    getWallets();
    getTransactions();
  }, [getDebts, getWallets, getTransactions]);

  // Handle Input Changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "dueDate" && value && !prev.dueTime) {
        next.dueTime = dayjs().format("HH:mm");
      }
      return next;
    });
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

  const debtPayments = useMemo(() => {
    if (!selectedDebt) return [];
    return allTransactions.filter((t) => 
      t.description && 
      t.description.includes(`[Ref: ${selectedDebt.id}]`) &&
      (t.description.startsWith("Bayar hutang ke") || t.description.startsWith("Terima pembayaran dari"))
    );
  }, [allTransactions, selectedDebt]);

  const unpaidDebts = useMemo(() => {
    return filteredDebts.filter((d) => d.status !== "PAID");
  }, [filteredDebts]);

  const paidDebts = useMemo(() => {
    return filteredDebts.filter((d) => d.status === "PAID");
  }, [filteredDebts]);

  // Open Add Form Modal
  const handleOpenAdd = useCallback(() => {
    const now = dayjs();
    setForm({
      type: activeTab,
      personName: "",
      borrowDate: now.format("YYYY-MM-DD"),
      borrowTime: now.format("HH:mm"),
      dueDate: now.format("YYYY-MM-DD"),
      dueTime: now.format("HH:mm"),
      walletId: wallets[0]?.id || "",
      notes: "",
      currency: "Rp",
    });
    resetAmount();
    setIsFormOpen(true);
  }, [activeTab, wallets, resetAmount]);

  // Create or Update Debt Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!amountVal || amountVal <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }
    const borrowDateStr = `${form.borrowDate} ${form.borrowTime || "00:00"}`;
    const dueDateTimeStr = `${form.dueDate} ${form.dueTime || "00:00"}`;

    const payload = {
      type: form.type,
      personName: form.personName,
      amount: amountVal,
      borrowDate: dayjs(borrowDateStr).toISOString(),
      dueDate: dayjs(dueDateTimeStr).toISOString(),
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
    setPayAmountValue(remaining);
    setPayForm({
      walletId: wallets[0]?.id || "",
    });
    setSelectedDebt(debt);
    setIsPayOpen(true);
  }, [wallets, setPayAmountValue]);

  // Submit Repayment
  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDebt) return;
    if (!payAmountVal || payAmountVal <= 0) {
      toast.error("Nominal pembayaran harus lebih dari 0");
      return;
    }

    const result = await payDebt(selectedDebt.id, {
      paidAmount: payAmountVal,
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

  const selectedWalletName = useMemo(() => {
    return wallets.find((w) => w.id === form.walletId)?.name || "Pilih Dompet...";
  }, [wallets, form.walletId]);

  const selectedPayWalletName = useMemo(() => {
    return wallets.find((w) => w.id === payForm.walletId)?.name || "Pilih Dompet...";
  }, [wallets, payForm.walletId]);

  const renderDebtCard = useCallback((item) => {
    const amount = Number(item.amount);
    const paidAmount = Number(item.paidAmount);
    const remaining = Math.max(0, amount - paidAmount);
    const isPaid = item.status === "PAID";

    const paidPercent = amount > 0 ? Math.round((paidAmount / amount) * 100) : 0;
    const unpaidPercent = 100 - paidPercent;

    return (
      <div
        key={item.id}
        onClick={() => handleOpenDetail(item)}
        className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col gap-3.5 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-all duration-200 group shadow-xs active:scale-[0.99]"
      >
        {/* Top Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Circle */}
            {(() => {
              if (isPaid) {
                return (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 select-none">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                );
              }
              if (item.type === "DEBT") {
                return (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500 select-none">
                    <ArrowDown className="h-5 w-5" />
                  </div>
                );
              }
              return (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 select-none">
                  <ArrowUp className="h-5 w-5" />
                </div>
              );
            })()}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {item.personName}
                </h4>
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-[var(--text-tertiary)] font-semibold mt-1">
                {(() => {
                  if (isPaid) {
                    return (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Calendar className="h-3 w-3" />
                        Lunas
                      </span>
                    );
                  }
                  if (item.status === "OVERDUE") {
                    return (
                      <span className="flex items-center gap-1 text-red-500">
                        <LucideIcons.AlertCircle className="h-3 w-3" />
                        Terlambat
                      </span>
                    );
                  }
                  return (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Jatuh tempo {item.dueDate ? dayjs(item.dueDate).format("D MMM") : "-"}
                    </span>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t border-[var(--border-color)]/40 sm:border-t-0">
            <div className="text-right">
              <p className="text-sm font-extrabold text-[var(--text-primary)] mt-0.5 tabular-nums">
                {formatCurrency(isPaid ? amount : remaining)}
              </p>
              <p className={clsx(
                "text-[10px] font-semibold text-[var(--text-tertiary)] select-none",
                isPaid && "text-emerald-600 dark:text-emerald-400"
              )}>
                {isPaid ? "Telah dibayar" : "Belum dibayar"}
              </p>
            </div>
            <ChevronRight className="h-4.5 w-4.5 text-[var(--text-tertiary)] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Bottom Section - Progress Bar & Stats */}
        <div className="w-full mt-1 pt-3.5 border-t border-[var(--border-color)]/30">
          <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
            <div
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                isPaid ? "bg-emerald-500" : "bg-indigo-600"
              )}
              style={{ width: `${paidPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--text-tertiary)] mt-2 select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 dark:text-emerald-400">Terbayar {paidPercent}%</span>
              <span>•</span>
              <span className="text-red-500">Belum dibayar {unpaidPercent}%</span>
            </div>
            <span className="font-bold text-[var(--text-secondary)]">
              {item.paymentsCount || 0}x bayar
            </span>
          </div>
        </div>
      </div>
    );
  }, [handleOpenDetail, handleOpenPay]);

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

      {/* SUMMARY CARD (Premium Dark Style) */}
      <div className="rounded-3xl p-6 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-lg relative mb-6 select-none">
        {/* Top Header Section */}
        <div className="flex justify-between items-start pb-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Saldo Bersih
            </span>
            <h1 className={clsx(
              "text-3xl font-black tracking-tight tabular-nums",
              summary.net > 0 ? "text-sky-400" : summary.net < 0 ? "text-red-500" : "text-[var(--text-primary)]"
            )}>
              {summary.net < 0 ? "-" : ""}{formatCurrency(Math.abs(summary.net))}
            </h1>
            <div className="pt-1">
              <span className={clsx(
                "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                summary.net > 0 ? "bg-sky-500/10 text-sky-400" : summary.net < 0 ? "bg-red-500/10 text-red-500" : "bg-gray-500/10 text-gray-400"
              )}>
                {summary.net > 0 ? "Surplus piutang" : summary.net < 0 ? "Defisit hutang" : "Seimbang"}
              </span>
            </div>
          </div>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)]/60">
            <WalletIcon className="h-5 w-5" />
          </div>
        </div>

        {/* Progress Bar (Hutang vs Piutang) */}
        <div className="py-2 border-t border-[var(--border-color)]/30">
          <div className="h-2.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden flex my-2">
            <div
              style={{ width: `${summary.debtPercent}%` }}
              className="h-full bg-red-500 transition-all duration-500 ease-out"
            />
            <div
              style={{ width: `${summary.loanPercent}%` }}
              className="h-full bg-sky-400 transition-all duration-500 ease-out"
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            <span>Hutang Saya {summary.debtPercent}%</span>
            <span>Piutang Saya {summary.loanPercent}%</span>
          </div>
        </div>

        {/* Mini Cards Container (Grid Cols 2) */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-2 border-t border-[var(--border-color)]/30">
          {/* Card Hutang Saya */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl p-4 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
              Hutang Saya
            </span>
            <p className="text-base font-black text-[var(--text-primary)] tabular-nums">
              {formatCurrency(summary.totalDebt)}
            </p>
          </div>

          {/* Card Piutang Saya */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl p-4 flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
              Piutang Saya
            </span>
            <p className="text-base font-black text-[var(--text-primary)] tabular-nums">
              {formatCurrency(summary.totalLoan)}
            </p>
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
        <div className="space-y-4">
          {filteredDebts.length > 0 ? (
            <>
              {/* Kelompok Belum Lunas */}
              {unpaidDebts.length > 0 && (
                <div className="space-y-3">
                  {unpaidDebts.map((item) => renderDebtCard(item))}
                </div>
              )}

              {/* Garis Pemisah Selesai */}
              {paidDebts.length > 0 && (
                <>
                  <div className="flex items-center gap-4 py-2 select-none">
                    <div className="flex-1 h-px bg-[var(--border-color)]" />
                    <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Selesai</span>
                    </div>
                    <div className="flex-1 h-px bg-[var(--border-color)]" />
                  </div>

                  {/* Kelompok Lunas */}
                  <div className="space-y-3">
                    {paidDebts.map((item) => renderDebtCard(item))}
                  </div>
                </>
              )}
            </>
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

          {/* 1. Nama Orang */}
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

          {/* 2. Jumlah */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
              Jumlah
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)] pointer-events-none select-none">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amountDisplay}
                onChange={handleAmountChange}
                placeholder="0"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold tabular-nums text-right focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
              />
            </div>
          </div>

          {/* 3. Jatuh Tempo - Jam */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
              Jatuh Tempo
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <input
                  type="date"
                  name="dueDate"
                  required
                  value={form.dueDate}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all cursor-pointer font-medium"
                />
              </div>
              {/* Time */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                  <Clock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="time"
                  name="dueTime"
                  required
                  value={form.dueTime}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>

          {/* 4. Tanggal Pinjam - Jam */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
              Tanggal Pinjam
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <input
                  type="date"
                  name="borrowDate"
                  required
                  value={form.borrowDate}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all cursor-pointer font-medium"
                />
              </div>
              {/* Time */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none">
                  <Clock className="h-4.5 w-4.5" />
                </span>
                <input
                  type="time"
                  name="borrowTime"
                  required
                  value={form.borrowTime}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all cursor-pointer font-medium"
                />
              </div>
            </div>
          </div>

          {/* 5. Dompet */}
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

          {/* 6. Catatan */}
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
          <div className="space-y-6">
            {/* 1. Card Informasi */}
            {(() => {
              const remaining = Number(selectedDebt.amount) - Number(selectedDebt.paidAmount);
              const paidPercent = Number(selectedDebt.amount) > 0 
                ? Math.round((Number(selectedDebt.paidAmount) / Number(selectedDebt.amount)) * 100) 
                : 0;
              const isDebt = selectedDebt.type === "DEBT";
              
              return (
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                  {/* Arrow Icon */}
                  <div className={clsx(
                    "flex h-14 w-14 items-center justify-center rounded-full mb-3",
                    isDebt ? "bg-red-500/10 text-red-500" : "bg-sky-500/10 text-sky-400"
                  )}>
                    {isDebt ? (
                      <ArrowDown className="h-6 w-6" />
                    ) : (
                      <ArrowUp className="h-6 w-6" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <p className="text-xs text-[var(--text-tertiary)] font-semibold mb-1">
                    {isDebt 
                      ? `Anda berhutang pada ${selectedDebt.personName}`
                      : `${selectedDebt.personName} berhutang pada Anda`
                    }
                  </p>
                  
                  {/* Amount (Big Text) */}
                  <h1 className={clsx(
                    "text-3xl font-black tracking-tight mb-1 tabular-nums",
                    isDebt ? "text-red-500" : "text-sky-400"
                  )}>
                    {formatCurrency(remaining)}
                  </h1>
                  
                  {/* Original Total Amount */}
                  <p className="text-[10px] text-[var(--text-tertiary)] font-bold mb-5">
                    Total: {formatCurrency(selectedDebt.amount)}
                  </p>
                  
                  {/* Progress Bar Container */}
                  <div className="w-full space-y-1.5">
                    <div className="h-2 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-300",
                          isDebt ? "bg-red-500" : "bg-sky-400"
                        )}
                        style={{ width: `${paidPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider select-none">
                      <span>Terbayar: {formatCurrency(selectedDebt.paidAmount)}</span>
                      <span>{paidPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 2. Card Details */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl p-4 space-y-3.5 divide-y divide-[var(--border-color)]/30">
              {/* Row 1: Jatuh Tempo */}
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-semibold select-none">
                  <Calendar className="h-4.5 w-4.5 text-[var(--text-tertiary)]" />
                  <span>Jatuh Tempo</span>
                </div>
                <span className="font-extrabold text-[var(--text-primary)]">
                  {selectedDebt.dueDate ? dayjs(selectedDebt.dueDate).format("D MMM YYYY") : "-"}
                </span>
              </div>

              {/* Row 2: Tanggal Pinjam */}
              <div className="flex justify-between items-center text-xs pt-3.5">
                <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-semibold select-none">
                  <Calendar className="h-4.5 w-4.5 text-[var(--text-tertiary)]" />
                  <span>Tanggal Pinjam</span>
                </div>
                <span className="font-extrabold text-[var(--text-primary)]">
                  {dayjs(selectedDebt.borrowDate).format("D MMM YYYY")}
                </span>
              </div>

              {/* Row 3: Status */}
              <div className="flex justify-between items-center text-xs pt-3.5">
                <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-semibold select-none">
                  <LucideIcons.Info className="h-4.5 w-4.5 text-[var(--text-tertiary)]" />
                  <span>Status</span>
                </div>
                <span className={clsx(
                  "font-extrabold uppercase tracking-wider text-[10px]",
                  selectedDebt.status === "PAID" && "text-emerald-500",
                  selectedDebt.status === "OVERDUE" && "text-red-500",
                  selectedDebt.status === "ACTIVE" && "text-sky-400"
                )}>
                  {selectedDebt.status === "PAID" && "Lunas"}
                  {selectedDebt.status === "OVERDUE" && "Terlambat"}
                  {selectedDebt.status === "ACTIVE" && "Aktif"}
                </span>
              </div>

              {/* Row 4: Alokasi Dompet */}
              {selectedDebt.wallet && (
                <div className="flex justify-between items-center text-xs pt-3.5">
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-semibold select-none">
                    <WalletIcon className="h-4.5 w-4.5 text-[var(--text-tertiary)]" />
                    <span>Dompet Rekening</span>
                  </div>
                  <span className="font-extrabold text-[var(--text-primary)]">
                    {selectedDebt.wallet.name}
                  </span>
                </div>
              )}

              {/* Row 5: Catatan */}
              {selectedDebt.notes && (
                <div className="flex flex-col gap-1 text-xs pt-3.5">
                  <div className="flex items-center gap-2.5 text-[var(--text-secondary)] font-semibold select-none">
                    <FileText className="h-4.5 w-4.5 text-[var(--text-tertiary)]" />
                    <span>Catatan Tambahan</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] font-medium bg-[var(--bg-tertiary)] p-2.5 rounded-xl mt-1 border border-[var(--border-color)]/30 break-words whitespace-pre-wrap leading-relaxed">
                    {selectedDebt.notes}
                  </p>
                </div>
              )}
            </div>

            {/* 3. Riwayat Pembayaran */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Riwayat Pembayaran
              </h3>
              {debtPayments.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-4 font-medium select-none">
                  Belum ada pembayaran
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {debtPayments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[var(--text-primary)]">Cicilan Terbayar</p>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-semibold">
                            {dayjs(p.date || p.createdAt).format("D MMM YYYY - HH:mm")}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-extrabold text-emerald-500 tabular-nums shrink-0">
                        + {formatCurrency(p.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {selectedDebt.status !== "PAID" && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenPay(selectedDebt)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-xl text-xs font-bold transition-all cursor-pointer border border-[var(--border-color)]/50 active:scale-95 shadow-xs"
                  >
                    <Plus className="h-4 w-4" />
                    Catat Pembayaran
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer / Delete Action */}
            <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]/60">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDelete(selectedDebt.id)}
                className="flex-1 py-2 text-xs font-bold border-red-500/20 hover:bg-red-500/10 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Hapus Catatan
              </Button>
              <Button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="flex-1 py-2 text-xs font-bold bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)]"
              >
                Tutup
              </Button>
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">
                Nominal Pembayaran
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--text-secondary)] pointer-events-none select-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={payAmountDisplay}
                  onChange={handlePayAmountChange}
                  placeholder="Masukkan nominal pelunasan..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] font-bold tabular-nums text-right focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all"
                />
              </div>
            </div>

            {/* Quick-select Percentages */}
            {(() => {
              const remaining = Number(selectedDebt.amount) - Number(selectedDebt.paidAmount);
              const val25 = Math.round(remaining * 0.25);
              const val50 = Math.round(remaining * 0.5);
              const val100 = remaining;
              const currentVal = payAmountVal;

              return (
                <div className="flex gap-2.5 mt-1.5 mb-2 select-none">
                  {[
                    { label: "25%", value: val25 },
                    { label: "50%", value: val50 },
                    { label: "Full", value: val100 },
                  ].map((opt) => {
                    const isActive = currentVal === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setPayAmountValue(opt.value)}
                        className={clsx(
                          "flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer text-center active:scale-95",
                          isActive
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/50 text-[var(--text-primary)]"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              );
            })()}

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