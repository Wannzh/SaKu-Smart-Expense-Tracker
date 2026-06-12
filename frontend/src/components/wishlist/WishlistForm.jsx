import { memo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import FloatingLabelInput from "../common/FloatingLabelInput";
import Button from "../common/Button";
import clsx from "clsx";

const WishlistForm = memo(function WishlistForm({
  isOpen,
  onClose,
  onSubmit,
  wishlist = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    name: "",
    targetPrice: "",
    productLink: "",
    targetDate: "",
    status: "ACTIVE",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (wishlist) {
      setFormData({
        name: wishlist.name || "",
        targetPrice: wishlist.targetPrice?.toString() || "",
        productLink: wishlist.productLink || "",
        targetDate: wishlist.targetDate ? new Date(wishlist.targetDate).toISOString().split("T")[0] : "",
        status: wishlist.status || "ACTIVE",
      });
      setPreviewUrl(wishlist.imageUrl || "");
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        targetPrice: "",
        productLink: "",
        targetDate: "",
        status: "ACTIVE",
      });
      setPreviewUrl("");
      setSelectedFile(null);
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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nama barang wajib diisi";
    if (!formData.targetPrice) {
      newErrors.targetPrice = "Harga target wajib diisi";
    } else if (Number(formData.targetPrice) <= 0) {
      newErrors.targetPrice = "Harga target harus lebih besar dari 0";
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
    data.append("productLink", formData.productLink.trim());
    
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
            {/* Foto Barang */}
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

            {/* Nama Barang */}
            <FloatingLabelInput
              label="Nama Barang"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />

            {/* Harga */}
            <FloatingLabelInput
              label="Harga"
              name="targetPrice"
              type="number"
              value={formData.targetPrice}
              onChange={handleChange}
              error={errors.targetPrice}
              required
              prefix="Rp"
              hint="cth. 500000"
            />

            {/* Target Tanggal */}
            <FloatingLabelInput
              label="Target Tanggal"
              name="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={handleChange}
            />

            {/* Link Produk */}
            <FloatingLabelInput
              label="Link Produk (Opsional)"
              name="productLink"
              value={formData.productLink}
              onChange={handleChange}
              hint="cth. https://shopee.co.id/..."
            />
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
              {wishlist ? "Simpan Perubahan" : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
});

export default WishlistForm;
