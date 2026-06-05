import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useCategory } from "../../hooks/useCategory";
import { useWallet } from "../../hooks/useWallet";
import clsx from "clsx";
import { toISODate, formatCurrency } from "../../utils/format";
import dayjs from "dayjs";
import "dayjs/locale/id";
import toast from "react-hot-toast";
import * as LucideIcons from "lucide-react";
import WalletPicker from "./WalletPicker";

dayjs.locale("id");

const walletIconMap = {
  cash: LucideIcons.Banknote,
  bank: LucideIcons.Building2,
  ewallet: LucideIcons.Smartphone,
};

const TransactionForm = memo(function TransactionForm({
  onSubmit,
  onCancel,
  onClose,
  isOpen,
  initialData,
  onSuccess,
}) {
  const navigate = useNavigate();
  const { categories, getCategories } = useCategory();
  const { wallets, getWallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    amount: initialData?.amount?.toString() || "0",
    type: initialData?.type || "EXPENSE",
    description: initialData?.description || "",
    notes: initialData?.notes || "",
    date: initialData?.date ? toISODate(initialData.date) : toISODate(new Date()),
    categoryId: initialData?.categoryId || "",
    subCategoryId: initialData?.subCategoryId || "",
    walletId: initialData?.walletId || "",
    fromWalletId: initialData?.fromWalletId || "",
    toWalletId: initialData?.toWalletId || "",
  });

  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialData?.subCategory || null);
  
  const [selectedFromWallet, setSelectedFromWallet] = useState(null);
  const [selectedToWallet, setSelectedToWallet] = useState(null);
  const [isFromWalletPickerOpen, setIsFromWalletPickerOpen] = useState(false);
  const [isToWalletPickerOpen, setIsToWalletPickerOpen] = useState(false);
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);

  const dateInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [slideUp, setSlideUp] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);

  const isModalOpen = isOpen !== undefined ? isOpen : true;

  // Slide up animation trigger
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setSlideUp(true), 50);
      return () => clearTimeout(timer);
    } else {
      setSlideUp(false);
    }
  }, [isModalOpen]);

  useEffect(() => {
    getCategories();
    getWallets();
  }, [getCategories, getWallets]);

  // Load relations for editing
  useEffect(() => {
    if (initialData && wallets.length > 0) {
      if (initialData.walletId) {
        const found = wallets.find((w) => w.id === initialData.walletId);
        if (found) setForm((prev) => ({ ...prev, walletId: found.id }));
      }
      if (initialData.fromWalletId) {
        const found = wallets.find((w) => w.id === initialData.fromWalletId);
        if (found) setSelectedFromWallet(found);
      }
      if (initialData.toWalletId) {
        const found = wallets.find((w) => w.id === initialData.toWalletId);
        if (found) setSelectedToWallet(found);
      }
    }
  }, [initialData, wallets]);

  // Match initial category
  useEffect(() => {
    if (initialData?.categoryId && !selectedCategory && categories.length > 0) {
      const foundCat = categories.find((c) => c.id === initialData.categoryId);
      if (foundCat) {
        setSelectedCategory(foundCat);
        if (initialData?.subCategoryId && foundCat.subCategories) {
          const foundSub = foundCat.subCategories.find((s) => s.id === initialData.subCategoryId);
          if (foundSub) {
            setSelectedSubCategory(foundSub);
          }
        }
      }
    }
  }, [initialData, categories, selectedCategory]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.type === form.type);
  }, [categories, form.type]);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === form.walletId) || null;
  }, [wallets, form.walletId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeChange = (newType) => {
    setForm((prev) => ({
      ...prev,
      type: newType,
      categoryId: "",
      subCategoryId: "",
      fromWalletId: "",
      toWalletId: "",
    }));
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedFromWallet(null);
    setSelectedToWallet(null);
  };

  const handleCategoryClick = useCallback((cat) => {
    setForm((prev) => {
      const nextData = {
        ...prev,
        categoryId: cat.id,
        subCategoryId: "",
      };
      // Auto fill description if empty
      nextData.description = cat.name;
      return nextData;
    });
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
  }, []);

  const handleSubCategoryClick = useCallback((sub, catColor) => {
    setForm((prev) => {
      const nextData = {
        ...prev,
        subCategoryId: sub.id,
      };
      // Auto fill description if empty or contains previous category name
      if (!prev.description || prev.description === selectedCategory?.name) {
        nextData.description = `${selectedCategory?.name} - ${sub.name}`;
      }
      return nextData;
    });
    setSelectedSubCategory(sub);
  }, [selectedCategory]);

  const handleNumpadPress = useCallback((value) => {
    setForm((prev) => {
      let current = prev.amount;
      if (value === "delete") {
        current = current.slice(0, -1);
        if (current === "" || current === "-") current = "0";
      } else if (value === "clear") {
        current = "0";
      } else if (value === ".") {
        if (!current.includes(".")) {
          current = current === "" ? "0." : current + ".";
        }
      } else if (value === "000") {
        if (current !== "0" && current !== "") {
          current = current + "000";
        }
      } else {
        if (current === "0") {
          current = value;
        } else {
          current = current + value;
        }
      }
      return { ...prev, amount: current };
    });
  }, []);

  const handleClose = useCallback(() => {
    setSlideUp(false);
    setTimeout(() => {
      onCancel?.();
      onClose?.();
    }, 200);
  }, [onCancel, onClose]);

  const isMobile = window.matchMedia("(max-width: 1023px)").matches;

  const handleCameraClick = useCallback(() => {
    if (isMobile) {
      cameraInputRef.current?.click();
    } else {
      handleClose();
      navigate("/scan");
    }
  }, [isMobile, handleClose, navigate]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const parsedAmount = parseFloat(form.amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Masukkan jumlah nominal yang valid");
      return;
    }

    if (form.type === "TRANSFER") {
      if (!form.fromWalletId || !form.toWalletId) {
        toast.error("Pilih dompet asal dan dompet tujuan");
        return;
      }
    } else {
      if (!form.walletId) {
        toast.error("Pilih dompet/wallet");
        return;
      }
    }

    setIsLoading(true);
    try {
      const dateWithTz = dayjs(form.date).format("YYYY-MM-DDTHH:mm:ssZ");
      
      const payload = {
        amount: parsedAmount,
        type: form.type,
        description: form.description || (selectedCategory ? selectedCategory.name : "Transaksi"),
        notes: form.notes || undefined,
        date: dateWithTz,
      };

      if (form.type === "TRANSFER") {
        payload.fromWalletId = form.fromWalletId;
        payload.toWalletId = form.toWalletId;
      } else {
        payload.categoryId = form.categoryId || undefined;
        payload.subCategoryId = form.subCategoryId || undefined;
        payload.walletId = form.walletId || undefined;
      }

      await onSubmit(payload);
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Format amount display
  const formattedAmount = useMemo(() => {
    const amountStr = form.amount;
    if (!amountStr || amountStr === "0") return "Rp 0";
    const [integer, decimal] = amountStr.split(".");
    const formattedInteger = Number(integer || 0).toLocaleString("id-ID");
    if (amountStr.includes(".")) {
      return `Rp ${formattedInteger},${decimal || ""}`;
    }
    return `Rp ${formattedInteger}`;
  }, [form.amount]);

  if (!isModalOpen) return null;

  const formElement = (
    <>
      {/* Overlay Background */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300",
          slideUp ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Viewport Frame */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none">
        <form
          onSubmit={handleSubmit}
          onTouchStart={(e) => {
            startYRef.current = e.touches[0].clientY;
            setIsDragging(true);
          }}
          onTouchMove={(e) => {
            const delta = e.touches[0].clientY - startYRef.current;
            if (delta > 0) setDragY(delta); // hanya allow drag ke bawah
          }}
          onTouchEnd={() => {
            if (dragY > 100) {
              // Swipe cukup jauh → tutup
              handleClose();
            }
            setDragY(0);
            setIsDragging(false);
          }}
          style={{
            transform: slideUp 
              ? `translateY(${dragY}px)` 
              : "translateY(100%)",
            transition: isDragging 
              ? "none" 
              : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="w-full h-full lg:h-auto lg:max-w-lg bg-[var(--card-bg)] rounded-t-3xl lg:rounded-2xl shadow-xl flex flex-col max-h-[100vh] lg:max-h-[90vh] pointer-events-auto overflow-hidden border-t lg:border border-[var(--border-color)] animate-slide-up"
        >
          {/* Mobile Handle Bar */}
          <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
            <div className={clsx(
              "w-12 h-1 rounded-full transition-colors",
              isDragging ? "bg-[var(--text-tertiary)]/60" : "bg-[var(--text-tertiary)]/30"
            )} />
          </div>

          {/* Tab Selector Header */}
          <div className="flex border-b border-[var(--border-color)] shrink-0 items-center justify-between px-2">
            <div className="flex flex-1">
              {["EXPENSE", "INCOME", "TRANSFER"].map((t) => {
                const label =
                  t === "EXPENSE" ? "Pengeluaran" : t === "INCOME" ? "Pemasukan" : "Transfer";
                const isActive = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={clsx(
                      "flex-1 py-3 text-xs lg:text-sm font-bold tracking-wide border-b-2 cursor-pointer transition-all text-center",
                      isActive
                        ? t === "EXPENSE"
                          ? "text-red-500 border-red-500"
                          : t === "INCOME"
                          ? "text-emerald-500 border-emerald-500"
                          : "text-indigo-500 border-indigo-500"
                        : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            
            {/* Camera Button */}
            <button
              type="button"
              onClick={handleCameraClick}
              className="p-3 flex items-center justify-center text-[var(--text-secondary)] hover:text-indigo-600 transition-colors cursor-pointer shrink-0"
              title="Scan Struk"
            >
              <LucideIcons.Camera className="h-5 w-5" />
            </button>
          </div>

          {/* Form Scrollable Area */}
          <div className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4">
            {form.type === "TRANSFER" ? (
              /* Transfer Layout: Dari Dompet -> Ke Dompet */
              <div className="flex flex-col items-center gap-3 p-4 bg-[var(--bg-tertiary)] rounded-2xl">
                <div className="w-full">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                    Dari Dompet
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsFromWalletPickerOpen(true)}
                    className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all mt-1"
                  >
                    {selectedFromWallet ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                          {(() => {
                            const Icon = walletIconMap[selectedFromWallet.type] || LucideIcons.Banknote;
                            return <Icon className="h-3.5 w-3.5" />;
                          })()}
                        </div>
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {selectedFromWallet.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet Asal...</span>
                    )}
                    <LucideIcons.ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  </button>
                </div>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] shadow-sm">
                  <LucideIcons.ArrowDown className="h-4 w-4" />
                </div>

                <div className="w-full">
                  <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                    Ke Dompet
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsToWalletPickerOpen(true)}
                    className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all mt-1"
                  >
                    {selectedToWallet ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                          {(() => {
                            const Icon = walletIconMap[selectedToWallet.type] || LucideIcons.Banknote;
                            return <Icon className="h-3.5 w-3.5" />;
                          })()}
                        </div>
                        <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                          {selectedToWallet.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet Tujuan...</span>
                    )}
                    <LucideIcons.ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Transaction: Categories Inline Selector */
              <div className="space-y-4 overflow-visible">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Pilih Kategori
                  </h3>
                  
                  {filteredCategories.length === 0 ? (
                    <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
                      Tidak ada kategori terdaftar
                    </p>
                  ) : (
                    <div className="flex overflow-x-auto gap-4 py-3 px-1 scrollbar-none items-center">
                      {filteredCategories.map((cat) => {
                        const CatIcon = LucideIcons[cat.icon] || LucideIcons.Tag;
                        const isSelected = form.categoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategoryClick(cat)}
                            className="flex flex-col items-center gap-1 shrink-0 transition-all cursor-pointer min-w-[3.5rem]"
                          >
                            <div
                              className={clsx(
                                "flex h-12 w-12 items-center justify-center rounded-full transition-all border",
                                isSelected ? "scale-105 shadow-md" : "opacity-75 hover:opacity-100"
                              )}
                              style={{
                                backgroundColor: isSelected ? `${cat.color}25` : "var(--bg-tertiary)",
                                borderColor: isSelected ? cat.color : "transparent",
                                color: cat.color || "var(--text-primary)",
                                borderWidth: isSelected ? "2.5px" : "1px",
                              }}
                            >
                              <CatIcon className="h-5 w-5" />
                            </div>
                            <span
                              className={clsx(
                                "text-[10px] font-semibold tracking-wide text-center max-w-[60px] truncate mt-1",
                                isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"
                              )}
                            >
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Inline Sub-categories chips */}
                {selectedCategory &&
                  selectedCategory.subCategories &&
                  selectedCategory.subCategories.length > 0 && (
                    <div className="border-t border-[var(--border-color)] pt-3 animate-fade-in">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                        Sub-kategori ({selectedCategory.name})
                      </h4>
                      <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubCategory(null);
                            setForm((prev) => ({ ...prev, subCategoryId: "" }));
                          }}
                          className={clsx(
                            "px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 border",
                            !form.subCategoryId
                              ? "bg-[var(--text-primary)] text-[var(--card-bg)] border-[var(--text-primary)]"
                              : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-transparent"
                          )}
                        >
                          Semua
                        </button>
                        {selectedCategory.subCategories.map((sub) => {
                          const isSelected = form.subCategoryId === sub.id;
                          return (
                            <button
                              type="button"
                              key={sub.id}
                              onClick={() => handleSubCategoryClick(sub, selectedCategory.color)}
                              className={clsx(
                                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 border border-transparent",
                                isSelected ? "text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                              )}
                              style={{
                                backgroundColor: isSelected ? selectedCategory.color : undefined,
                              }}
                            >
                              {sub.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Bottom Summary Display & Inputs section */}
          <div className="shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            
            {/* LARGE AMOUNT DISPLAY */}
            <div className="flex flex-col items-center justify-center py-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
                Jumlah Nominal
              </span>
              <div className="text-3xl lg:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums mt-0.5">
                {formattedAmount}
              </div>
            </div>

            {/* DESCRIPTION FIELD */}
            <div className="flex items-center gap-2.5 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <LucideIcons.FileText className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={selectedCategory ? `Contoh: ${selectedCategory.name}` : "Judul transaksi"}
                className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none border-none py-1.5"
              />
            </div>

            {/* NOTES & WALLET DROPDOWN ROW */}
            <div className="flex items-center justify-between gap-3 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <LucideIcons.StickyNote className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Catatan tambahan..."
                  className="w-full bg-transparent text-xs text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none border-none py-1 truncate"
                />
              </div>
              
              {/* Wallet Select (only if not a transfer) */}
              {form.type !== "TRANSFER" && (
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsWalletPickerOpen(true)}
                    className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full text-[10px] font-bold cursor-pointer max-w-[120px] text-left shrink-0 transition-all hover:bg-[var(--border-color)]"
                  >
                    <span className="truncate">{selectedWallet ? selectedWallet.name : "Pilih Dompet"}</span>
                    <LucideIcons.ChevronDown className="h-3 w-3 text-[var(--text-secondary)] shrink-0" />
                  </button>
                </div>
              )}
            </div>

            {/* NUMPAD GRID */}
            <div className="p-3 bg-[var(--bg-secondary)]">
              <div className="grid grid-cols-4 gap-2 text-center max-w-md mx-auto">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("1")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("2")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("3")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("delete")}
                  className="bg-red-950/20 dark:bg-red-900/20 hover:bg-red-900/30 text-red-500 rounded-xl py-3 flex items-center justify-center cursor-pointer transition-transform active:scale-95 font-bold"
                >
                  <LucideIcons.Delete className="h-4 w-4" />
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("4")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("5")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("6")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange(form.type === "EXPENSE" ? "INCOME" : "EXPENSE")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] rounded-xl py-3 flex items-center justify-center cursor-pointer transition-transform active:scale-95 font-bold"
                  title="Ganti Tipe (Pemasukan/Pengeluaran)"
                >
                  <LucideIcons.Calculator className="h-4.5 w-4.5" />
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("7")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("8")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("9")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  9
                </button>
                
                {/* Date button */}
                <button
                  type="button"
                  onClick={() => dateInputRef.current?.showPicker()}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] rounded-xl flex flex-col justify-center items-center py-2 h-12 cursor-pointer transition-transform active:scale-95 leading-none"
                >
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Tanggal</span>
                  <span className="text-[10px] font-extrabold text-[var(--text-primary)] mt-1">
                    {dayjs(form.date).locale("id").format("D MMM")}
                  </span>
                </button>

                {/* Row 4 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress(".")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  .
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("0")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("000")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  000
                </button>
                
                {/* Submit button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md shadow-indigo-100 dark:shadow-none font-extrabold text-lg"
                >
                  {isLoading ? (
                    <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LucideIcons.Check className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Hidden Date Input */}
          <input
            ref={dateInputRef}
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="sr-only"
            required
          />

          {/* Hidden Camera Input for Mobile */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              handleClose();
              navigate("/scan", { state: { capturedFile: file } });
            }}
          />
        </form>
      </div>

      {/* Wallet Pickers */}
      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        title="Pilih Dompet"
        onSelect={(w) => {
          setForm((prev) => ({ ...prev, walletId: w.id }));
          setIsWalletPickerOpen(false);
        }}
      />

      <WalletPicker
        isOpen={isFromWalletPickerOpen}
        onClose={() => setIsFromWalletPickerOpen(false)}
        title="Pilih Dompet Asal"
        onSelect={(w) => {
          setSelectedFromWallet(w);
          setForm((prev) => ({ ...prev, fromWalletId: w.id }));
          if (w.id === form.toWalletId) {
            setSelectedToWallet(null);
            setForm((prev) => ({ ...prev, toWalletId: "" }));
          }
          setIsFromWalletPickerOpen(false);
        }}
      />

      <WalletPicker
        isOpen={isToWalletPickerOpen}
        onClose={() => setIsToWalletPickerOpen(false)}
        title="Pilih Dompet Tujuan"
        excludeWalletId={form.fromWalletId}
        onSelect={(w) => {
          setSelectedToWallet(w);
          setForm((prev) => ({ ...prev, toWalletId: w.id }));
          setIsToWalletPickerOpen(false);
        }}
      />
    </>
  );

  return createPortal(formElement, document.body);
});

export default TransactionForm;
