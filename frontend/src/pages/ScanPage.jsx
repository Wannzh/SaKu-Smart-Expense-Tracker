import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipt";
import { useCategory } from "../hooks/useCategory";
import ReceiptScanner from "../components/receipt/ReceiptScanner";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { formatCurrency, toISODate } from "../utils/format";
import dayjs from "dayjs";
import * as LucideIcons from "lucide-react";
import {
  ScanLine,
  Loader2,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  Check,
  Tag,
} from "lucide-react";
import clsx from "clsx";

const scanTexts = [
  "Membaca teks struk...",
  "Mengidentifikasi item...",
  "Menghitung total...",
  "Hampir selesai...",
];

// ─── Tahap 1: Upload ────────────────────────────────────────
const UploadStep = memo(function UploadStep({ file, preview, onFileSelect, onScan, isScanning }) {
  const [textIdx, setTextIdx] = useState(0);

  useEffect(() => {
    if (!isScanning) { setTextIdx(0); return; }
    const interval = setInterval(() => {
      setTextIdx((i) => (i + 1) % scanTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto">
      <ReceiptScanner onFileSelect={onFileSelect} preview={preview} />

      {file && !isScanning && (
        <Button onClick={onScan} className="w-full py-3">
          <ScanLine className="h-4 w-4" />
          Mulai Pindai Struk
        </Button>
      )}

      {isScanning && (
        <div className="flex flex-col items-center gap-4 py-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 animate-pulse-glow">
            <ScanLine className="h-7 w-7 text-indigo-600 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-[var(--text-primary)]">Sedang menganalisis struk</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mt-1.5 h-4 transition-all">{scanTexts[textIdx]}</p>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Tahap 2: Review (DIUBAH MENJADI 2 KOLOM DI DESKTOP) ─────────────────
const ReviewStep = memo(function ReviewStep({ scanResult, categories, onConfirm, onRescan, isConfirming }) {
  const parsed = scanResult?.parsedData;

  const [form, setForm] = useState({
    amount: parsed?.total?.toString() || "",
    type: "EXPENSE",
    description: parsed?.merchant || "",
    date: parsed?.date ? toISODate(parsed.date) : toISODate(new Date()),
    categoryId: "",
  });

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleCategoryClick = useCallback((catId) => {
    setForm((prev) => ({ ...prev, categoryId: catId }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dateWithTz = dayjs(form.date).format("YYYY-MM-DDTHH:mm:ssZ");
    await onConfirm({
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description,
      date: dateWithTz,
      categoryId: form.categoryId || undefined,
      rawText: scanResult?.rawText,
      parsedData: parsed,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-slide-up">
      
      {/* KIRI: Rincian Item Struk Belanja dari Hasil Scan */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-6">
        {parsed?.items?.length > 0 ? (
          <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 shadow-xs">
            <div className="flex items-center gap-3 mb-4 select-none">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[var(--text-primary)] truncate">{parsed.merchant || "Hasil Scan OCR"}</h3>
                {parsed.date && <p className="text-[10px] text-[var(--text-tertiary)] font-semibold mt-0.5">{parsed.date}</p>}
              </div>
            </div>

            <div className="flex flex-col divide-y divide-[var(--border-color)]/60 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {parsed.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-xs">
                  <span className="text-[var(--text-secondary)] font-medium truncate mr-4">{item.name}</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums shrink-0">{formatCurrency(item.price || 0)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-dashed border-[var(--border-color)] select-none">
              <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">Total Struk</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{formatCurrency(parsed.total || 0)}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-6 text-center select-none text-xs text-[var(--text-tertiary)] font-medium">
            Tidak ada rincian item baris belanjaan yang terbaca, silakan isi nominal total langsung pada form.
          </div>
        )}
      </div>

      {/* KANAN: Form Validasi Akhir */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-5 lg:p-6 shadow-xs">
          <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-color)] pb-2 select-none">Konfirmasi Pencatatan</h3>

          <div className="flex gap-2 rounded-xl bg-[var(--bg-primary)] p-1 border border-[var(--border-color)]/60 select-none">
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, type: "EXPENSE", categoryId: "" }))}
              className={clsx("flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer", form.type === "EXPENSE" ? "bg-red-500 text-white shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
              Pengeluaran
            </button>
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, type: "INCOME", categoryId: "" }))}
              className={clsx("flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer", form.type === "INCOME" ? "bg-emerald-600 text-white shadow-xs" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]")}>
              Pemasukan
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Jumlah Alokasi (Rp)" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0" required />
            <Input label="Tanggal Transaksi" type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>

          <Input label="Deskripsi / Catatan Toko" type="text" name="description" value={form.description} onChange={handleChange} placeholder="Contoh: Belanja Bulanan di Toko" />

          <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider select-none">Kategori Pos Finansial</label>
            <div className="flex overflow-x-auto gap-4 py-3 px-2.5 scrollbar-none items-center bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]/60 min-h-[5.5rem]">
              {categories
                .filter((cat) => cat.type === form.type)
                .map((cat) => {
                  const CatIcon = LucideIcons[cat.icon] || Tag;
                  const isSelected = form.categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryClick(cat.id)}
                      className="flex flex-col items-center gap-1 shrink-0 transition-all cursor-pointer min-w-[3.5rem]"
                    >
                      <div
                        className={clsx(
                          "flex h-11 w-11 items-center justify-center rounded-full transition-all border",
                          isSelected ? "scale-105 shadow-md" : "opacity-75 hover:opacity-100"
                        )}
                        style={{
                          backgroundColor: isSelected ? `${cat.color}25` : "var(--bg-primary)",
                          borderColor: isSelected ? cat.color : "transparent",
                          color: cat.color || "var(--text-primary)",
                          borderWidth: isSelected ? "2.5px" : "1px",
                        }}
                      >
                        <CatIcon className="h-4.5 w-4.5" />
                      </div>
                      <span
                        className={clsx(
                          "text-[10px] font-semibold tracking-wide text-center max-w-[65px] truncate mt-0.5",
                          isSelected ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-[var(--text-secondary)]"
                        )}
                      >
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              {categories.filter((cat) => cat.type === form.type).length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)] py-4 text-center w-full">
                  Tidak ada kategori terdaftar
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-[var(--border-color)]/60">
            <Button type="button" variant="secondary" onClick={onRescan} className="flex-1 py-2.5 text-xs font-bold">
              <RotateCcw className="h-4 w-4" />
              Ulangi Scan
            </Button>
            <Button type="submit" isLoading={isConfirming} className="flex-1 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white">
              {isConfirming ? "Menyimpan..." : "Simpan Transaksi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Tahap 3: Sukses ────────────────────────────────────────
const SuccessStep = memo(function SuccessStep({ onReset, onViewTransactions }) {
  return (
    <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-14 px-6 text-center shadow-xs animate-fade-slide-up max-w-xl mx-auto select-none">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 animate-check-circle">
        <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" className="opacity-20" />
          <path d="M8 12l3 3 5-6" className="animate-check-draw" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-[var(--text-primary)] mb-1 tracking-tight">Transaksi Berhasil Disimpan!</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-8 font-medium">Struk belanja berhasil diproses AI dan diarsipkan ke dalam buku keuangan.</p>
      <div className="flex gap-3 max-w-xs mx-auto">
        <Button variant="secondary" onClick={onReset} className="flex-1 text-xs font-bold">
          <ScanLine className="h-4 w-4" />
          Scan Lagi
        </Button>
        <Button onClick={onViewTransactions} className="flex-1 text-xs font-bold">
          Riwayat
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────
const ScanPage = memo(function ScanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isScanning, isConfirming, scanResult, scanReceipt, confirmReceipt, resetScan } = useReceipt();
  const { categories, getCategories } = useCategory();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState("upload");

  useEffect(() => { getCategories(); }, [getCategories]);

  useEffect(() => {
    if (location.state?.capturedFile) {
      const captured = location.state.capturedFile;
      setFile(captured);
      setPreview(URL.createObjectURL(captured));
      setStep("upload");
      
      const triggerScan = async () => {
        const result = await scanReceipt(captured);
        if (result) setStep("review");
      };
      triggerScan();
      window.history.replaceState({}, "");
    }
  }, [location.state, scanReceipt]);

  const handleFileSelect = useCallback((selectedFile) => {
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setPreview(null);
    }
  }, []);

  const handleScan = useCallback(async () => {
    if (!file) return;
    const result = await scanReceipt(file);
    if (result) setStep("review");
  }, [file, scanReceipt]);

  const handleConfirm = useCallback(async (data) => {
    const tx = await confirmReceipt(data);
    if (tx) setStep("success");
  }, [confirmReceipt]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPreview(null);
    setStep("upload");
    resetScan();
  }, [resetScan]);

  const steps = useMemo(() => [
    { key: "upload", label: "Upload" },
    { key: "review", label: "Review" },
    { key: "success", label: "Selesai" },
  ], []);

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 animate-fade-slide-up">
      {/* Title Header */}
      <div className="mb-6 select-none border-b border-[var(--border-color)] pb-4 hidden lg:block">
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Scan Struk Pintar (OCR)</h1>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Unggah bukti nota belanja Anda dan biarkan kecerdasan buatan SaKu mengonversinya secara berkategori.</p>
      </div>

      {/* Step indicator — Lebar disesuaikan agar kokoh di samping sidebar */}
      <div className="flex items-center gap-2 mb-8 max-w-xl mx-auto bg-[var(--card-bg)] border border-[var(--border-color)] p-3 rounded-2xl shadow-xs select-none">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={clsx(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition-all duration-300",
              i < currentIndex ? "bg-emerald-500 text-white" : i === currentIndex ? "bg-indigo-600 text-white shadow-xs" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
            )}>
              {i < currentIndex ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </div>
            <span className={clsx("text-xs font-black tracking-wide uppercase transition-colors hidden sm:inline", i <= currentIndex ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-tertiary)]")}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={clsx("flex-1 h-0.5 rounded-full transition-colors duration-500 mx-1", i < currentIndex ? "bg-emerald-500" : "bg-[var(--border-color)]")} />
            )}
          </div>
        ))}
      </div>

      {/* Konten Langkah Dinamis */}
      {step === "upload" && <UploadStep file={file} preview={preview} onFileSelect={handleFileSelect} onScan={handleScan} isScanning={isScanning} />}
      {step === "review" && scanResult && <ReviewStep scanResult={scanResult} categories={categories} onConfirm={handleConfirm} onRescan={handleReset} isConfirming={isConfirming} />}
      {step === "success" && <SuccessStep onReset={handleReset} onViewTransactions={() => navigate("/transactions")} />}
    </div>
  );
});

export default ScanPage;
