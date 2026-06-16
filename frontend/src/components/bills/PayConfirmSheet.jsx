import { memo, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, Wallet, Check, Loader2, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import WalletPicker from "../transaction/WalletPicker";
import { useWallet } from "../../hooks/useWallet";
import { formatCurrency } from "../../utils/format";
import clsx from "clsx";

// ─── Pure React Date Picker Modal ─────────────────────────────────
const DatePickerModal = memo(function DatePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  title = "Pilih Tanggal Bayar",
}) {
  const [currentDate, setCurrentDate] = useState(() => dayjs(value || new Date()));
  const [selectedDate, setSelectedDate] = useState(() => value ? dayjs(value) : null);

  useEffect(() => {
    if (isOpen) {
      setCurrentDate(dayjs(value || new Date()));
      setSelectedDate(value ? dayjs(value) : null);
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const daysOfWeek = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"];

  const handlePrevMonth = () => setCurrentDate((prev) => prev.subtract(1, "month"));
  const handleNextMonth = () => setCurrentDate((prev) => prev.add(1, "month"));

  const startOfMonth = currentDate.startOf("month");
  const endOfMonth = currentDate.endOf("month");
  let startDay = startOfMonth.day();
  startDay = startDay === 0 ? 6 : startDay - 1; // align to Monday=0

  const calendarCells = [];
  const prevMonthEnd = startOfMonth.subtract(1, "day");
  
  for (let i = startDay - 1; i >= 0; i--) {
    calendarCells.push({
      date: prevMonthEnd.subtract(i, "day"),
      isCurrentMonth: false,
    });
  }
  const totalDays = endOfMonth.date();
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({
      date: startOfMonth.date(i),
      isCurrentMonth: true,
    });
  }
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      date: endOfMonth.add(i, "day"),
      isCurrentMonth: false,
    });
  }

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(selectedDate.toDate());
      onClose();
    }
  };

  return createPortal(
    <>
      <div onClick={onClose} className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs cursor-pointer" />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none select-none">
        <div className="w-full max-w-sm rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-2xl overflow-hidden flex flex-col pointer-events-auto space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[var(--border-color)]">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">{title}</h4>
            <button onClick={onClose} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-tertiary)] cursor-pointer">
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          
          <div className="flex justify-between items-center px-1">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] cursor-pointer">
              <X className="h-4.5 w-4.5 rotate-45" /> {/* left arrow fallback */}
            </button>
            <span className="text-xs font-bold text-[var(--text-primary)]">{monthNames[currentDate.month()]} {currentDate.year()}</span>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] cursor-pointer">
              <X className="h-4.5 w-4.5 -rotate-45" /> {/* right arrow fallback */}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
            {daysOfWeek.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map(({ date, isCurrentMonth }, idx) => {
              const isSelected = selectedDate && selectedDate.isSame(date, "day");
              const isToday = dayjs().isSame(date, "day");
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={clsx(
                    "aspect-square rounded-xl text-xs flex items-center justify-center font-semibold cursor-pointer relative",
                    isCurrentMonth ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] opacity-40",
                    isSelected
                      ? "bg-indigo-600 text-white font-bold"
                      : "hover:bg-[var(--bg-tertiary)]",
                    isToday && !isSelected && "border border-indigo-600/50"
                  )}
                >
                  {date.date()}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2.5 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/80 cursor-pointer">Batal</button>
            <button type="button" onClick={handleConfirm} disabled={!selectedDate} className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">Pilih</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
});

// ─── Main PayConfirmSheet ─────────────────────────────────────────
const PayConfirmSheet = memo(function PayConfirmSheet({
  bill,
  onPay,
  onClose,
}) {
  const { wallets, getWallets } = useWallet();
  const [selectedWalletId, setSelectedWalletId] = useState(bill.walletId || "");
  const [paidAt, setPaidAt] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [isLoading, setIsLoading] = useState(false);

  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    getWallets();
  }, [getWallets]);

  // Fallback to cash or first wallet if none selected
  useEffect(() => {
    if (!selectedWalletId && wallets.length > 0) {
      const cashWallet = wallets.find((w) => w.type === "cash");
      if (cashWallet) {
        setSelectedWalletId(cashWallet.id);
      } else {
        setSelectedWalletId(wallets[0].id);
      }
    }
  }, [wallets, selectedWalletId]);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === selectedWalletId);
  }, [wallets, selectedWalletId]);

  const handleConfirm = async () => {
    if (!selectedWalletId) {
      toast.error("Harap pilih dompet pembayaran");
      return;
    }
    setIsLoading(true);
    try {
      await onPay(bill.id, selectedWalletId, paidAt);
      onClose();
    } catch (err) {
      console.error("[PayConfirmSheet] payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Sheet Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none">
        <div className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-slide-up pointer-events-auto">
          {/* Handle bar */}
          <div className="w-12 h-1.5 bg-[var(--border-color)] rounded-full mx-auto my-3 shrink-0 lg:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Konfirmasi Pembayaran
            </h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Small Bill Card Info */}
            <div className="flex items-center justify-between p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-tertiary)] uppercase font-bold tracking-wider">
                  Membayar Tagihan
                </p>
                <h4 className="font-bold text-sm text-[var(--text-primary)] truncate mt-1">
                  {bill.title}
                </h4>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-base text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {formatCurrency(bill.amount)}
                </p>
              </div>
            </div>

            {/* Wallet Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Sumber Dompet Pembayaran
              </label>
              <button
                type="button"
                onClick={() => setIsWalletPickerOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all"
              >
                {selectedWallet ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {selectedWallet.name} ({formatCurrency(selectedWallet.balance)})
                    </span>
                  </div>
                ) : (
                  <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet...</span>
                )}
                <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              </button>
            </div>

            {/* Payment Date input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Tanggal Bayar
              </label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all"
              >
                <span className="text-xs text-[var(--text-primary)] font-semibold truncate">
                  {dayjs(paidAt).locale("id").format("D MMMM YYYY")}
                </span>
                <Calendar className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-4 border-t border-[var(--border-color)]/60 bg-[var(--bg-primary)]/80 backdrop-blur-xl flex flex-col gap-2 shrink-0">
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin" />
              ) : (
                <Check className="h-4.5 w-4.5" />
              )}
              Konfirmasi Pembayaran
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer bg-transparent border-0"
            >
              Batalkan
            </button>
          </div>
        </div>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={new Date(paidAt)}
        onSelect={(date) => setPaidAt(dayjs(date).format("YYYY-MM-DD"))}
      />

      {/* Wallet Picker */}
      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        onSelect={(wallet) => setSelectedWalletId(wallet.id)}
      />
    </>,
    document.body
  );
});

export default PayConfirmSheet;
