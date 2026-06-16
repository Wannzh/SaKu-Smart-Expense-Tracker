import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, AlertCircle, Send, Bug } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const fiturs = ["Dashboard", "Transaksi", "Transfer", "Scan Struk", "Chat AI", "Statistik", "Dompet", "Profil", "Lainnya"];

const severities = [
  { key: "LOW", label: "Rendah", color: "emerald" },
  { key: "MEDIUM", label: "Sedang", color: "amber" },
  { key: "HIGH", label: "Tinggi", color: "orange" },
  { key: "CRITICAL", label: "Kritis", color: "red" },
];

const BugReportPage = memo(function BugReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fitur: "",
    severity: "LOW",
    title: "",
    description: "",
    steps: "",
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSelectSeverity = useCallback((sev) => {
    setForm((prev) => ({ ...prev, severity: sev }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fitur) {
      toast.error("Silakan pilih fitur yang bermasalah");
      return;
    }
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Judul dan deskripsi bug wajib diisi");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      toast.success("Bug dilaporkan! Tim kami akan segera menangani 🐛");
      setForm({ fitur: "", severity: "LOW", title: "", description: "", steps: "" });
      setIsSending(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-xl lg:max-w-5xl mx-auto pb-24 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 py-4 mb-4 select-none">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
          Lapor Bug
        </h2>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: Alert & Guidelines (Sticky on Desktop) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="flex flex-col gap-3 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider">Petunjuk Laporan</h3>
            </div>
            <p className="text-xs font-medium leading-relaxed">
              Deskripsi insiden bug yang terperinci serta lampiran langkah kejadian membantu tim pengembang menemukan titik error kode secara presisi dan memperbaikinya secara cepat.
            </p>
          </div>
          
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-4 rounded-2xl hidden lg:block select-none shadow-sm">
            <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Status Penanganan</h4>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">Laporan masuk akan divalidasi dalam kurun waktu 1x24 jam kerja.</p>
          </div>
        </div>

        {/* RIGHT PANEL: Form Sheet */}
        <div className="lg:col-span-8 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-3xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fitur Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
                  Fitur Bermasalah
                </label>
                <select
                  name="fitur"
                  value={form.fitur}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm appearance-none"
                >
                  <option value="">Pilih Fitur...</option>
                  {fiturs.map((fitur) => (
                    <option key={fitur} value={fitur}>{fitur}</option>
                  ))}
                </select>
              </div>

              {/* Severity Toggle Chips */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block px-1">
                  Tingkat Keparahan
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {severities.map((sev) => {
                    const isActive = form.severity === sev.key;
                    let colorClasses = "";
                    if (sev.color === "emerald") {
                      colorClasses = isActive
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold"
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:text-emerald-500/80";
                    } else if (sev.color === "amber") {
                      colorClasses = isActive
                        ? "bg-amber-500/10 border-amber-500 text-amber-500 font-bold"
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:text-amber-500/80";
                    } else if (sev.color === "orange") {
                      colorClasses = isActive
                        ? "bg-orange-500/10 border-orange-500 text-orange-500 font-bold"
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:text-orange-500/80";
                    } else if (sev.color === "red") {
                      colorClasses = isActive
                        ? "bg-red-500/10 border-red-500 text-red-500 font-bold"
                        : "bg-[var(--bg-secondary)] border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:text-red-500/80";
                    }

                    return (
                      <button
                        key={sev.key}
                        type="button"
                        onClick={() => handleSelectSeverity(sev.key)}
                        className={clsx("py-2 px-2 text-[11px] font-semibold rounded-xl border text-center transition-all cursor-pointer active:scale-95", colorClasses)}
                      >
                        {sev.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Judul Bug */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
                Judul Insiden Bug
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Contoh: Saldo dompet tidak bertambah setelah transfer"
                className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
              />
            </div>

            {/* Deskripsi Bug */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
                Deskripsi Kejadian Lengkap
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                style={{ minHeight: "100px" }}
                placeholder="Jelaskan anomali sistem yang terjadi secara detail..."
                className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y shadow-sm"
              />
            </div>

            {/* Langkah Reproduksi */}
            <div className="space-y-1">
              <div className="flex justify-between items-center select-none px-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Langkah Reproduksi Error
                </label>
                <span className="text-[10px] text-[var(--text-tertiary)] font-bold bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-md uppercase tracking-wider">Opsional</span>
              </div>
              <textarea
                name="steps"
                value={form.steps}
                onChange={handleChange}
                rows={3}
                style={{ minHeight: "80px" }}
                placeholder="1. Masuk ke halaman Wallet&#10;2. Pilih dompet asal&#10;3. Klik transfer... dst."
                className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y shadow-sm"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <Bug className="h-4 w-4" />
              {isSending ? "Mengirim Laporan Bug..." : "Kirim Laporan Bug"}
            </button>
          </form>

          {/* Status Validasi (Mobile Only) */}
          <div className="block lg:hidden mt-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)]/60 rounded-2xl select-none text-center">
            <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-1">Status Penanganan</h4>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">Laporan masuk akan divalidasi dalam kurun waktu 1x24 jam kerja.</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BugReportPage;