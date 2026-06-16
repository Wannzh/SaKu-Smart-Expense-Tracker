import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecurring } from "../hooks/useRecurring";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency, formatDate } from "../utils/format";
import RecurringCard from "../components/recurring/RecurringCard";
import RecurringForm from "../components/recurring/RecurringForm";
import RecurringDetail from "../components/recurring/RecurringDetail";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Search, 
  PlusCircle, 
  Lightbulb,
  Sparkles,
  ArrowRight,
  Tv,
  Music,
  Home,
  Play,
  Coins
} from "lucide-react";
import dayjs from "dayjs";
import clsx from "clsx";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const daysOfWeek = ["S", "S", "R", "K", "J", "S", "M"];

const frequencyMap = {
  DAILY: "Harian",
  WEEKLY: "Mingguan",
  MONTHLY: "Bulanan",
  YEARLY: "Tahunan",
};

const getMobileIcon = (title = "", isIncome = false) => {
  const lower = title.toLowerCase();
  if (lower.includes("spotify") || lower.includes("musik") || lower.includes("music") || lower.includes("joox")) {
    return {
      icon: Music,
      bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    };
  }
  if (lower.includes("internet") || lower.includes("tv") || lower.includes("wifi") || lower.includes("indihome") || lower.includes("biznet") || lower.includes("kabel") || lower.includes("router")) {
    return {
      icon: Tv,
      bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    };
  }
  if (lower.includes("apartemen") || lower.includes("sewa") || lower.includes("kost") || lower.includes("rumah") || lower.includes("kontrakan") || lower.includes("apart")) {
    return {
      icon: Home,
      bgClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400"
    };
  }
  if (lower.includes("youtube") || lower.includes("netflix") || lower.includes("disney") || lower.includes("video") || lower.includes("stream") || lower.includes("premium") || lower.includes("play")) {
    return {
      icon: Play,
      bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    };
  }
  return {
    icon: RefreshCw,
    bgClass: isIncome 
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
      : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
  };
};

