import { memo, useState, useEffect, useMemo, useRef } from "react";
import { X, ArrowLeft, Tag } from "lucide-react";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";
import { useCategory } from "../../hooks/useCategory";

const CategoryPicker = memo(function CategoryPicker({ isOpen, onClose, type, onSelect }) {
  const { expenseCategories, incomeCategories, getCategories } = useCategory();
  const [selectedCat, setSelectedCat] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      getCategories(type);
      setSelectedCat(null);
    }
  }, [isOpen, type, getCategories]);

  const categories = useMemo(() => {
    const list = type === "EXPENSE" ? expenseCategories : incomeCategories;
    return list.filter((c) => c.id !== "cat-utang" && c.id !== "cat-utang-in");
  }, [type, expenseCategories, incomeCategories]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl overflow-hidden transition-all duration-300 transform translate-y-0 max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {selectedCat ? "Pilih Sub-kategori" : "Pilih Kategori"}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 scrollbar-none">
          {!selectedCat ? (
            /* Step 1: Category Grid */
            <div className="grid grid-cols-4 gap-x-2 gap-y-5">
              {categories.map((cat) => {
                const LucideIcon = LucideIcons[cat.icon] || Tag;
                const catColor = cat.color || "#6B7280";

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat)}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                  >
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 border-2 border-transparent hover:border-current active:scale-95 shadow-sm group-hover:shadow-md"
                      style={{
                        backgroundColor: `${catColor}1a`,
                        color: catColor,
                      }}
                    >
                      <LucideIcon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--text-secondary)] leading-tight text-center truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Step 2: Subcategory Chips */
            <div className="space-y-5">
              {/* Selected Category header with Back option */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCat(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-sm"
                    style={{
                      backgroundColor: `${selectedCat.color || "#6B7280"}18`,
                      color: selectedCat.color || "#6B7280",
                    }}
                  >
                    {(() => {
                      const CatIcon = LucideIcons[selectedCat.icon] || Tag;
                      return <CatIcon className="h-4 w-4" />;
                    })()}
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{selectedCat.name}</span>
                </div>
              </div>

              {/* Chips container */}
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-none">
                {/* Skip / Just parent category selection */}
                <button
                  onClick={() => {
                    onSelect({
                      categoryId: selectedCat.id,
                      subCategoryId: null,
                      categoryName: selectedCat.name,
                      subCategoryName: null,
                      categoryIcon: selectedCat.icon,
                      categoryColor: selectedCat.color,
                    });
                    onClose();
                  }}
                  className="rounded-full px-4 py-2 border border-dashed border-[var(--border-color)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer bg-transparent"
                >
                  Lewati (Hanya Kategori)
                </button>

                {selectedCat.subCategories?.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      onSelect({
                        categoryId: selectedCat.id,
                        subCategoryId: sub.id,
                        categoryName: selectedCat.name,
                        subCategoryName: sub.name,
                        categoryIcon: selectedCat.icon,
                        categoryColor: selectedCat.color,
                      });
                      onClose();
                    }}
                    className="rounded-full px-4 py-2 border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-all cursor-pointer"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out both; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
});

export default CategoryPicker;
