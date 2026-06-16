import { memo, useState, useCallback, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  PlusCircle, 
  RefreshCw, 
  CalendarCheck, 
  CheckCircle2, 
  ChevronDown, 
  AlertCircle, 
  Clock, 
  FileText 
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import toast from "react-hot-toast";

import { useBill } from "../hooks/useBill";
import BillCard from "../components/bills/BillCard";
import BillForm from "../components/bills/BillForm";
import BillDetail from "../components/bills/BillDetail";
import PayConfirmSheet from "../components/bills/PayConfirmSheet";
import { formatCurrency } from "../utils/format";

dayjs.locale("id");

const BillsPage = memo(function BillsPage() {
  const {
    bills,
    summary,
    isLoading,
    activeMonth,
    activeFilter,
    filteredBills,
    groupedBills,
    setActiveFilter,
    prevMonth,
    nextMonth,
    fetchBills,
    createBill,
    updateBill,
    payBill,
    unpayBill,
    deleteBill,
    generateFromRecurring,
  } = useBill();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [payItem, setPayItem] = useState(null);
  const [showPaid, setShowPaid] = useState(false);

  const handleCreate = useCallback(async (data) => {
    await createBill(data);
    setShowForm(false);
  }, [createBill]);

  const handleUpdate = useCallback(async (data) => {
    if (editItem) {
      await updateBill(editItem.id, data);
    }
    setEditItem(null);
    setDetailItem(null);
  }, [editItem, updateBill]);

  const handlePay = useCallback(async (id, walletId, paidAt) => {
    await payBill(id, walletId, paidAt);
    setPayItem(null);
    setDetailItem(null);
  }, [payBill]);

  const handleUnpay = useCallback(async (id) => {
    await unpayBill(id);
    setDetailItem(null);
  }, [unpayBill]);

  const handleDelete = useCallback(async (id) => {
    await deleteBill(id);
    setDetailItem(null);
  }, [deleteBill]);

  const handleGenerate = useCallback(async () => {
    const toastId = toast.loading("Sinkronisasi dari Berulang...");
    try {
      await generateFromRecurring(toastId);
    } catch {
      // Toast error is handled by the hook
    }
  }, [generateFromRecurring]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header (sticky, mobile view only) */}
      <header className="sticky top-0 z-20 
        bg-[var(--bg-primary)]/80 backdrop-blur-md 
        border-b border-[var(--border-color)] 
        px-4 py-3 flex justify-between items-center lg:hidden">
        
        <h1 className="text-xl font-black tracking-tight 
          text-indigo-600 dark:text-indigo-400">
          Tagihan
        </h1>
        
        {/* Month navigation */}
        <div className="flex items-center gap-3 
          bg-[var(--bg-secondary)] px-3 py-1.5 
          rounded-full border border-[var(--border-color)]">
          <button onClick={prevMonth}
            className="text-indigo-600 dark:text-indigo-400 active:scale-95 cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-xs 
            text-[var(--text-primary)] min-w-[80px] 
            text-center">
            {activeMonth.locale("id").format("MMMM YYYY")}
          </span>
          <button onClick={nextMonth}
            className="text-indigo-600 dark:text-indigo-400 active:scale-95 cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button onClick={() => setShowForm(true)}
          className="w-10 h-10 rounded-full bg-indigo-600 
            text-white flex items-center justify-center 
            shadow-md active:scale-95 transition-all cursor-pointer">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Main Container Layout */}
      {/* Mobile: single column; Desktop: 10-column grid */}
      <div className="lg:grid lg:grid-cols-10 lg:gap-8 
        lg:max-w-[1280px] lg:mx-auto lg:px-8 lg:py-8">
        
        {/* LEFT COLUMN — desktop only (3/10 columns) */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          
          {/* Summary Card gradient */}
          <div className="p-8 rounded-[2rem] 
            bg-gradient-to-br from-indigo-600 to-indigo-900 
            text-white shadow-xl relative overflow-hidden">
            {/* Dot pattern */}
            <div className="absolute inset-0 opacity-10 card-pattern" />
            
            <p className="text-xs uppercase tracking-widest 
              opacity-80 mb-2 font-semibold">
              Total Belum Lunas
            </p>
            <p className="text-4xl font-black tracking-tight 
              mb-6 tabular-nums">
              {formatCurrency(summary.totalUnpaid)}
            </p>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 bg-white/20 
                rounded-full text-xs font-semibold">
                {summary.countUnpaid} Tagihan Tersisa
              </span>
              {summary.countOverdue > 0 && (
                <span className="px-3 py-1 
                  bg-red-400/30 rounded-full 
                  text-xs font-semibold border 
                  border-red-200/20">
                  {summary.countOverdue} Terlambat
                </span>
              )}
            </div>
          </div>

          {/* Month navigation desktop */}
          <div className="flex items-center justify-between 
            p-4 bg-[var(--card-bg)] border 
            border-[var(--border-color)] rounded-2xl shadow-sm">
            <button onClick={prevMonth} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer">
              <ChevronLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </button>
            <span className="font-bold text-sm text-[var(--text-primary)]">
              {activeMonth.locale("id").format("MMMM YYYY")}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg cursor-pointer">
              <ChevronRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </button>
          </div>

          {/* Vertical filter (desktop) */}
          <div className="bg-[var(--card-bg)] border 
            border-[var(--border-color)] rounded-2xl 
            overflow-hidden shadow-sm">
            {[
              { value: "ALL", label: "Semua", count: bills.length },
              { value: "UNPAID", label: "Belum Lunas", count: summary.countUnpaid },
              { value: "PAID", label: "Sudah Lunas", count: summary.countPaid },
              { value: "OVERDUE", label: "Terlambat", count: summary.countOverdue },
            ].map(({ value, label, count }) => (
              <button key={value}
                onClick={() => setActiveFilter(value)}
                className={`w-full flex justify-between 
                  items-center px-6 py-4 transition-all cursor-pointer border-b border-[var(--border-color)] last:border-b-0
                  ${activeFilter === value
                    ? "bg-indigo-50/50 dark:bg-indigo-950/10 border-l-4 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] border-l-4 border-transparent"
                  }`}
              >
                <span className="text-sm font-medium">
                  {label}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold
                  ${value === "OVERDUE" && count > 0
                    ? "bg-red-100 text-red-600 dark:bg-red-950/45 dark:text-red-400"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Generate from recurring button */}
          <button onClick={handleGenerate}
            className="w-full flex items-center justify-center 
              gap-2 py-3.5 bg-[var(--bg-secondary)] 
              border border-[var(--border-color)] 
              rounded-xl text-xs font-bold 
              text-[var(--text-secondary)] hover:text-amber-600 hover:border-amber-400 dark:hover:text-amber-400 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <RefreshCw className="w-4 h-4" />
            Sinkronisasi dari Berulang
          </button>

          {/* Add button desktop */}
          <button onClick={() => setShowForm(true)}
            className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700
              text-white rounded-2xl font-bold text-base
              flex items-center justify-center gap-3 
              shadow-lg hover:brightness-105 
              active:scale-[0.98] transition-all cursor-pointer"
          >
            <PlusCircle className="w-5.5 h-5.5" />
            Tambah Tagihan
          </button>
        </div>

        {/* RIGHT COLUMN — desktop 7/10, mobile full layout */}
        <div className="lg:col-span-7 space-y-4 px-4 lg:px-0 pt-4 lg:pt-0">
          
          {/* Mobile: Summary Card */}
          <div className="lg:hidden relative overflow-hidden 
            rounded-2xl p-6 text-white shadow-lg"
            style={{background: "linear-gradient(135deg, #3525cd 0%, #4338ca 100%)"}}
          >
            <div className="absolute inset-0 opacity-10 card-pattern" />
            <div className="relative z-10 space-y-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-85 mb-1">
                  Tagihan Bulan Ini
                </p>
                <h2 className="text-3xl font-black tabular-nums">
                  {formatCurrency(summary.totalUnpaid)}
                </h2>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1.5 
                  bg-red-400/20 px-3 py-1.5 rounded-full 
                  border border-white/10">
                  <span className="w-2 h-2 rounded-full 
                    bg-red-400 animate-pulse" />
                  <span className="text-[10px] font-bold">
                    {summary.countUnpaid} Belum Lunas
                  </span>
                </div>
                <div className="flex items-center gap-1.5 
                  bg-emerald-400/20 px-3 py-1.5 rounded-full 
                  border border-white/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold">
                    {summary.countPaid} Sudah Lunas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Filter Tabs horizontal scroll */}
          <div className="lg:hidden flex gap-2 
            overflow-x-auto scrollbar-none py-1">
            {["ALL","UNPAID","PAID","OVERDUE"].map((f) => (
              <button key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-full 
                  text-xs font-extrabold whitespace-nowrap 
                  transition-all cursor-pointer
                  ${activeFilter === f
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]"
                  }`}
              >
                {f === "ALL" ? "Semua" :
                 f === "UNPAID" ? "Belum Lunas" :
                 f === "PAID" ? "Sudah Lunas" : "Terlambat"}
              </button>
            ))}
          </div>

          {/* Sync Trigger Mobile Floating Bar (Only shows when no bills and mobile) */}
          <div className="lg:hidden flex gap-2">
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold text-[var(--text-secondary)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tarik Dari Berulang
            </button>
          </div>

          {/* Bills list - loader / empty / grouped (desktop) / flat (mobile) */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl 
                  bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse" />
              ))}
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="flex flex-col items-center 
              justify-center py-16 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-8 shadow-sm">
              <CalendarCheck className="w-16 h-16 
                text-[var(--text-tertiary)] mb-4" />
              <p className="font-extrabold text-base text-[var(--text-primary)]">
                Tidak ada tagihan bulan ini
              </p>
              <p className="text-xs 
                text-[var(--text-tertiary)] mt-1 mb-6 max-w-xs leading-normal">
                Tambahkan tagihan atau tarik transaksi berulang yang sudah Anda jadwalkan sebelumnya.
              </p>
              <button onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700
                  text-white rounded-xl font-bold text-xs shadow cursor-pointer transition-all active:scale-95"
              >
                + Tambah Tagihan
              </button>
            </div>
          ) : (
            <>
              {/* Desktop view: Grouped sections */}
              <div className="hidden lg:block space-y-6">
                
                {/* 1. Overdue List */}
                {groupedBills.overdue.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-5 bg-red-500 rounded-full" />
                      <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">
                        Terlambat
                      </h3>
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded text-[9px] font-extrabold uppercase">
                        Segera Bayar
                      </span>
                    </div>
                    <div className="space-y-3">
                      {groupedBills.overdue.map((bill) => (
                        <BillCard key={bill.id} bill={bill}
                          onTap={() => setDetailItem(bill)}
                          onPay={() => setPayItem(bill)} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 2. Upcoming List */}
                {groupedBills.upcoming.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-5 bg-amber-400 rounded-full" />
                      <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">
                        Jatuh Tempo Minggu Ini
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {groupedBills.upcoming.map((bill) => (
                        <BillCard key={bill.id} bill={bill}
                          onTap={() => setDetailItem(bill)}
                          onPay={() => setPayItem(bill)} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 3. Normal / This month List */}
                {groupedBills.thisMonth.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                      <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">
                        Bulan Ini
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {groupedBills.thisMonth.map((bill) => (
                        <BillCard key={bill.id} bill={bill}
                          onTap={() => setDetailItem(bill)}
                          onPay={() => setPayItem(bill)} />
                      ))}
                    </div>
                  </section>
                )}

                {/* 4. Paid List with accordion toggles */}
                {groupedBills.paid.length > 0 && (
                  <section className="space-y-3">
                    <button
                      onClick={() => setShowPaid((s) => !s)}
                      className="w-full flex items-center 
                        justify-between p-4 
                        bg-emerald-50 dark:bg-emerald-950/20 
                        rounded-2xl border border-emerald-200 
                        dark:border-emerald-800/40 
                        hover:bg-emerald-100/30 dark:hover:bg-emerald-950/35 transition-all cursor-pointer shadow-sm text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
                        <h3 className="font-bold text-sm
                          text-emerald-700 dark:text-emerald-400">
                          Sudah Lunas
                        </h3>
                        <span className="px-2 py-0.5 
                          bg-emerald-500 text-white 
                          rounded-full text-[10px] font-black">
                          {groupedBills.paid.length}
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 
                        text-emerald-600 dark:text-emerald-400 transition-transform duration-250
                        ${showPaid ? "rotate-180" : ""}`} />
                    </button>
                    {showPaid && (
                      <div className="space-y-3 animate-fade-in">
                        {groupedBills.paid.map((bill) => (
                          <BillCard key={bill.id} bill={bill}
                            onTap={() => setDetailItem(bill)}
                            onPay={() => setPayItem(bill)} />
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Mobile view: Flat list representation */}
              <div className="lg:hidden space-y-3 pb-8">
                {filteredBills.map((bill) => (
                  <BillCard key={bill.id} bill={bill}
                    onTap={() => setDetailItem(bill)}
                    onPay={() => setPayItem(bill)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Render Portal Sheets */}
      {showForm && (
        <BillForm 
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)} 
        />
      )}
      {editItem && (
        <BillForm 
          initialData={editItem}
          onSubmit={handleUpdate}
          onClose={() => setEditItem(null)} 
        />
      )}
      {detailItem && (
        <BillDetail 
          bill={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={() => setEditItem(detailItem)}
          onPay={() => setPayItem(detailItem)}
          onUnpay={() => handleUnpay(detailItem?.id)}
          onDelete={handleDelete} 
        />
      )}
      {payItem && (
        <PayConfirmSheet 
          bill={payItem}
          onPay={handlePay}
          onClose={() => setPayItem(null)} 
        />
      )}
    </div>
  );
});

export default BillsPage;
