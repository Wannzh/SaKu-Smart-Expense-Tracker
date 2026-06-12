import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useBudget } from "../hooks/useBudget";
import { useCategory } from "../hooks/useCategory";
import { useTransaction } from "../hooks/useTransaction";
import { formatCurrency, cleanDescription } from "../utils/format";
import * as LucideIcons from "lucide-react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Loader2,
  PieChart,
  Edit2,
  AlertTriangle,
  ChevronDown,
  X,
  Wallet
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import clsx from "clsx";

dayjs.locale("id");

const formatRp = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace(/\s/g, "");
};

const SemiCircleGauge = memo(function SemiCircleGauge({ percentage, color = "#6366F1" }) {
  const radius = 50;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, percentage) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center h-28 w-40 mx-auto select-none">
      <svg className="w-full h-full" viewBox="0 0 120 70">
        <path
          d="M 10,60 A 50,50 0 0,1 110,60"
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d="M 10,60 A 50,50 0 0,1 110,60"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute bottom-1 flex flex-col items-center">
        <span className="text-2xl font-black text-[var(--text-primary)] leading-none">
          {percentage}%
        </span>
        <span className="text-[10px] text-[var(--text-tertiary)] font-extrabold uppercase mt-1">
          Terpakai
        </span>
      </div>
    </div>
  );
});

