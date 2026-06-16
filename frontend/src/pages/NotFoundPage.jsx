import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, FileQuestion, ArrowLeft } from "lucide-react";
import Button from "../components/common/Button";

const NotFoundPage = memo(function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] p-4 relative overflow-hidden select-none">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full text-center z-10 flex flex-col items-center">
        {/* Animated Icon Container */}
        <div className="relative mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-2xl w-24 h-24 animate-pulse"></div>
          <div className="w-24 h-24 rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]/50 flex items-center justify-center shadow-xl relative animate-float">
            <FileQuestion className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            <Compass className="w-6 h-6 text-purple-500 dark:text-purple-400 absolute top-2 right-2 animate-spin-slow" />
          </div>
        </div>

        {/* Huge 404 Code */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent mb-4 drop-shadow-sm animate-fade-slide-up">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-primary)] mb-3 tracking-tight">
          Halaman Tidak Ditemukan
        </h2>

        {/* Description */}
        <p className="text-sm md:text-base text-[var(--text-secondary)] mb-10 max-w-sm leading-relaxed">
          Halaman yang kamu cari tidak ada atau telah dipindahkan ke alamat lain.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            variant="primary"
            onClick={() => navigate("/dashboard")}
            className="w-full sm:w-auto px-8 py-3.5 shadow-lg shadow-indigo-600/10"
          >
            Kembali ke Dashboard
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
});

export default NotFoundPage;
