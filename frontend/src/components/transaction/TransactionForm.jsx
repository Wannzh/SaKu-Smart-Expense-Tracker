import { memo, useState, useEffect } from "react";
import { useCategory } from "../../hooks/useCategory";
import Button from "../common/Button";
import Input from "../common/Input";
import clsx from "clsx";
import { toISODate } from "../../utils/format";

const TransactionForm = memo(function TransactionForm({ onSubmit, onCancel, initialData }) {
  const { categories, getCategories } = useCategory();
  const [isLoading, setIsLoading] = useState(false);
  const isEdit = Boolean(initialData);

  const [form, setForm] = useState({
    amount: initialData?.amount?.toString() || "",
    type: initialData?.type || "EXPENSE",
    description: initialData?.description || "",
    date: initialData?.date ? toISODate(initialData.date) : toISODate(new Date()),
    categoryId: initialData?.categoryId || "",
  });

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        ...form,
        amount: parseFloat(form.amount),
        categoryId: form.categoryId || undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Type toggle */}
      <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, type: "EXPENSE" }))}
          className={clsx(
            "flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer",
            form.type === "EXPENSE"
              ? "bg-red-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setForm((prev) => ({ ...prev, type: "INCOME" }))}
          className={clsx(
            "flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer",
            form.type === "INCOME"
              ? "bg-emerald-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
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

      {/* Category dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">Kategori</label>
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white"
        >
          <option value="">Pilih kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
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
  );
});

export default TransactionForm;
