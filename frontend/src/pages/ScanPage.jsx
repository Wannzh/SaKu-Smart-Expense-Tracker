import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useReceipt } from "../hooks/useReceipt";
import { useCategory } from "../hooks/useCategory";
import ReceiptScanner from "../components/receipt/ReceiptScanner";
import Button from "../components/common/Button";
import { formatCurrency, toISODate } from "../utils/format";
import dayjs from "dayjs";
import * as LucideIcons from "lucide-react";
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
    <div className="flex flex-col gap-6 w-full">
      <ReceiptScanner onFileSelect={onFileSelect} preview={preview} />

      {file && !isScanning && (
        <button 
          onClick={onScan} 
          type="button"
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
        >
          <LucideIcons.ScanLine className="h-4.5 w-4.5" />
          <span>Mulai Pindai Struk</span>
        </button>
      )}

      {isScanning && (
        <div className="flex flex-col items-center gap-4 py-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-xs">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 animate-pulse-glow">
            <LucideIcons.ScanLine className="h-7 w-7 text-indigo-600 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-primary)]">Sedang menganalisis struk</p>
            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mt-1.5 h-4 transition-all">{scanTexts[textIdx]}</p>
          </div>
        </div>
      )}

      {/* Footer Visual Decoration */}
      {!isScanning && (
        <div className="relative h-64 rounded-3xl overflow-hidden mt-6 shadow-sm">
          <img 
            className="w-full h-full object-cover" 
            alt="A premium fintech aesthetic showing a sleek receipt being scanned by a smartphone." 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC9yN3RHi72GIrC33Hm-QMPdcYsMMg2Z56xbw__6yT9rfwYsszYv1YsHkNgnI0UMEPOabMQCXDYRkF-xdVSEZpDwaW4tPwX3YUqAIXbOKtp4NCLzUwWUapq5nT1k5HY_rTkDmz2_BcaJ0iiHJd9mIHTICym1-kQkEdlZWHlalr90hlHKPYUByGE4vkzbbdZDwEn9oaq1BJceTQYz3sfTJKsGAO4rFf6yqLqL5U_fOBY5okSgi3fHWLLx18s8LZQMyDFg0zq9OU48g"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/85 to-transparent flex flex-col justify-end p-8 text-left">
            <p className="text-white text-lg font-bold">Keamanan Terjamin</p>
            <p className="text-white/80 text-xs mt-1 leading-relaxed">Semua data struk didekripsi secara aman dengan standar AI finansial terenkripsi end-to-end.</p>
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
    <div className="space-y-6 animate-fade-slide-up">
      
      {/* Parsed Receipt Card */}
      {parsed?.items?.length > 0 ? (
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)]/80 backdrop-blur-md overflow-hidden shadow-sm text-left">
          <div className="bg-indigo-600/5 p-6 border-b border-[var(--border-color)] flex justify-between items-center">
            <div>
              <h4 className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">HASIL PEMINDAIAN AI</h4>
              <p className="text-sm font-bold text-[var(--text-primary)] mt-1">{parsed.merchant || "Hasil Scan OCR"}</p>
            </div>
            <LucideIcons.CheckCircle2 className="h-6 w-6 text-emerald-500 fill-emerald-500/10 shrink-0" />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              <span>Item</span>
              <span>Harga</span>
            </div>

            <div className="space-y-3 divide-y divide-[var(--border-color)]/30 max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-1 scrollbar-none">
              {parsed.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center pt-3 first:pt-0 text-sm">
                  <span className="text-[var(--text-secondary)] font-medium truncate mr-4">{item.name}</span>
                  <span className="font-bold text-[var(--text-primary)] tabular-nums shrink-0">{formatCurrency(item.price || 0)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-dashed border-[var(--border-color)] flex justify-between items-center">
              <span className="font-bold text-base text-[var(--text-primary)]">Total</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{formatCurrency(parsed.total || 0)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] p-6 text-center text-xs text-[var(--text-tertiary)] font-medium">
          Tidak ada rincian item baris belanjaan yang terbaca, silakan isi nominal total langsung pada form.
        </div>
      )}

      {/* Confirmation Form */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 lg:p-8 shadow-sm text-left">
        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-6">Konfirmasi Data</h4>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 rounded-xl bg-[var(--bg-primary)] p-1 border border-[var(--border-color)]/60 select-none">
            <button 
              type="button" 
              onClick={() => setForm((prev) => ({ ...prev, type: "EXPENSE", categoryId: "" }))}
              className={clsx(
                "flex-1 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer", 
                form.type === "EXPENSE" 
                  ? "bg-red-500 text-white shadow-xs" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Pengeluaran
            </button>
            <button 
              type="button" 
              onClick={() => setForm((prev) => ({ ...prev, type: "INCOME", categoryId: "" }))}
              className={clsx(
                "flex-1 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer", 
                form.type === "INCOME" 
                  ? "bg-emerald-600 text-white shadow-xs" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              Pemasukan
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 select-none">Kategori</label>
              <div className="relative">
                <select 
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-4 px-4 text-sm text-[var(--text-primary)] appearance-none focus:ring-2 focus:ring-indigo-600/20 cursor-pointer"
                  required
                >
                  <option value="">Pilih Kategori...</option>
                  {categories
                    .filter((cat) => cat.type === form.type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                <LucideIcons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-tertiary)] w-4.5 h-4.5" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 select-none">Tanggal</label>
                <input 
                  className="w-full bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-4 px-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-600/20" 
                  type="date" 
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 select-none">Total Amount</label>
                <input 
                  className="w-full bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-4 px-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-600/20 font-bold tabular-nums" 
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 select-none">Catatan (Opsional)</label>
              <textarea 
                className="w-full bg-[var(--bg-tertiary)]/50 border-none rounded-xl py-4 px-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-600/20" 
                placeholder="Sarapan pagi di kantor..." 
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="2"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-[var(--border-color)]/30">
            <button 
              type="button" 
              onClick={onRescan}
              className="flex-1 py-4 px-6 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-tertiary)]/30 active:scale-95 transition-all cursor-pointer text-sm"
            >
              Ulangi Scan
            </button>
            <button 
              type="submit" 
              disabled={isConfirming}
              className="flex-[2] py-4 px-6 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              {isConfirming ? (
                <>
                  <LucideIcons.Loader2 className="h-5 w-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Konfirmasi & Simpan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

// ─── Tahap 3: Sukses ────────────────────────────────────────
const SuccessStep = memo(function SuccessStep({ onReset, onViewTransactions }) {
  return (
    <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-14 px-6 text-center shadow-xs animate-fade-slide-up w-full select-none">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 animate-check-circle">
        <svg className="h-8 w-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" className="opacity-20" />
          <path d="M8 12l3 3 5-6" className="animate-draw-check" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-[var(--text-primary)] mb-1 tracking-tight">Transaksi Berhasil Disimpan!</h3>
      <p className="text-xs text-[var(--text-tertiary)] mb-8 font-medium">Struk belanja berhasil diproses AI dan diarsipkan ke dalam buku keuangan.</p>
      <div className="flex gap-3 max-w-xs mx-auto">
        <button 
          onClick={onReset} 
          type="button"
          className="flex-1 py-3 border border-[var(--border-color)] text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--bg-tertiary)]/30 active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
        >
          <LucideIcons.ScanLine className="h-4 w-4" />
          Scan Lagi
        </button>
        <button 
          onClick={onViewTransactions} 
          type="button"
          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
        >
          <span>Riwayat</span>
          <LucideIcons.ArrowRight className="h-4 w-4" />
        </button>
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
    <div className="w-full max-w-[560px] mx-auto pb-12 animate-fade-slide-up px-4 text-center">
      {/* Header */}
      <div className="mb-10 select-none">
        <h2 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">Scan Struk Pintar</h2>
        <p className="text-sm text-[var(--text-secondary)]">Gunakan AI untuk mencatat pengeluaran secara otomatis dari struk belanja Anda.</p>
      </div>

      {/* Step Indicator Bar */}
      <div className="relative mb-12 select-none max-w-sm mx-auto">
        {/* Connector Line Wrapper */}
        <div className="absolute top-6 left-[40px] right-[40px] h-[2px] -translate-y-1/2 z-0">
          {/* Background Line */}
          <div className="absolute inset-0 bg-[var(--border-color)]"></div>
          {/* Active Progress Line */}
          <div 
            className="absolute left-0 top-0 h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${currentIndex * 50}%` }}
          ></div>
        </div>

        {/* Step Items Row */}
        <div className="relative z-10 flex justify-between items-start">
          {steps.map((s, i) => {
            const isDone = i < currentIndex;
            const isActive = i === currentIndex;
            return (
              <div key={s.key} className="flex flex-col items-center w-20">
                {/* Circle Container */}
                <div className="h-12 flex items-center justify-center mb-2">
                  <div 
                    className={clsx(
                      "rounded-full flex items-center justify-center font-bold shadow-md transition-all duration-300",
                      isDone 
                        ? "w-10 h-10 bg-indigo-600 text-white" 
                        : isActive 
                          ? "w-12 h-12 bg-[var(--card-bg)] border-4 border-indigo-600 text-indigo-600 shadow-xl" 
                          : "w-10 h-10 bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-tertiary)]"
                    )}
                  >
                    {isDone ? (
                      <LucideIcons.Check className="h-5 w-5 stroke-[3]" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                </div>
                {/* Label */}
                <span 
                  className={clsx(
                    "font-bold text-xs tracking-wider whitespace-nowrap",
                    isDone || isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-[var(--text-tertiary)]"
                  )}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Konten Langkah Dinamis */}
      <div className="space-y-8">
        {step === "upload" && <UploadStep file={file} preview={preview} onFileSelect={handleFileSelect} onScan={handleScan} isScanning={isScanning} />}
        {step === "review" && scanResult && <ReviewStep scanResult={scanResult} categories={categories} onConfirm={handleConfirm} onRescan={handleReset} isConfirming={isConfirming} />}
        {step === "success" && <SuccessStep onReset={handleReset} onViewTransactions={() => navigate("/transactions")} />}
      </div>
    </div>
  );
});

export default ScanPage;
