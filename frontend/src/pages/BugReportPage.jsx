import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, AlertCircle, Send, Bug } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const fiturs = [
  "Dashboard",
  "Transaksi",
  "Transfer",
  "Scan Struk",
  "Chat AI",
  "Statistik",
  "Dompet",
  "Profil",
  "Lainnya",
];

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
    // Simulating API call
    setTimeout(() => {
      toast.success("Bug dilaporkan! Tim kami akan segera menangani 🐛");
      setForm({
        fitur: "",
        severity: "LOW",
        title: "",
        description: "",
        steps: "",
      });
      setIsSending(false);
    }, 800);
  };

  return (
    <div className="max-w-xl mx-auto pb-12 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] cursor-pointer transition-colors"
          title="Kembali"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Lapor Bug</h1>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-5">
        
        {/* Info Alert Box */}
        <div className="flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-xs font-semibold leading-relaxed">
            Deskripsi bug yang terperinci dan langkah reproduksi membantu tim kami menemukan dan memperbaiki error lebih cepat.
          </p>
        </div>

        {/* Bug Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Fitur Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Fitur Bermasalah
            </label>
            <select
              name="fitur"
              value={form.fitur}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">Pilih Fitur...</option>
              {fiturs.map((fitur) => (
                <option key={fitur} value={fitur}>
                  {fitur}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Toggle Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
              Tingkat Keparahan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {severities.map((sev) => {
                const isActive = form.severity === sev.key;
                
                // Color mappings based on color name
                let colorClasses = "";
                if (sev.color === "emerald") {
                  colorClasses = isActive 
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-500" 
                    : "bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:text-emerald-500/80";
                } else if (sev.color === "amber") {
                  colorClasses = isActive 
                    ? "bg-amber-500/15 border-amber-500 text-amber-500" 
                    : "bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:text-amber-500/80";
                } else if (sev.color === "orange") {
                  colorClasses = isActive 
                    ? "bg-orange-500/15 border-orange-500 text-orange-500" 
                    : "bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:text-orange-500/80";
                } else if (sev.color === "red") {
                  colorClasses = isActive 
                    ? "bg-red-500/15 border-red-500 text-red-500" 
                    : "bg-[var(--bg-tertiary)] border-transparent text-[var(--text-secondary)] hover:text-red-500/80";
                }

                return (
                  <button
                    key={sev.key}
                    type="button"
                    onClick={() => handleSelectSeverity(sev.key)}
                    className={clsx(
                      "py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer",
                      colorClasses
                    )}
                  >
                    {sev.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Judul Bug */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Judul Bug
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Contoh: Saldo dompet tidak bertambah setelah transfer"
              className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Deskripsi Bug */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Deskripsi Kejadian
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Apa yang terjadi? Apa yang seharusnya terjadi? Tolong jelaskan secara detail."
              className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all resize-y"
            />
          </div>

          {/* Langkah Reproduksi */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Langkah Reproduksi
              </label>
              <span className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase">Opsional</span>
            </div>
            <textarea
              name="steps"
              value={form.steps}
              onChange={handleChange}
              rows={3}
              placeholder="1. Masuk ke halaman Wallet&#10;2. Pilih dompet asal&#10;3. Klik transfer... dst."
              className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all resize-y"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm active:scale-99 mt-2"
          >
            <Bug className="h-4 w-4" />
            {isSending ? "Mengirim Laporan..." : "Kirim Laporan"}
          </button>
        </form>

      </div>
    </div>
  );
});

export default BugReportPage;
