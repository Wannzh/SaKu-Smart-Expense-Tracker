import { memo, useState, useEffect, useCallback } from "react";
import { useCategory } from "../../hooks/useCategory";
import { useWallet } from "../../hooks/useWallet";
import Button from "../common/Button";
import Input from "../common/Input";
import clsx from "clsx";
import { toISODate, formatCurrency } from "../../utils/format";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import * as LucideIcons from "lucide-react";
import CategoryPicker from "./CategoryPicker";
import WalletPicker from "./WalletPicker";

const TransactionForm = memo(function TransactionForm({ onSubmit, onCancel, initialData }) {
  const { categories, getCategories } = useCategory();
  const { wallets, getWallets } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    amount: initialData?.amount?.toString() || "",
    type: initialData?.type || "EXPENSE",
    description: initialData?.description || "",
    date: initialData?.date ? toISODate(initialData.date) : toISODate(new Date()),
    categoryId: initialData?.categoryId || "",
    subCategoryId: initialData?.subCategoryId || "",
    walletId: initialData?.walletId || "",
    fromWalletId: "",
    toWalletId: "",
  });

  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialData?.subCategory || null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [selectedFromWallet, setSelectedFromWallet] = useState(null);
  const [selectedToWallet, setSelectedToWallet] = useState(null);
  const [isFromWalletPickerOpen, setIsFromWalletPickerOpen] = useState(false);
  const [isToWalletPickerOpen, setIsToWalletPickerOpen] = useState(false);

  const getWalletIcon = (type) => {
    switch (type) {
      case "cash":
        return LucideIcons.Banknote;
      case "bank":
        return LucideIcons.Building2;
      case "ewallet":
        return LucideIcons.Smartphone;
      default:
        return LucideIcons.Banknote;
    }
  };

  useEffect(() => {
    getCategories();
    getWallets();
  }, [getCategories, getWallets]);

  // Backwards compatibility/integrity check if category lists loads and matches initialData IDs
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeChange = (newType) => {
    setForm((prev) => ({
      ...prev,
      type: newType,
      categoryId: "",
      subCategoryId: "",
      walletId: "",
      fromWalletId: "",
      toWalletId: "",
    }));
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedFromWallet(null);
    setSelectedToWallet(null);
  };

  const handleSelectCategory = useCallback(
    ({ categoryId, subCategoryId, categoryName, subCategoryName, categoryIcon, categoryColor }) => {
      setForm((prev) => {
        const nextData = {
          ...prev,
          categoryId,
          subCategoryId: subCategoryId || "",
        };
        // Auto fill description if empty
        if (!prev.description) {
          nextData.description = subCategoryName ? `${categoryName} - ${subCategoryName}` : categoryName;
        }
        return nextData;
      });
      setSelectedCategory({ id: categoryId, name: categoryName, icon: categoryIcon, color: categoryColor });
      setSelectedSubCategory(subCategoryId ? { id: subCategoryId, name: subCategoryName } : null);
    },
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dateWithTz = dayjs(form.date).format("YYYY-MM-DDTHH:mm:ssZ");
      
      const payload = {
        amount: parseFloat(form.amount),
        type: form.type,
        description: form.description,
        date: dateWithTz,
      };

      if (form.type === "TRANSFER") {
        if (!form.fromWalletId || !form.toWalletId) {
          toast.error("Pilih dompet asal dan dompet tujuan");
          setIsLoading(false);
          return;
        }
        payload.fromWalletId = form.fromWalletId;
        payload.toWalletId = form.toWalletId;
      } else {
        payload.categoryId = form.categoryId || undefined;
        payload.subCategoryId = form.subCategoryId || undefined;
        payload.walletId = form.walletId || undefined;
      }

      await onSubmit(payload);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex gap-1.5 rounded-xl bg-[var(--bg-tertiary)] p-1">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1",
              form.type === "EXPENSE"
                ? "bg-red-500 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <LucideIcons.ArrowDownCircle className="h-3.5 w-3.5" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOME")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1",
              form.type === "INCOME"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <LucideIcons.ArrowUpCircle className="h-3.5 w-3.5" />
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("TRANSFER")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1",
              form.type === "TRANSFER"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <LucideIcons.ArrowLeftRight className="h-3.5 w-3.5" />
            Transfer
          </button>
        </div>

        {/* Amount */}
        <Input
          label="Jumlah (Rp)"
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="50000"
          required
        />

        {form.type === "TRANSFER" ? (
          /* Transfer UI: Dari Dompet / Ke Dompet */
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 w-full">
              {/* Dari Dompet */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Dari Dompet</label>
                <button
                  type="button"
                  onClick={() => setIsFromWalletPickerOpen(true)}
                  className="w-full flex flex-col justify-center rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer min-h-[4.25rem] transition-all"
                >
                  {selectedFromWallet ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                        {(() => {
                          const Icon = getWalletIcon(selectedFromWallet.type);
                          return <Icon className="h-4 w-4" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[var(--text-primary)] truncate">{selectedFromWallet.name}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 tabular-nums font-medium">{formatCurrency(selectedFromWallet.balance)}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet...</span>
                  )}
                </button>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center shrink-0 pt-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                  <LucideIcons.ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Ke Dompet */}
              <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Ke Dompet</label>
                <button
                  type="button"
                  onClick={() => setIsToWalletPickerOpen(true)}
                  className="w-full flex flex-col justify-center rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer min-h-[4.25rem] transition-all"
                >
                  {selectedToWallet ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                        {(() => {
                          const Icon = getWalletIcon(selectedToWallet.type);
                          return <Icon className="h-4 w-4" />;
                        })()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-[var(--text-primary)] truncate">{selectedToWallet.name}</p>
                        <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 tabular-nums font-medium">{formatCurrency(selectedToWallet.balance)}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet...</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Normal Transaction Inputs: Wallet & Category */
          <>
            {/* Wallet dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Wallet</label>
              <select
                name="walletId"
                value={form.walletId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-[var(--bg-secondary)] cursor-pointer"
              >
                <option value="">Tanpa wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Picker Trigger */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--text-primary)]">Kategori</label>
              {selectedCategory ? (
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition-all duration-200 hover:border-indigo-500 bg-[var(--bg-secondary)] text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm shrink-0"
                      style={{
                        backgroundColor: `${selectedCategory.color || "#6B7280"}18`,
                        color: selectedCategory.color || "#6B7280",
                      }}
                    >
                      {(() => {
                        const CatIcon = LucideIcons[selectedCategory.icon] || LucideIcons.Tag;
                        return <CatIcon className="h-4 w-4" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{selectedCategory.name}</p>
                      {selectedSubCategory && (
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Sub-kategori: {selectedSubCategory.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-indigo-600 font-semibold">Ubah</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-tertiary)] outline-none transition-all duration-200 hover:border-indigo-500 bg-[var(--bg-secondary)] text-left cursor-pointer"
                >
                  <span>Pilih Kategori...</span>
                  <span className="text-xs text-indigo-600 font-semibold">Pilih</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Description */}
        <Input
          label="Deskripsi"
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Catatan transaksi (opsional)"
        />

        {/* Date */}
        <Input
          label="Tanggal"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            className="flex-1"
          >
            Batal
          </Button>
          <Button type="submit" isLoading={isLoading} className="flex-1">
            {isLoading ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
          </Button>
        </div>
      </form>

      <CategoryPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        type={form.type}
        onSelect={handleSelectCategory}
      />

      <WalletPicker
        isOpen={isFromWalletPickerOpen}
        onClose={() => setIsFromWalletPickerOpen(false)}
        title="Pilih Dompet Asal"
        onSelect={(w) => {
          setSelectedFromWallet(w);
          setForm((prev) => ({ ...prev, fromWalletId: w.id }));
          // If destination wallet is the same, reset it
          if (w.id === form.toWalletId) {
            setSelectedToWallet(null);
            setForm((prev) => ({ ...prev, toWalletId: "" }));
          }
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
        }}
      />
    </>
  );
});

export default TransactionForm;
