import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipt";
import { useCategory } from "../hooks/useCategory";
import ReceiptScanner from "../components/receipt/ReceiptScanner";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { formatCurrency, toISODate } from "../utils/format";
import {
  ScanLine,
  Loader2,
  RotateCcw,
  ArrowRight,
  ShoppingBag,
  Check,
} from "lucide-react";
import clsx from "clsx";

// ─── Scanning text cycle ────────────────────────────────────
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
    <div className="flex flex-col gap-6">
      <ReceiptScanner onFileSelect={onFileSelect} preview={preview} />

      {file && !isScanning && (
        <Button onClick={onScan} className="w-full">
          <ScanLine className="h-4 w-4" />
          Scan Struk
        </Button>
      )}

      {isScanning && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 animate-pulse-glow">
            <ScanLine className="h-7 w-7 text-indigo-600 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Sedang menganalisis struk</p>
            <p className="text-xs text-indigo-500 mt-1 h-4 transition-all">{scanTexts[textIdx]}</p>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Tahap 2: Review ────────────────────────────────────────
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onConfirm({
      amount: parseFloat(form.amount),
      type: form.type,
      description: form.description,
      date: form.date,
      categoryId: form.categoryId || undefined,
      rawText: scanResult?.rawText,
      parsedData: parsed,
    });
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-slide-up">
      {/* Parsed Items */}
      {parsed?.items?.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{parsed.merchant || "Hasil Scan"}</h3>
              {parsed.date && <p className="text-[11px] text-gray-400">{parsed.date}</p>}
            </div>
          </div>

          <div className="flex flex-col divide-y divide-gray-50">
            {parsed.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-gray-600 truncate mr-4">{item.name}</span>
                <span className="text-sm font-semibold text-gray-800 tabular-nums shrink-0">{formatCurrency(item.price || 0)}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-gray-100">
            <span className="text-sm font-bold text-gray-700">Total</span>
            <span className="text-lg font-bold text-indigo-600 tabular-nums">{formatCurrency(parsed.total || 0)}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-800">Konfirmasi Data</h3>

        <div className="flex gap-2 rounded-xl bg-gray-100 p-1">
          <button type="button" onClick={() => setForm((prev) => ({ ...prev, type: "EXPENSE" }))}
            className={clsx("flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer", form.type === "EXPENSE" ? "bg-red-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            Pengeluaran
          </button>
          <button type="button" onClick={() => setForm((prev) => ({ ...prev, type: "INCOME" }))}
            className={clsx("flex-1 rounded-lg py-2 text-sm font-semibold transition-all cursor-pointer", form.type === "INCOME" ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700")}>
            Pemasukan
          </button>
        </div>

        <Input label="Jumlah (Rp)" type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="50000" required />
        <Input label="Deskripsi" type="text" name="description" value={form.description} onChange={handleChange} placeholder="Catatan transaksi" />
        <Input label="Tanggal" type="date" name="date" value={form.date} onChange={handleChange} required />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Kategori</label>
          <select name="categoryId" value={form.categoryId} onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white">
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>))}
          </select>
        </div>

        <div className="flex gap-3 mt-2">
          <Button type="button" variant="secondary" onClick={onRescan} className="flex-1">
            <RotateCcw className="h-4 w-4" />
            Scan Ulang
          </Button>
          <Button type="submit" isLoading={isConfirming} className="flex-1">
            {isConfirming ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </div>
      </form>
    </div>
  );
});

// ─── Tahap 3: Sukses ────────────────────────────────────────
const SuccessStep = memo(function SuccessStep({ onReset, onViewTransactions }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 py-14 px-6 text-center shadow-sm animate-fade-slide-up">
      {/* Animated checkmark */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 animate-check-circle">
        <svg className="h-10 w-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" className="opacity-20" />
          <path d="M8 12l3 3 5-6" className="animate-check-draw" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-1">Transaksi Berhasil Disimpan!</h3>
      <p className="text-sm text-gray-400 mb-8">Struk sudah diproses dan transaksi telah ditambahkan</p>
      <div className="flex gap-3 max-w-xs mx-auto">
        <Button variant="secondary" onClick={onReset} className="flex-1">
          <ScanLine className="h-4 w-4" />
          Scan Lagi
        </Button>
        <Button onClick={onViewTransactions} className="flex-1">
          Lihat Transaksi
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// ─── Main ───────────────────────────────────────────────────
const ScanPage = memo(function ScanPage() {
  const navigate = useNavigate();
  const { isScanning, isConfirming, scanResult, scanReceipt, confirmReceipt, resetScan } = useReceipt();
  const { categories, getCategories } = useCategory();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState("upload");

  useEffect(() => { getCategories(); }, [getCategories]);

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
    <div className="max-w-lg mx-auto animate-fade-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scan Struk</h1>
        <p className="text-sm text-gray-400 mt-1">Foto struk belanja dan biarkan AI membaca otomatis</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2 flex-1">
            <div className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-300",
              i < currentIndex ? "bg-emerald-500 text-white" : i === currentIndex ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-gray-200 text-gray-400"
            )}>
              {i < currentIndex ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={clsx("text-xs font-medium hidden sm:inline transition-colors", i <= currentIndex ? "text-indigo-600" : "text-gray-400")}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={clsx("flex-1 h-0.5 rounded-full transition-colors duration-500", i < currentIndex ? "bg-emerald-500" : "bg-gray-200")} />
            )}
          </div>
        ))}
      </div>

      {step === "upload" && <UploadStep file={file} preview={preview} onFileSelect={handleFileSelect} onScan={handleScan} isScanning={isScanning} />}
      {step === "review" && scanResult && <ReviewStep scanResult={scanResult} categories={categories} onConfirm={handleConfirm} onRescan={handleReset} isConfirming={isConfirming} />}
      {step === "success" && <SuccessStep onReset={handleReset} onViewTransactions={() => navigate("/transactions")} />}
    </div>
  );
});

export default ScanPage;
