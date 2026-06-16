import { memo, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Calendar, PenLine, RefreshCw, ChevronDown, Check, Loader2, Tag } from "lucide-react";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import FloatingLabelInput from "../common/FloatingLabelInput";
import WalletPicker from "../transaction/WalletPicker";
import { useWallet } from "../../hooks/useWallet";
import { useCategory } from "../../hooks/useCategory";
import { useRecurring } from "../../hooks/useRecurring";
import { formatCurrency } from "../../utils/format";

// ─── Pure React Date Picker Modal (reused from RecurringForm) ─────
const DatePickerModal = memo(function DatePickerModal({
  isOpen,
  onClose,
  value,
  onSelect,
  title = "Pilih Tanggal Jatuh Tempo",
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

  // Generate calendar grid
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
              <LucideIcons.ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <span className="text-xs font-bold text-[var(--text-primary)]">{monthNames[currentDate.month()]} {currentDate.year()}</span>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] cursor-pointer">
              <LucideIcons.ChevronRight className="h-4.5 w-4.5" />
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

// ─── Main BillForm Sheet ──────────────────────────────────────────
const BillForm = memo(function BillForm({
  initialData = null,
  onSubmit,
  onClose,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: "",
    walletId: "",
    categoryId: "",
    recurringId: "",
    notes: "",
    source: "MANUAL",
    autoRepeat: false,
  });

  const { wallets, getWallets } = useWallet();
  const { expenseCategories, getCategories } = useCategory();
  const { recurrings: allRecurrings, fetchRecurrings } = useRecurring();

  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getWallets();
    getCategories("EXPENSE");
    fetchRecurrings();
  }, [getWallets, getCategories, fetchRecurrings]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        amount: initialData.amount !== undefined ? initialData.amount.toString() : "",
        dueDate: initialData.dueDate ? dayjs(initialData.dueDate).format("YYYY-MM-DD") : "",
        walletId: initialData.walletId || "",
        categoryId: initialData.categoryId || "",
        recurringId: initialData.recurringId || "",
        notes: initialData.notes || "",
        source: initialData.source || "MANUAL",
        autoRepeat: !!initialData.autoRepeat,
      });
    }
  }, [initialData]);

  const activeRecurrings = useMemo(() => {
    return allRecurrings.filter((r) => r.status === "ACTIVE");
  }, [allRecurrings]);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === formData.walletId);
  }, [wallets, formData.walletId]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Nama tagihan wajib diisi";
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Nominal harus lebih besar dari 0";
    }
    if (!formData.dueDate) {
      newErrors.dueDate = "Tanggal jatuh tempo wajib ditentukan";
    }
    if (formData.source === "RECURRING" && !formData.recurringId) {
      newErrors.recurringId = "Harap pilih transaksi berulang asal";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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
        <form
          onSubmit={handleFormSubmit}
          className="w-full lg:max-w-xl bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] lg:max-h-[85vh] animate-slide-up pointer-events-auto"
        >
          {/* Header */}
          <div className="relative flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              {initialData ? "Edit Tagihan" : "Tambah Tagihan"}
            </h3>
            <div className="w-8" /> {/* Spacer to center title */}
          </div>

          {/* Scrollable Form Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-6">
            
            {/* 1. Nama Tagihan */}
            <FloatingLabelInput
              label="Nama Tagihan"
              name="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              error={errors.title}
              hint="cth. PLN Listrik, BPJS, Netflix"
              required
            />

            {/* 2. Jumlah */}
            <FloatingLabelInput
              label="Jumlah"
              name="amount"
              type="number"
              prefix="Rp"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              error={errors.amount}
              hint="cth. 350000"
              required
            />

            {/* 3. Jatuh Tempo & Dompet (Grid 2 col) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Jatuh Tempo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                  Jatuh Tempo <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className={clsx(
                    "w-full flex items-center justify-between rounded-xl border px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all",
                    errors.dueDate ? "border-red-400" : "border-[var(--border-color)]"
                  )}
                >
                  <span className="text-xs text-[var(--text-primary)] font-semibold truncate">
                    {formData.dueDate ? dayjs(formData.dueDate).locale("id").format("D MMM YYYY") : "Pilih Tanggal"}
                  </span>
                  <Calendar className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                </button>
                {errors.dueDate && <p className="text-[10px] text-red-500">{errors.dueDate}</p>}
              </div>

              {/* Bayar dengan Dompet */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                  Bayar dengan Dompet
                </label>
                <button
                  type="button"
                  onClick={() => setIsWalletPickerOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all"
                >
                  <span className="text-xs text-[var(--text-primary)] font-semibold truncate">
                    {selectedWallet ? selectedWallet.name : "Pilih Dompet"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                </button>
              </div>
            </div>

            {/* 4. Kategori (horizontal scroll pills) */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Kategori
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {expenseCategories.map((cat) => {
                  const CatIcon = LucideIcons[cat.icon] || Tag;
                  const isActive = formData.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleInputChange("categoryId", cat.id)}
                      className={clsx(
                        "flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                      )}
                    >
                      <CatIcon className="h-3.5 w-3.5" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Sumber Tagihan (2 Option Cards) */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Sumber Tagihan
              </label>
              <div className="grid grid-cols-2 gap-4">
                {["MANUAL", "RECURRING"].map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setFormData((p) => ({
                      ...p,
                      source: src,
                      ...(src === "MANUAL" && { recurringId: "" })
                    }))}
                    className={`flex flex-col gap-3 p-4 
                      rounded-xl border-2 transition-all text-left cursor-pointer
                      ${formData.source === src
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full 
                      flex items-center justify-center
                      ${formData.source === src
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                      }`}
                    >
                      {src === "MANUAL" 
                        ? <PenLine className="w-5 h-5" />
                        : <RefreshCw className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm 
                        text-[var(--text-primary)]">
                        {src === "MANUAL" ? "Manual" : "Dari Berulang"}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {src === "MANUAL" 
                          ? "Input data mandiri" 
                          : "Gunakan pola rutin"
                        }
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recurring Selector Dropdown */}
            {formData.source === "RECURRING" && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-bold 
                  text-[var(--text-secondary)] uppercase 
                  tracking-wider">
                  Pilih Transaksi Berulang
                </label>
                <select
                  value={formData.recurringId}
                  onChange={(e) => {
                    const rid = e.target.value;
                    const recurring = activeRecurrings.find((r) => r.id === rid);
                    setFormData((p) => ({
                      ...p,
                      recurringId: rid,
                      ...(recurring && {
                        title: recurring.title,
                        amount: Number(recurring.amount),
                        walletId: recurring.walletId || "",
                        categoryId: recurring.categoryId || "",
                      }),
                    }));
                    if (errors.recurringId) {
                      setErrors((prev) => ({ ...prev, recurringId: "" }));
                    }
                  }}
                  className={clsx(
                    "w-full rounded-xl border px-4 py-3 text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] cursor-pointer focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all",
                    errors.recurringId ? "border-red-400" : "border-[var(--border-color)]"
                  )}
                >
                  <option value="">Pilih Berulang...</option>
                  {activeRecurrings.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} — {formatCurrency(r.amount)}
                    </option>
                  ))}
                </select>
                {errors.recurringId && <p className="text-[10px] text-red-500">{errors.recurringId}</p>}
              </div>
            )}

            {/* 6. Catatan (Opsional) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Catatan (Opsional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Tambahkan keterangan tambahan..."
                rows={3}
                className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all resize-none"
              />
            </div>

            {/* 7. Pengulangan Otomatis Toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl">
              <div>
                <h4 className="font-semibold text-sm text-[var(--text-primary)]">
                  Pengulangan Otomatis
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Buat otomatis tiap bulan
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                <input
                  type="checkbox"
                  checked={formData.autoRepeat}
                  onChange={() => handleInputChange("autoRepeat", !formData.autoRepeat)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

          </div>

          {/* Footer Submit Button */}
          <div className="p-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-t border-[var(--border-color)]/60 shrink-0">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-base transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Check className="h-5 w-5" />
              )}
              {initialData ? "Simpan Perubahan" : "Simpan Tagihan"}
            </button>
          </div>
        </form>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        value={formData.dueDate ? new Date(formData.dueDate) : null}
        onSelect={(date) => handleInputChange("dueDate", dayjs(date).format("YYYY-MM-DD"))}
      />

      {/* Wallet Picker */}
      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        onSelect={(wallet) => handleInputChange("walletId", wallet.id)}
      />
    </>,
    document.body
  );
});

export default BillForm;
