import { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MessageSquare, Mail, Code, Send, Star } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";

const FeedbackPage = memo(function FeedbackPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [feedbackType, setFeedbackType] = useState("Saran Fitur");

  const handleRating = (n) => {
    setRatingValue(n);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error("Masukan tidak boleh kosong");
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      toast.success("Terima kasih! Masukan kamu sangat berarti 💙");
      setFeedback("");
      setRatingValue(0);
      setFeedbackType("Saran Fitur");
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
          Kirim Masukan
        </h2>
      </div>

      {/* Grid Layout Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDE: Info Card (Sticky on Desktop) */}
        <div className="lg:col-span-4 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-3xl p-5 text-center lg:text-left space-y-4 lg:sticky lg:top-24 shadow-sm animate-fade-in">
          <div className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-650 dark:text-indigo-400 mx-auto lg:mx-0">
            <MessageSquare className="h-6 w-6 lg:h-7 lg:w-7" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--text-primary)]">Suara Kamu Berharga</h2>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mt-1">
              Masukan dan gagasan Anda sangat membantu tim pengembang dalam merancang dan menyempurnakan fitur-fitur SaKu agar lebih relevan dan optimal.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Form Input Sheet & External Connections */}
        <div className="lg:col-span-8 space-y-6">
          {/* Info Banner (amber bg) */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl text-amber-700 dark:text-amber-400 shadow-sm animate-fade-in">
            <Star className="h-5 w-5 shrink-0 fill-current text-amber-550" />
            <span className="text-xs font-semibold">Suara kamu sangat berarti bagi kami</span>
          </div>

          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-3xl p-6 shadow-sm space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Rating Bintang Interaktif */}
              <div className="space-y-2 flex flex-col items-center lg:items-start select-none">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
                  Beri Rating Aplikasi
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = ratingValue >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(star)}
                        className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      >
                        <Star
                          className={clsx(
                            "h-7 w-7 transition-colors",
                            isFilled ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-650"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Jenis Masukan */}
              <div className="space-y-2 select-none">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block px-1">
                  Jenis Masukan
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {["Saran Fitur", "Kendala", "Pujian", "Lainnya"].map((type) => {
                    const isSelected = feedbackType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFeedbackType(type)}
                        className={clsx(
                          "px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer whitespace-nowrap",
                          isSelected
                            ? "bg-indigo-650 border-indigo-650 text-white shadow-sm"
                            : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                        )}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Textarea Masukan */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
                  Pesan Masukan
                </label>
                <textarea
                  required
                  rows={5}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tuliskan masukan konstruktif, saran perbaikan, atau ide pengembangan fitur baru di sini..."
                  style={{ minHeight: "130px" }}
                  className="w-full rounded-xl border border-[var(--border-color)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/10 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {isSending ? "Mengirim Masukan..." : "Kirim Masukan Anda"}
              </button>
            </form>

            <div className="w-full h-px bg-[var(--border-color)]/60 my-5" />

            {/* Hubungi Langsung Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] px-0.5 select-none">
                Hubungi Developer Secara Langsung
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="mailto:developer@saku.com"
                  className="flex items-center gap-3 p-3.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]/60 rounded-2xl transition-all text-xs font-semibold text-[var(--text-primary)] group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-550 shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-[var(--text-primary)]">Email</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">developer@saku.com</p>
                  </div>
                </a>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toast("GitHub repository placeholder 🚀");
                  }}
                  className="flex items-center gap-3 p-3.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] border border-[var(--border-color)]/60 rounded-2xl transition-all text-xs font-semibold text-[var(--text-primary)] group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900/10 dark:bg-gray-100/10 text-gray-800 dark:text-gray-200 shrink-0 group-hover:scale-105 transition-transform">
                    <Code className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="font-bold text-[var(--text-primary)]">GitHub</p>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">wannzh/SaKu-Tracker</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
export default FeedbackPage;