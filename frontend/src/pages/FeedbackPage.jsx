import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageSquare, Mail, Code, Send } from "lucide-react";
import toast from "react-hot-toast";

const FeedbackPage = memo(function FeedbackPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("Masukan tidak boleh kosong");
      return;
    }

    setIsSending(true);
    // Simulating API call
    setTimeout(() => {
      toast.success("Terima kasih! Masukan kamu sangat berarti 💙");
      setFeedback("");
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
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Kirim Masukan</h1>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Intro Hero */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
            <MessageSquare className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Suara Kamu Berharga</h2>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed max-w-xs mt-1">
              Punya ide fitur baru? Menemukan kendala? Atau sekadar ingin menyapa? Kami siap mendengarkan!
            </p>
          </div>
        </div>

        {/* Feedback Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Pesan Masukan
            </label>
            <textarea
              required
              rows={5}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tuliskan masukan, saran, atau ide fitur baru di sini..."
              style={{ minHeight: "120px" }}
              className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-sm active:scale-99"
          >
            <Send className="h-4 w-4" />
            {isSending ? "Mengirim..." : "Kirim Masukan"}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full h-px bg-[var(--border-color)] my-4" />

        {/* Hubungi Langsung Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-1">
            Hubungi Developer Langsung
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href="mailto:developer@saku.com"
              className="flex items-center gap-3 p-3.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] hover:border-[var(--text-tertiary)]/20 rounded-xl transition-all text-xs font-semibold text-[var(--text-primary)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[var(--text-primary)]">Email Developer</p>
                <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">developer@saku.com</p>
              </div>
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast("GitHub repository placeholder 🚀");
              }}
              className="flex items-center gap-3 p-3.5 bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] border border-[var(--border-color)] hover:border-[var(--text-tertiary)]/20 rounded-xl transition-all text-xs font-semibold text-[var(--text-primary)]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900/10 dark:bg-gray-100/10 text-gray-800 dark:text-gray-200 shrink-0">
                <Code className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)]">GitHub Repository</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">wannzh/SaKu-Tracker</p>
              </div>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
});

export default FeedbackPage;
