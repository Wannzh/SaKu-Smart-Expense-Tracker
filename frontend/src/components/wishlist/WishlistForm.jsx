import { memo, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Image as ImageIcon, ChevronDown, Banknote, Building2, Smartphone } from "lucide-react";
import FloatingLabelInput from "../common/FloatingLabelInput";
import Button from "../common/Button";
import { formatCurrency } from "../../utils/format";
import clsx from "clsx";
import WalletPicker from "../transaction/WalletPicker";

const walletIconMap = {
  cash: Banknote,
  bank: Building2,
  ewallet: Smartphone,
};

const WishlistForm = memo(function WishlistForm({
  isOpen,
  onClose,
  onSubmit,
  wallets = [],
  wishlist = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    targetPrice: "",
    savedAmount: "",
    priority: "MEDIUM",
    productLink: "",
    notes: "",
    targetDate: "",
  });

  const [walletId, setWalletId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === walletId);
  }, [wallets, walletId]);

  useEffect(() => {
    if (wishlist) {
      setFormData({
        name: wishlist.name || "",
        targetPrice: wishlist.targetPrice?.toString() || "",
        savedAmount: wishlist.savedAmount?.toString() || "",
        priority: wishlist.priority || "MEDIUM",
        productLink: wishlist.productLink || "",
        notes: wishlist.notes || "",
        targetDate: wishlist.targetDate ? new Date(wishlist.targetDate).toISOString().split("T")[0] : "",
      });
      setPreviewUrl(wishlist.imageUrl || "");
      setSelectedFile(null);
      setWalletId("");
    } else {
      setFormData({
        name: "",
        targetPrice: "",
        savedAmount: "",
        priority: "MEDIUM",
        productLink: "",
        notes: "",
        targetDate: "",
      });
      setPreviewUrl("");
      setSelectedFile(null);
      setWalletId("");
    }
    setErrors({});
  }, [wishlist, isOpen]);

  // Clean up ObjectURL preview on unmount/close
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Ukuran file maksimal 5MB" }));
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handlePrioritySelect = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama barang wajib diisi";
    if (!formData.targetPrice) {
      newErrors.targetPrice = "Harga target wajib diisi";
    } else if (Number(formData.targetPrice) <= 0) {
      newErrors.targetPrice = "Harga target harus lebih besar dari 0";
    }

    if (!wishlist) {
      const parsedSaved = formData.savedAmount ? Number(formData.savedAmount) : 0;
      if (parsedSaved < 0) {
        newErrors.savedAmount = "Tabungan awal tidak boleh negatif";
      } else if (parsedSaved > 0 && !walletId) {
        newErrors.walletId = "Pilih dompet untuk tabungan awal";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build FormData payload
    const data = new FormData();
    data.append("name", formData.name.trim());
    data.append("targetPrice", Number(formData.targetPrice));
    
    if (!wishlist) {
      const parsedSaved = formData.savedAmount ? Number(formData.savedAmount) : 0;
      data.append("savedAmount", parsedSaved);
      if (parsedSaved > 0) {
        data.append("walletId", walletId);
      }
    }

    data.append("priority", formData.priority);
    data.append("productLink", formData.productLink.trim());
    data.append("notes", formData.notes.trim());
    
    if (formData.targetDate) {
      data.append("targetDate", formData.targetDate);
    }
    
    if (selectedFile) {
      data.append("image", selectedFile);
    }

    onSubmit(data);
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <form
          onSubmit={handleSubmit}
          className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pointer-events-auto"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {wishlist ? "Edit Keinginan" : "Tambah Keinginan"}
            </h3>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-5">
            {/* Nama Barang */}
            <FloatingLabelInput
              label="Nama Barang"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            {/* Target Harga */}
            <FloatingLabelInput
              label="Harga Target"
              name="targetPrice"
              type="number"
              value={formData.targetPrice}
              onChange={handleChange}
              error={errors.targetPrice}
              required
            />

            {/* Tabungan Awal (only show for creating new item) */}
            {!wishlist && (
              <FloatingLabelInput
                label="Tabungan Awal (Opsional)"
                name="savedAmount"
                type="number"
                value={formData.savedAmount}
                onChange={handleChange}
                error={errors.savedAmount}
              />
            )}

            {/* Wallet Picker for Initial Savings */}
            {!wishlist && Number(formData.savedAmount) > 0 && (
              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                  Pilih Dompet untuk Tabungan Awal <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsWalletPickerOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all mt-1"
                >
                  {selectedWallet ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                        style={{
                          backgroundColor: `${selectedWallet.color || "#6B7280"}18`,
                          color: selectedWallet.color || "#6B7280",
                        }}
                      >
                        {(() => {
                          const Icon = walletIconMap[selectedWallet.type] || Banknote;
                          return <Icon className="h-3.5 w-3.5" />;
                        })()}
                      </div>
                      <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                        {selectedWallet.name} ({formatCurrency(selectedWallet.balance)})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet...</span>
                  )}
                  <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
                </button>
                {errors.walletId && (
                  <p className="text-xs text-red-500 px-1">{errors.walletId}</p>
                )}
              </div>
            )}

            {/* Prioritas */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Prioritas
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "LOW", label: "Rendah", color: "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
                  { key: "MEDIUM", label: "Sedang", color: "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10" },
                  { key: "HIGH", label: "Tinggi", color: "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10" },
                ].map((p) => {
                  const isSelected = formData.priority === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePrioritySelect(p.key)}
                      className={clsx(
                        "py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer",
                        isSelected
                          ? p.color + " ring-2 ring-indigo-500"
                          : "border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] bg-transparent"
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload instead of Link URL */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Foto Barang (Opsional)
              </label>
              
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center h-24 w-24 rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/50 transition-all cursor-pointer select-none">
                  <Upload className="h-5 w-5 text-[var(--text-tertiary)] mb-1" />
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] text-center px-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {previewUrl ? (
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--bg-tertiary)] flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col items-center justify-center text-[var(--text-tertiary)]">
                    <ImageIcon className="h-6 w-6 opacity-40" />
                    <span className="text-[9px] mt-1 font-medium">Belum ada</span>
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="text-xs text-red-500 px-1">{errors.image}</p>
              )}
            </div>

            {/* Link Produk */}
            <FloatingLabelInput
              label="Link Produk (Opsional)"
              name="productLink"
              value={formData.productLink}
              onChange={handleChange}
            />

            {/* Target Tanggal */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="relative">
                <input
                  id="targetDate"
                  type="date"
                  name="targetDate"
                  value={formData.targetDate}
                  onChange={handleChange}
                  className="peer w-full rounded-xl border px-4 pt-5 pb-2 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] border-[var(--border-color)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all duration-200"
                />
                <label
                  htmlFor="targetDate"
                  className="absolute left-4 top-1.5 text-xs text-[var(--text-tertiary)] select-none pointer-events-none"
                >
                  Target Tanggal Capai (Opsional)
                </label>
              </div>
            </div>

            {/* Catatan */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="relative">
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder=" "
                  rows={2}
                  className="peer w-full rounded-xl border px-4 pt-5 pb-2 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] border-[var(--border-color)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all duration-200 resize-none"
                />
                <label
                  htmlFor="notes"
                  className="absolute left-4 top-1.5 text-xs text-[var(--text-tertiary)] origin-[0] -translate-y-0.5 scale-75 transform transition-all duration-200 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:top-1.5 peer-focus:-translate-y-0.5 peer-focus:scale-75 pointer-events-none select-none"
                >
                  Catatan (Opsional)
                </label>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--border-color)] flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1 rounded-xl py-3"
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1 rounded-xl py-3"
            >
              Simpan
            </Button>
          </div>
        </form>
      </div>

      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        onSelect={(wallet) => {
          setWalletId(wallet.id);
          if (errors.walletId) {
            setErrors((prev) => ({ ...prev, walletId: "" }));
          }
        }}
      />
    </>,
    document.body
  );
});

export default WishlistForm;
