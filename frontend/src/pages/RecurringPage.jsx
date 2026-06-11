import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRecurring } from "../hooks/useRecurring";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency, formatDate } from "../utils/format";
import RecurringCard from "../components/recurring/RecurringCard";
import RecurringForm from "../components/recurring/RecurringForm";
import RecurringDetail from "../components/recurring/RecurringDetail";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, AlertCircle, X, Filter } from "lucide-react";
import dayjs from "dayjs";
import clsx from "clsx";
import Button from "../components/common/Button";

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

const daysOfWeek = ["Sn", "Sl", "Rb", "Km", "Jm", "Sb", "Mg"];

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

  // Date filtering logic
  const filteredRecurrings = useMemo(() => {
    if (!selectedDate) return recurrings;
    return recurrings.filter((r) =>
      dayjs(r.nextRunDate).isSame(selectedDate, "day")
    );
  }, [recurrings, selectedDate]);

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
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-24 animate-fade-slide-up select-none">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)] cursor-pointer transition-colors lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
              Transaksi Berulang
            </h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5 hidden sm:block">
              Jadwalkan pengeluaran dan pemasukan rutin Anda secara berkala.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Rencana
        </button>
      </div>

      {/* COMMITMENT CARD (Ollo Style Gradient) */}
      <div className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-6 bg-gradient-to-br from-indigo-600 via-indigo-600 to-purple-600">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Month Selector & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-100">
              Komitmen Pengeluaran Bulanan
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1.5 tabular-nums">
              {formatCurrency(monthlyCommitment)}
            </h1>
          </div>
          
          <div className="flex items-center gap-1.5 bg-white/10 rounded-2xl p-1 border border-white/10">
            <button
              onClick={prevMonth}
              className="p-1.5 hover:bg-white/15 rounded-xl transition-colors cursor-pointer text-indigo-100 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-black px-1.5 min-w-[95px] text-center uppercase tracking-wider">
              {monthNames[activeMonth.month()]} {activeMonth.year()}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 hover:bg-white/15 rounded-xl transition-colors cursor-pointer text-indigo-100 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Short info footer inside card */}
        <div className="flex justify-between items-center pt-4 text-xs font-semibold text-indigo-100">
          <span>Total Jadwal Aktif:</span>
          <span className="bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
            {activeCount} Transaksi
          </span>
        </div>
      </div>

      {/* MINI CALENDAR BOARD */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-5 mb-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Kalender Jadwal Eksekusi
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" /> Bersihkan Filter ({selectedDate.date()} {monthNames[selectedDate.month()]})
            </button>
          )}
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-extrabold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {calendarCells.map(({ date, isCurrentMonth }, idx) => {
            const isSelected = selectedDate && selectedDate.isSame(date, "day");
            const isToday = dayjs().isSame(date, "day");
            
            // Check if day matches any recurring nextRunDate
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
                  "aspect-square rounded-2xl text-xs flex flex-col items-center justify-center font-bold cursor-pointer relative transition-all duration-150 active:scale-90",
                  isCurrentMonth
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-tertiary)] opacity-35",
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "hover:bg-[var(--bg-tertiary)] bg-[var(--bg-secondary)] border border-[var(--border-color)]/30",
                  isToday && !isSelected && "border-indigo-500 border-2"
                )}
              >
                <span>{date.date()}</span>

                {/* Glow Bullet dot marker */}
                {hasExecution && (
                  <span
                    className={clsx(
                      "absolute bottom-1.5 h-1.5 w-1.5 rounded-full ring-1",
                      isSelected
                        ? "bg-white ring-indigo-600"
                        : hasIncome && !hasExpense
                        ? "bg-emerald-500 ring-emerald-500/20 animate-pulse"
                        : "bg-indigo-500 ring-indigo-500/20 animate-pulse"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RECURRING LIST */}
      <div className="space-y-3">
        <div className="flex justify-between items-baseline px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)]">
            Daftar Jadwal Transaksi
          </h3>
          <span className="text-[10px] text-[var(--text-tertiary)] font-bold">
            {filteredRecurrings.length} Rencana Terpajang
          </span>
        </div>

        {isLoading && recurrings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mb-2.5" />
            <p className="text-xs text-[var(--text-secondary)] font-medium">
              Memproses data transaksi berulang...
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecurrings.length > 0 ? (
              filteredRecurrings.map((item) => (
                <RecurringCard
                  key={item.id}
                  recurring={item}
                  onToggle={toggleStatus}
                  onClick={handleCardClick}
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
                    : "Anda belum menyusun jadwal transaksi berulang bulanan/mingguan/harian."}
                </p>
                <Button onClick={handleOpenAdd} className="mt-6 text-xs py-2 px-4">
                  <Plus className="h-4.5 w-4.5" />
                  Tambah Rencana Pertama
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button (Mobile only) */}
      <button
        onClick={handleOpenAdd}
        className="sm:hidden fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
        title="Tambah Rencana"
      >
        <Plus className="h-7 w-7" />
      </button>

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
