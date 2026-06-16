import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCategory } from "../hooks/useCategory";
import * as LucideIcons from "lucide-react";
import { ChevronLeft, ChevronDown, Loader2 } from "lucide-react";
import clsx from "clsx";

const CategoryListPage = memo(function CategoryListPage() {
  const navigate = useNavigate();
  const { categories, getCategories, isLoading } = useCategory();
  
  const [activeTab, setActiveTab] = useState("EXPENSE"); // EXPENSE | INCOME
  const [expandedIds, setExpandedIds] = useState({});

  // Load all categories on mount
  useEffect(() => {
    getCategories();
  }, [getCategories]);

  // Filter category by type (EXPENSE or INCOME)
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === activeTab);
  }, [categories, activeTab]);

  // Toggle accordion expand/collapse
  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const totalSubCategories = useMemo(() => {
    return filteredCategories.reduce((sum, cat) => sum + (cat.subCategories?.length || 0), 0);
  }, [filteredCategories]);

  return (
    <div className="w-full max-w-xl lg:max-w-3xl mx-auto pb-24 animate-fade-slide-up">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
          Kategori
        </h2>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Total Kategori</span>
          <span className="text-xl font-extrabold text-[var(--text-primary)] mt-1 tabular-nums">
            {filteredCategories.length}
          </span>
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Total Sub-kategori</span>
          <span className="text-xl font-extrabold text-[var(--text-primary)] mt-1 tabular-nums">
            {totalSubCategories}
          </span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-[var(--border-color)] mb-5">
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={clsx(
            "flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 cursor-pointer",
            activeTab === "EXPENSE"
              ? "border-indigo-650 text-indigo-650 dark:text-indigo-400"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Pengeluaran
        </button>
        <button
          onClick={() => setActiveTab("INCOME")}
          className={clsx(
            "flex-1 py-3 text-center font-bold text-sm transition-all border-b-2 cursor-pointer",
            activeTab === "INCOME"
              ? "border-indigo-655 text-indigo-655 dark:text-indigo-400"
              : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          Pemasukan
        </button>
      </div>

      {/* CONTENT LIST */}
      {isLoading && filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Memuat kategori...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => {
              const IconComponent = LucideIcons[category.icon] || LucideIcons.Tag;
              const isExpanded = !!expandedIds[category.id];
              const subCategories = category.subCategories || [];
              const subCount = subCategories.length;
              const catColor = category.color || "#6366F1";

              return (
                <div
                  key={category.id}
                  className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]/60 overflow-hidden shadow-sm hover:border-indigo-500/25 transition-all duration-200"
                >
                  {/* Header */}
                  <div
                    onClick={() => toggleExpand(category.id)}
                    className="flex items-center justify-between gap-3 px-4 py-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all scale-100"
                        style={{
                          backgroundColor: `${catColor}1a`,
                          color: catColor,
                        }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">
                          {category.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md uppercase tracking-wider">
                            {subCount} Sub
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={clsx(
                        "h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </div>

                  {/* Sub list */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 space-y-2 bg-[var(--bg-primary)]/30 border-t border-[var(--border-color)]/30 animate-fade-in">
                      {subCount > 0 ? (
                        subCategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center gap-2 pl-4 py-2 border-l-2 text-sm text-[var(--text-secondary)] font-medium transition-all"
                            style={{ borderColor: catColor }}
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shrink-0" />
                            <span>{sub.name}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-[var(--text-tertiary)] pl-4 py-2 italic font-medium">
                          Belum ada sub-kategori
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl shadow-sm p-6">
              <LucideIcons.Inbox className="h-10 w-10 text-[var(--text-tertiary)] mb-2" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Tidak ada kategori</h3>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">Gunakan tombol tambah untuk membuat kategori baru.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default CategoryListPage;