const BudgetPage = memo(function BudgetPage() {
  const navigate = useNavigate();
  const { budgets, isLoading, getBudgets, upsertBudget, deleteBudget } = useBudget();
  const { expenseCategories, getCategories: fetchCategories } = useCategory();
  const { getTransactions: fetchTransactions } = useTransaction();

  const [view, setView] = useState("list");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [relatedTransactions, setRelatedTransactions] = useState([]);
  const [currentDate, setCurrentDate] = useState(() => dayjs());

  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    name: "",
  });

  useEffect(() => {
    const month = currentDate.month() + 1;
    const year = currentDate.year();
    getBudgets(month, year);
  }, [currentDate, getBudgets]);

  useEffect(() => {
    fetchCategories("EXPENSE");
  }, [fetchCategories]);

  useEffect(() => {
    if (view === "detail" && selectedBudget) {
      const start = currentDate.startOf("month").format("YYYY-MM-DD");
      const end = currentDate.endOf("month").format("YYYY-MM-DD");

      fetchTransactions({
        categoryId: selectedBudget.categoryId,
        dateFrom: start,
        dateTo: end,
      }).then((list) => {
        const sorted = [...list].sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
        setRelatedTransactions(sorted);
      });
    }
  }, [view, selectedBudget, currentDate, fetchTransactions]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate((prev) => prev.subtract(1, "month"));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate((prev) => prev.add(1, "month"));
  }, []);

  const summary = useMemo(() => {
    const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
    const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent), 0);
    const totalRemaining = totalBudget - totalSpent;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      overallPercentage: Number(overallPercentage.toFixed(1)),
    };
  }, [budgets]);

  const availableCategories = useMemo(() => {
    return expenseCategories.filter(
      (cat) => !budgets.some((b) => b.categoryId === cat.id)
    );
  }, [expenseCategories, budgets]);

  const handleOpenAddView = useCallback(() => {
    setFormData({
      categoryId: "",
      amount: "",
      name: "",
    });
    setView("add");
  }, []);

  const handleOpenEditView = useCallback((budget) => {
    setFormData({
      categoryId: budget.categoryId,
      amount: budget.amount.toString(),
      name: `Anggaran ${budget.category.name} Bulanan`,
    });
    setView("edit");
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount) return;

    const targetCategoryId = formData.categoryId;
    const success = await upsertBudget({
      categoryId: targetCategoryId,
      amount: parseFloat(formData.amount),
      month: currentDate.month() + 1,
      year: currentDate.year(),
    });

    if (success) {
      const updatedList = await getBudgets(currentDate.month() + 1, currentDate.year());
      if (view === "edit") {
        const updated = updatedList.find((b) => b.categoryId === targetCategoryId);
        if (updated) setSelectedBudget(updated);
        setView("detail");
      } else {
        setView("list");
      }
    }
  }, [formData, currentDate, upsertBudget, getBudgets, view]);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Apakah Anda yakin ingin menghapus anggaran ini?")) {
      const success = await deleteBudget(id);
      if (success) {
        getBudgets(currentDate.month() + 1, currentDate.year());
        setView("list");
      }
    }
  }, [deleteBudget, currentDate, getBudgets]);

  const getProgressColorClass = useCallback((percentage) => {
    if (percentage < 50) return "bg-emerald-500";
    if (percentage <= 80) return "bg-amber-500";
    if (percentage <= 100) return "bg-orange-500";
    return "bg-red-500";
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // VIEW 2 — ADD & EDIT FORM VIEW (Optimized for Sidebar)
  // ═══════════════════════════════════════════════════════════════
  if (view === "add" || view === "edit") {
    const isEditMode = view === "edit";

    return (
      <div className="w-full max-w-7xl mx-auto pb-12 min-h-screen bg-[var(--bg-primary)] px-4 sm:px-6 lg:px-8 animate-fade-slide-up">
        {/* HEADER */}
        <div className="flex items-center justify-between py-5 border-b border-[var(--border-color)] mb-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView(isEditMode ? "detail" : "list")}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-black text-[var(--text-primary)]">
              {isEditMode ? "Edit Anggaran" : "Anggaran Baru"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.categoryId || !formData.amount}
            className="px-5 py-2 text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
          >
            Simpan Anggaran
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-5 space-y-6 bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xs">
            {/* Batas Jumlah */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Batas Jumlah
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] px-4 py-3 rounded-2xl border border-[var(--border-color)]">
                  <span className="text-lg font-black text-[var(--text-primary)]">Rp</span>
                  <ChevronDown className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="flex-1 bg-transparent text-4xl font-black text-[var(--text-primary)] outline-none border-b border-transparent focus:border-indigo-500 transition-all placeholder:text-[var(--text-tertiary)] py-1"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
            </div>

            {/* Anggaran Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Nama Anggaran
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="cth. Anggaran Bulanan Saya"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl px-4 py-3.5 text-sm text-[var(--text-primary)] focus:border-indigo-500 outline-none transition-all font-medium"
              />
            </div>

            {/* Periode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Periode
              </label>
              <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-2xl border border-[var(--border-color)] select-none">
                <button
                  type="button"
                  className="flex-1 py-2.5 text-center text-xs font-bold text-[var(--text-tertiary)] rounded-xl cursor-not-allowed"
                  disabled
                >
                  Mingguan
                </button>
                <button
                  type="button"
                  className="flex-1 py-2.5 text-center text-xs font-bold bg-[var(--card-bg)] text-[var(--text-primary)] rounded-xl border border-[var(--border-color)]/10 shadow-sm"
                >
                  Bulanan
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium leading-relaxed">
                Bulanan mengikuti pengaturan hari awal siklus anggaran di profil.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Kategori Selector Grid */}
          <div className="lg:col-span-7 space-y-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xs">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Pilih Kategori
            </label>
            {isEditMode && selectedBudget ? (
              <div className="flex flex-col items-center justify-center p-4 border border-[var(--border-color)] bg-[var(--bg-tertiary)] rounded-2xl max-w-[120px]">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-white mb-2"
                  style={{ backgroundColor: selectedBudget.category.color || "#6366F1" }}
                >
                  {(() => {
                    const Icon = LucideIcons[selectedBudget.category.icon] || LucideIcons.Tag;
                    return <Icon className="h-5 w-5" />;
                  })()}
                </div>
                <span className="text-[10px] font-bold text-[var(--text-primary)] text-center truncate w-full">
                  {selectedBudget.category.name}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {availableCategories.map((cat) => {
                  const Icon = LucideIcons[cat.icon] || LucideIcons.Tag;
                  const isSelected = formData.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: cat.id,
                          name: prev.name || `Anggaran ${cat.name} Bulanan`
                        }));
                      }}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all cursor-pointer",
                        isSelected
                          ? "border-indigo-600 bg-indigo-500/10 scale-102 shadow-xs"
                          : "border-[var(--border-color)] bg-[var(--card-bg)] hover:bg-[var(--bg-tertiary)]"
                      )}
                    >
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm"
                        style={{ backgroundColor: cat.color || "#6366F1" }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-primary)] text-center truncate w-full mt-0.5">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {availableCategories.length === 0 && !isEditMode && (
              <p className="text-xs text-amber-600 font-semibold mt-1 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                Semua kategori pengeluaran sudah memiliki anggaran di bulan ini.
              </p>
            )}
          </div>
        </form>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // VIEW 3 — DETAILED BUDGET VIEW (Optimized for Sidebar)
  // ═══════════════════════════════════════════════════════════════
  if (view === "detail" && selectedBudget) {
    const IconComponent = LucideIcons[selectedBudget.category.icon] || LucideIcons.Tag;
    const catColor = selectedBudget.category.color || "#6366F1";

    return (
      <div className="w-full max-w-7xl mx-auto pb-12 min-h-screen bg-[var(--bg-primary)] px-4 sm:px-6 lg:px-8 animate-fade-slide-up">
        {/* HEADER */}
        <div className="flex items-center justify-between py-5 border-b border-[var(--border-color)] mb-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-black text-[var(--text-primary)]">Detail Anggaran</h2>
          </div>
          <button
            onClick={() => handleOpenEditView(selectedBudget)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-sm font-bold rounded-xl cursor-pointer transition-all"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
        </div>

        {/* MAIN RESPONSIVE CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Info & Actions */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
            {/* MAIN INFO CARD */}
            <div className="bg-[#1e293b] text-slate-100 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">
                    Anggaran {selectedBudget.category.name}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-black tracking-widest uppercase mt-1">
                    MONTHLY BUDGET
                  </p>
                </div>
                <span className="text-xs bg-red-500/25 border border-red-500/30 text-red-300 font-black px-2.5 py-0.5 rounded-lg">
                  {selectedBudget.percentage.toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengeluaran</p>
                  <p className="text-lg font-black text-red-400 mt-0.5">
                    {formatRp(selectedBudget.spent)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sisa</p>
                  <p className={clsx("text-lg font-black mt-0.5", selectedBudget.remaining < 0 ? "text-red-400" : "text-emerald-400")}>
                    {formatRp(selectedBudget.remaining)}
                  </p>
                </div>
              </div>

              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    getProgressColorClass(selectedBudget.percentage)
                  )}
                  style={{ width: `${Math.min(100, selectedBudget.percentage)}%` }}
                />
              </div>

              <p className="text-xs text-slate-400 font-medium text-right">
                Batas Anggaran: <span className="text-white font-black">{formatRp(selectedBudget.amount)}</span>
              </p>
            </div>

            {/* KATEGORI TERPILIH */}
            <div className="space-y-3 bg-[var(--card-bg)] border border-[var(--border-color)] p-5 rounded-3xl">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Kategori Terpilih
              </h3>
              <div className="flex items-center gap-2.5 border border-indigo-600/20 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 font-black px-4 py-3 rounded-2xl w-max text-xs">
                <IconComponent className="h-4 w-4" style={{ color: catColor }} />
                <span>{selectedBudget.category.name}</span>
              </div>
            </div>

            {/* DELETE BUDGET ACTION */}
            <button
              onClick={(e) => handleDelete(e, selectedBudget.id)}
              className="w-full py-3.5 flex items-center justify-center gap-2 border border-red-500/20 hover:border-red-500/40 text-red-500 hover:bg-red-500/5 rounded-2xl font-bold text-sm transition-all cursor-pointer active:scale-98"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Anggaran Ini</span>
            </button>
          </div>

          {/* RIGHT COLUMN: Transactions */}
          <div className="lg:col-span-7 space-y-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-3xl shadow-xs">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">
              Transaksi Terkait Bulan Ini
            </h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {relatedTransactions.length > 0 ? (
                relatedTransactions.map((tx) => {
                  const TxIcon = LucideIcons[tx.category?.icon] || LucideIcons.Tag;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl hover:border-[var(--text-tertiary)]/20 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: tx.category?.color || "#6366F1" }}
                        >
                          <TxIcon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                            {cleanDescription(tx.description) || tx.category?.name}
                          </p>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1 font-medium">
                            <Wallet className="h-3 w-3 inline shrink-0" />
                            {tx.wallet?.name || "Dompet"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase tracking-wider">
                          {dayjs(tx.date).format("DD MMM · HH:mm")}
                        </span>
                        <p className="text-sm font-black text-red-500 mt-0.5">
                          -{formatRp(tx.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-xs text-[var(--text-tertiary)] italic bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl font-medium">
                  Tidak ada transaksi terkait di bulan ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // VIEW 1 — BUDGET LIST VIEW (Optimized for Sidebar)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="w-full max-w-7xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-[var(--bg-primary)] relative animate-fade-slide-up">
      {/* HEADER */}
      <div className="flex items-center justify-between py-5 border-b border-[var(--border-color)] mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)] cursor-pointer transition-colors lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Kelola Anggaran</h2>
        </div>
        
        {/* Desktop Header Action Button - No longer needs floating button on large viewports */}
        <button
          onClick={handleOpenAddView}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/10 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Anggaran</span>
        </button>
      </div>

      {/* RESPONSIVE LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Summary Card (Sticky on Desktop) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 z-10">
          <div className="bg-[#1e293b] text-slate-100 rounded-3xl p-6 shadow-xl flex flex-col items-center border border-slate-800">
            {/* Month navigation inside the card */}
            <div className="flex items-center justify-between w-full mb-5 select-none bg-slate-800/50 p-1.5 rounded-2xl">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-white cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-black tracking-wider text-white uppercase px-1">
                {currentDate.format("MMMM YYYY")}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/10 rounded-xl transition-all text-white cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-between items-start w-full mb-5">
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Sisa Dompet Belanja
                </p>
                <p className="text-2xl font-black mt-1 text-white truncate">
                  {formatRp(Math.max(0, summary.totalRemaining))}
                </p>
                <p className="text-[9px] text-slate-400 mt-2 font-semibold">
                  Siklus: {currentDate.startOf("month").format("D MMM")} - {currentDate.endOf("month").format("D MMM")}
                </p>
              </div>

              {summary.totalRemaining < 0 ? (
                <span className="flex items-center gap-1 shrink-0 bg-red-500/20 text-red-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-red-500/30">
                  <AlertTriangle className="h-3 w-3" />
                  OVER
                </span>
              ) : (
                <span className="flex items-center gap-1 shrink-0 bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-emerald-500/30 select-none">
                  <LucideIcons.CheckCircle className="h-3 w-3" />
                  AMAN
                </span>
              )}
            </div>

            {/* SVG Gauge */}
            <SemiCircleGauge
              percentage={summary.overallPercentage}
              color={summary.totalRemaining < 0 ? "#EF4444" : "#6366F1"}
            />

            {/* Aggregate sum display */}
            <div className="text-center mt-4 pt-4 border-t border-slate-800 w-full select-none">
              <p className="text-xs font-bold text-slate-300">
                Total Terpakai: <span className="text-white font-black">{formatRp(summary.totalSpent)}</span>
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                dari alokasi keseluruhan {formatRp(summary.totalBudget)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: budgets list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between select-none mb-2">
            <h3 className="text-sm font-black text-[var(--text-secondary)] uppercase tracking-wider">
              Daftar Alokasi Anggaran ({budgets.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-600 mb-3" />
              <p className="text-xs text-[var(--text-secondary)] font-medium">Sinkronisasi data anggaran...</p>
            </div>
          ) : budgets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const IconComponent = LucideIcons[budget.category.icon] || LucideIcons.Tag;
                const isOver = budget.isOverBudget;

                return (
                  <div
                    key={budget.id}
                    onClick={() => {
                      setSelectedBudget(budget);
                      setView("detail");
                    }}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-indigo-500/40 rounded-2xl p-4.5 transition-all hover:shadow-sm cursor-pointer flex flex-col gap-3.5 group relative shadow-xs"
                  >
                    {/* Category info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-xs"
                          style={{ backgroundColor: budget.category.color || "#6366F1" }}
                        >
                          <IconComponent className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-indigo-500 transition-colors">
                            {budget.category.name}
                          </h4>
                        </div>
                      </div>
                      <span className="text-[9px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase">
                        Bulan Ini
                      </span>
                    </div>

                    {/* Amounts line */}
                    <div className="flex justify-between items-baseline text-xs select-none">
                      <p className="font-extrabold text-[var(--text-primary)]">
                        {formatRp(budget.spent)}
                        <span className="text-[10px] text-[var(--text-text-tertiary)] text-[var(--text-secondary)] font-normal">
                          {" "}dari {formatRp(budget.amount)}
                        </span>
                      </p>
                    </div>

                    {/* Progress bar line */}
                    <div className="w-full bg-[var(--bg-tertiary)] rounded-full h-1.5 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-500 ease-out",
                          getProgressColorClass(budget.percentage)
                        )}
                        style={{ width: `${Math.min(100, budget.percentage)}%` }}
                      />
                    </div>

                    {/* Status line */}
                    <div className="pt-0.5 border-t border-[var(--border-color)]/40 mt-0.5">
                      {isOver ? (
                        <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Over sekitar {formatRp(budget.spent - budget.amount)}
                        </p>
                      ) : (
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Sisa kuota: {formatRp(budget.amount - budget.spent)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 text-center select-none animate-fade-in bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl">
              <div className="h-14 w-14 text-[var(--text-tertiary)] opacity-30 mb-3">
                <PieChart className="h-full w-full stroke-[1.25]" />
              </div>
              <p className="text-sm font-bold text-[var(--text-secondary)]">
                Belum Ada Perencanaan Anggaran
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-xs mx-auto px-4">
                Buat budget bulanan untuk mengontrol pengeluaran kategori tertentu secara presisi.
              </p>
              <button
                onClick={handleOpenAddView}
                className="mt-5 px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
              >
                Buat Anggaran Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON (FAB) - Only displays on Mobile Viewports */}
      <button
        onClick={handleOpenAddView}
        className="md:hidden fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
        title="Buat Anggaran Baru"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
});

export default BudgetPage;