const RecurringPage = memo(function RecurringPage() {
  const navigate = useNavigate();
  const {
    recurrings,
    monthlyCommitment,
    activeCount,
    isLoading,
    activeMonth,
    prevMonth,
    nextMonth,
    createRecurring,
    updateRecurring,
    toggleStatus,
    executeRecurring,
    deleteRecurring,
  } = useRecurring();

  const { wallets, getWallets } = useWallet();

  // Bottom sheets / modals states
  const [selectedRecurring, setSelectedRecurring] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState(null);

  // Selected date on calendar filter
  const [selectedDate, setSelectedDate] = useState(null);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch wallets on mount
  useEffect(() => {
    getWallets();
  }, [getWallets]);

  // Clear date filter if activeMonth changes
  useEffect(() => {
    setSelectedDate(null);
  }, [activeMonth]);

  // Inline calendar grid calculations
  const calendarCells = useMemo(() => {
    const startOfMonth = activeMonth.startOf("month");
    const endOfMonth = activeMonth.endOf("month");
    
    let startDay = startOfMonth.day(); // 0 is Sunday, 1 is Monday...
    startDay = startDay === 0 ? 6 : startDay - 1; // align to Monday=0

    const cells = [];
    const prevMonthEnd = startOfMonth.subtract(1, "day");
    
    // previous month padding days
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({
        date: prevMonthEnd.subtract(i, "day"),
        isCurrentMonth: false,
      });
    }
    
    // current month days
    const totalDays = endOfMonth.date();
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: startOfMonth.date(i),
        isCurrentMonth: true,
      });
    }
    
    // next month padding days
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: endOfMonth.add(i, "day"),
        isCurrentMonth: false,
      });
    }
    
    return cells;
  }, [activeMonth]);

  // Date and Search filtering logic
  const searchFilteredRecurrings = useMemo(() => {
    let result = recurrings;

    // Filter by calendar date
    if (selectedDate) {
      result = result.filter((r) =>
        dayjs(r.nextRunDate).isSame(selectedDate, "day")
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.title.toLowerCase().includes(query)
      );
    }

    return result;
  }, [recurrings, selectedDate, searchQuery]);

  // Active counts for summary badges
  const activeIncomeCount = useMemo(() => {
    return recurrings.filter((r) => r.status === "ACTIVE" && r.type === "INCOME").length;
  }, [recurrings]);

  const activeExpenseCount = useMemo(() => {
    return recurrings.filter((r) => r.status === "ACTIVE" && r.type === "EXPENSE").length;
  }, [recurrings]);

  // Handle adding new item
  const handleOpenAdd = useCallback(() => {
    setEditingRecurring(null);
    setIsFormOpen(true);
  }, []);

  // Handle editing item
  const handleOpenEdit = useCallback((recurring) => {
    setEditingRecurring(recurring);
    setIsFormOpen(true);
  }, []);

  // Handle card click (open detail)
  const handleCardClick = useCallback((recurring) => {
    setSelectedRecurring(recurring);
    setIsDetailOpen(true);
  }, []);

  // Form submit handler
  const handleFormSubmit = async (payload) => {
    let success = false;
    if (editingRecurring) {
      const res = await updateRecurring(editingRecurring.id, payload);
      if (res) success = true;
    } else {
      const res = await createRecurring(payload);
      if (res) success = true;
    }

    if (success) {
      setIsFormOpen(false);
      setEditingRecurring(null);
    }
  };

  // Date Selection Toggle
  const handleDateClick = useCallback((date) => {
    setSelectedDate((prev) => {
      if (prev && prev.isSame(date, "day")) {
        return null; // deselect
      }
      return date;
    });
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 animate-fade-slide-up select-none">
      
      {/* ─── DESKTOP VIEWPORT ─── */}
      <div className="hidden lg:block">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 mb-6 border-b border-[var(--border-color)]/60">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                Berulang
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">
                Kelola pengeluaran dan pemasukan otomatis Anda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder-[var(--text-tertiary)]/75"
                placeholder="Cari jadwal..."
              />
            </div>
          </div>
        </header>

        {/* Two Column Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column (40% width on desktop) */}
          <div className="w-full lg:w-[40%] flex flex-col gap-6 lg:sticky lg:top-6">
            {/* Commitment Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-500 p-6 text-white shadow-lg flex flex-col min-h-[460px]">
              {/* Header: Month Selector */}
              <div className="flex justify-between items-center mb-6 z-10">
                <div className="text-left">
                  <h3 className="text-lg font-black tracking-tight text-white/95 uppercase">
                    {monthNames[activeMonth.month()]} {activeMonth.year()}
                  </h3>
                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mt-0.5">
                    Ringkasan Jadwal
                  </p>
                </div>
                <div className="flex gap-1.5 bg-white/10 rounded-xl p-1 border border-white/10">
                  <button
                    onClick={prevMonth}
                    className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-indigo-100 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer text-indigo-100 hover:text-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-y-4 text-center text-xs mb-6 z-10">
                {/* Weekdays */}
                {daysOfWeek.map((day, idx) => (
                  <div key={idx} className="font-bold text-[10px] text-indigo-100/60 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
                {/* Calendar Days */}
                {calendarCells.map(({ date, isCurrentMonth }, idx) => {
                  const isSelected = selectedDate && selectedDate.isSame(date, "day");
                  const isToday = dayjs().isSame(date, "day");
                  const matchingRecurrings = recurrings.filter(
                    (r) => r.status === "ACTIVE" && dayjs(r.nextRunDate).isSame(date, "day")
                  );
                  const hasExecution = matchingRecurrings.length > 0;
                  const hasIncome = matchingRecurrings.some((r) => r.type === "INCOME");
                  const hasExpense = matchingRecurrings.some((r) => r.type === "EXPENSE");

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      className={clsx(
                        "py-2 relative font-bold text-xs flex flex-col items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 rounded-xl",
                        !isCurrentMonth && "opacity-40",
                        isSelected
                          ? "bg-white/20 text-white shadow-sm"
                          : "hover:bg-white/10",
                        isToday && !isSelected && "ring-1 ring-white/50"
                      )}
                    >
                      <span>{date.date()}</span>
                      {hasExecution && (
                        <span
                          className={clsx(
                            "absolute bottom-0.5 w-1 h-1 rounded-full",
                            isSelected
                              ? "bg-white"
                              : hasIncome && !hasExpense
                              ? "bg-emerald-400"
                              : hasExpense && !hasIncome
                              ? "bg-rose-400"
                              : "bg-amber-400"
                          )}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer Inside Card */}
              <div className="mt-auto pt-6 flex gap-4 items-center border-t border-white/10 z-10">
                <div className="flex-1 text-left">
                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest">
                    Total Estimasi Bulan Ini
                  </p>
                  <p className="text-xl font-extrabold tracking-tight mt-1 tabular-nums">
                    {formatCurrency(monthlyCommitment)}
                  </p>
                </div>
                <div className="flex -space-x-2">
                  {activeIncomeCount > 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold" title={`${activeIncomeCount} Income Aktif`}>
                      {activeIncomeCount}
                    </div>
                  )}
                  {activeExpenseCount > 0 && (
                    <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-rose-500/30 flex items-center justify-center text-[10px] font-bold" title={`${activeExpenseCount} Expense Aktif`}>
                      {activeExpenseCount}
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative pattern */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Add Recurring dashed button */}
            <button
              onClick={handleOpenAdd}
              className="w-full border-2 border-dashed border-[var(--border-color)] hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-[var(--text-secondary)] hover:text-indigo-600 py-4 rounded-3xl font-bold text-xs flex items-center justify-center gap-2 transition-all group cursor-pointer"
            >
              <PlusCircle className="transition-transform group-hover:rotate-90 h-4.5 w-4.5" />
              Tambah Pengulangan
            </button>
          </div>

          {/* Right Column (60% width on desktop) */}
          <div className="w-full lg:w-[60%] flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-black uppercase tracking-wider text-[var(--text-primary)]">
                  Pengulangan Aktif
                </h3>
                <span className="px-2.5 py-0.5 bg-[var(--bg-tertiary)] border border-[var(--border-color)]/30 rounded-full font-bold text-[10px] text-[var(--text-secondary)]">
                  {activeCount} Aktif
                </span>
              </div>
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                >
                  <X className="h-3 w-3" /> Bersihkan Filter
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {isLoading && recurrings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2.5" />
                  <p className="text-xs text-[var(--text-secondary)] font-medium">
                    Memproses data transaksi berulang...
                  </p>
                </div>
              ) : searchFilteredRecurrings.length > 0 ? (
                searchFilteredRecurrings.map((item) => (
                  <RecurringCard
                    key={item.id}
                    recurring={item}
                    onToggle={toggleStatus}
                    onClick={handleCardClick}
                    onEdit={handleOpenEdit}
                    onDelete={deleteRecurring}
                  />
                ))
              ) : (
                /* Empty state */
                <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-14 px-6 text-center shadow-xs">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100 dark:border-transparent">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
                    Tidak Ada Transaksi Berulang
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto font-medium leading-relaxed">
                    {selectedDate
                      ? `Tidak ada transaksi berulang yang dijadwalkan pada tanggal ${selectedDate.date()} ${monthNames[selectedDate.month()]} ${selectedDate.year()}.`
                      : searchQuery
                      ? `Tidak ditemukan rencana berulang yang cocok dengan "${searchQuery}".`
                      : "Anda belum menyusun jadwal transaksi berulang bulanan/mingguan/harian."}
                  </p>
                  <button
                    onClick={handleOpenAdd}
                    className="mt-6 text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 mx-auto transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Rencana Pertama
                  </button>
                </div>
              )}
            </div>

            {/* Ad Banner / Tip */}
            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
              <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400 shrink-0">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Hemat dengan Pengulangan</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Gunakan transaksi berulang untuk tagihan bulanan Anda agar terhindar dari denda keterlambatan pembayaran. Konsultasikan detail tagihan Anda dengan AI!
                </p>
              </div>
              <button
                onClick={() => navigate("/chat")}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all self-end sm:self-auto cursor-pointer"
              >
                Tanya AI
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ─── MOBILE VIEWPORT ─── */}
      <div className="block lg:hidden px-2">
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl -mx-4 px-4 py-4 flex justify-between items-center border-b border-[var(--border-color)]/30 mb-6">
          <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Berulang</h1>
          <button 
            onClick={handleOpenAdd}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md active:scale-90 transition-transform cursor-pointer"
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        <main className="space-y-6">
          {/* Commitment Card */}
          <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-500 rounded-3xl p-6 text-white shadow-xl">
            {/* Background Decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col min-[380px]:flex-row justify-between items-start min-[380px]:items-center gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold opacity-85 uppercase tracking-wider">Komitmen Bulanan</p>
                <h2 className="text-2xl font-black mt-1 tabular-nums">{formatCurrency(monthlyCommitment)}</h2>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 select-none">
                <button onClick={prevMonth} className="active:scale-75 transition-transform cursor-pointer">
                  <ChevronLeft className="h-4.5 w-4.5 text-white" />
                </button>
                <span className="text-xs font-bold whitespace-nowrap">
                  {monthNames[activeMonth.month()]} {activeMonth.year()}
                </span>
                <button onClick={nextMonth} className="active:scale-75 transition-transform cursor-pointer">
                  <ChevronRight className="h-4.5 w-4.5 text-white" />
                </button>
              </div>
            </div>

            {/* Mini Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mt-4 sm:gap-2 sm:mt-6">
              {/* Day Names */}
              {daysOfWeek.map((day, idx) => (
                <div key={idx} className="text-center text-[10px] font-bold opacity-60 uppercase">
                  {day}
                </div>
              ))}
              {/* Dates */}
              {calendarCells.map(({ date, isCurrentMonth }, idx) => {
                const isSelected = selectedDate && selectedDate.isSame(date, "day");
                const isToday = dayjs().isSame(date, "day");
                const matchingRecurrings = recurrings.filter(
                  (r) => r.status === "ACTIVE" && dayjs(r.nextRunDate).isSame(date, "day")
                );
                const hasExecution = matchingRecurrings.length > 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={clsx(
                      "aspect-square flex flex-col items-center justify-center font-bold text-xs relative transition-transform duration-100 rounded-lg cursor-pointer",
                      !isCurrentMonth && "opacity-40",
                      isSelected
                        ? "bg-white/20 text-white shadow-sm"
                        : "hover:bg-white/10",
                      isToday && !isSelected && "ring-1 ring-white/50"
                    )}
                  >
                    <span>{date.date()}</span>
                    {hasExecution && (
                      <div className={clsx(
                        "w-1 h-1 rounded-full absolute bottom-1",
                        isSelected ? "bg-white" : "bg-indigo-300"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Search bar mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl pl-9 pr-4 py-3.5 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all placeholder-[var(--text-tertiary)]/75"
              placeholder="Cari jadwal berulang..."
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Active Section Header */}
          <section className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {selectedDate ? "Hasil Pencarian" : "Pengulangan Aktif"}
              </h3>
              <span className="px-3 py-1 bg-[var(--bg-tertiary)] text-indigo-600 dark:text-indigo-400 border border-[var(--border-color)]/40 rounded-full font-bold text-xs">
                {searchFilteredRecurrings.filter(r => r.status === "ACTIVE").length} Aktif
              </span>
            </div>

            {/* Recurring Cards */}
            <div className="space-y-4">
              {isLoading && recurrings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Memproses...</p>
                </div>
              ) : searchFilteredRecurrings.length > 0 ? (
                searchFilteredRecurrings.map((item) => {
                  const { icon: CustomIcon, bgClass } = getMobileIcon(item.title, item.type === "INCOME");
                  const isActive = item.status === "ACTIVE";
                  const isIncome = item.type === "INCOME";

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      className={clsx(
                        "bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-4 rounded-2xl flex items-center gap-4 transition-all duration-150 cursor-pointer hover:shadow-md",
                        !isActive && "opacity-60 bg-[var(--bg-primary)]/70"
                      )}
                    >
                      <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-xs", bgClass)}>
                        <CustomIcon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.title}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              <span className={clsx(
                                "text-[9px] px-2 py-0.5 rounded font-bold uppercase border",
                                isIncome 
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                  : "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                              )}>
                                {frequencyMap[item.frequency] || item.frequency}
                              </span>
                              <span className="text-[var(--text-tertiary)] font-bold text-xs whitespace-nowrap">
                                Tiap tgl {dayjs(item.nextRunDate).format("DD")}
                              </span>
                            </div>
                          </div>
                          
                          {/* Switch toggle */}
                          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox" 
                              checked={isActive} 
                              onChange={() => toggleStatus(item.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                          </label>
                        </div>
                        
                        <div className="flex justify-between items-center mt-3 gap-2">
                          <div className="flex items-center gap-1 text-[var(--text-tertiary)] min-w-0">
                            <Coins className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs truncate">{item.wallet?.name || "Dompet Utama"}</span>
                          </div>
                          <span className={clsx(
                            "font-bold text-base tabular-nums shrink-0",
                            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"
                          )}>
                            {isIncome ? "+" : "-"}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-12 px-6 text-center shadow-xs">
                  <AlertCircle className="h-7 w-7 text-[var(--text-tertiary)] mx-auto mb-3" />
                  <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                    Tidak ada rencana
                  </h3>
                  <p className="text-xs text-[var(--text-tertiary)] font-medium leading-relaxed max-w-xs mx-auto">
                    {selectedDate
                      ? "Tidak ada pengulangan pada tanggal terpilih."
                      : "Belum ada rencana pengulangan terdaftar."}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* AI Smart Suggestion (Ad Banner / Tip) */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-3xl flex flex-col gap-4 text-left mt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">Hemat dengan Pengulangan</h4>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Gunakan transaksi berulang untuk tagihan bulanan Anda agar terhindar dari denda keterlambatan pembayaran. Konsultasikan detail tagihan Anda dengan AI!
            </p>
            <button
              onClick={() => navigate("/chat")}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer shadow-sm active:scale-98"
            >
              Tanya AI
            </button>
          </div>
        </main>
      </div>

      {/* MODAL DETAILED VIEW */}
      <RecurringDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        recurring={selectedRecurring}
        onEdit={handleOpenEdit}
        onDelete={deleteRecurring}
        onExecute={executeRecurring}
        onToggle={toggleStatus}
      />

      {/* MODAL EDITOR SHEET */}
      <RecurringForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingRecurring(null);
        }}
        onSubmit={handleFormSubmit}
        wallets={wallets}
        recurring={editingRecurring}
        isLoading={isLoading}
      />
    </div>
  );
});

export default RecurringPage;
