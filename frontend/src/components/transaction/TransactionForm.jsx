import { memo, useState, useEffect, useCallback } from "react";
import { useCategory } from "../../hooks/useCategory";
import { useWallet } from "../../hooks/useWallet";
import Button from "../common/Button";
import Input from "../common/Input";
import clsx from "clsx";
import { toISODate } from "../../utils/format";
import dayjs from "dayjs";
import * as LucideIcons from "lucide-react";
import CategoryPicker from "./CategoryPicker";

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
  });

  const [selectedCategory, setSelectedCategory] = useState(initialData?.category || null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialData?.subCategory || null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

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
    }));
    setSelectedCategory(null);
    setSelectedSubCategory(null);
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
      await onSubmit({
        ...form,
        amount: parseFloat(form.amount),
        date: dateWithTz,
        categoryId: form.categoryId || undefined,
        subCategoryId: form.subCategoryId || undefined,
        walletId: form.walletId || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Type toggle */}
        <div className="flex gap-2 rounded-xl bg-[var(--bg-tertiary)] p-1">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              form.type === "EXPENSE"
                ? "bg-red-500 text-white shadow-sm"
                 : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <LucideIcons.ArrowDownCircle className="h-4 w-4" />
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOME")}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
              form.type === "INCOME"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <LucideIcons.ArrowUpCircle className="h-4 w-4" />
            Pemasukan
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
    </>
  );
});

export default TransactionForm;
