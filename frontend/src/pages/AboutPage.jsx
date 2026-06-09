import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ScanLine, MessageSquare, Wallet, BarChart2 } from "lucide-react";

const AboutPage = memo(function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 select-none">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] cursor-pointer transition-colors"
          title="Kembali"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Tentang SaKu</h1>
      </div>

      {/* Main Responsive Grid Card Container */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 lg:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Logo & Intro */}
        <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left lg:border-r lg:border-[var(--border-color)]/60 lg:pr-8 lg:h-full justify-center py-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600 shadow-md shadow-indigo-300/40 mb-4 animate-pulse-glow">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-indigo-600 tracking-tight">SaKu</h2>
          <p className="text-sm font-semibold text-[var(--text-secondary)] mt-0.5">Smart Expense Tracker</p>
          <span className="text-xs text-[var(--text-tertiary)] font-bold bg-[var(--bg-tertiary)] px-3 py-1 rounded-full mt-3 border border-[var(--border-color)]/30">
            Version 1.0.0
          </span>
          
          <div className="mt-6 hidden lg:block">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Misi SaKu
            </h3>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)] font-medium">
              Dibuat dengan ❤️ untuk proyek akhir perkuliahan, berfokus pada penyederhanaan manajemen finansial personal.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Features */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
              Tentang Aplikasi
            </h3>
            <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
              SaKu lahir dari keyakinan bahwa mengelola keuangan seharusnya tidak rumit. 
              Kami menghadirkan teknologi OCR dan kecerdasan buatan (AI) untuk membantu kamu 
              mencatat dan menganalisis setiap transaksi dengan mudah, praktis, dan cerdas.
            </p>
          </div>

          {/* Fitur Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
              Fitur Unggulan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-indigo-500 border border-[var(--border-color)]/20">
                  <ScanLine className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Scan Struk OCR</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Membaca data struk otomatis via kamera.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-purple-500 border border-[var(--border-color)]/20">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">AI Chatbot Assistant</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Insight dan konsultasi finansial cerdas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-emerald-500 border border-[var(--border-color)]/20">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Multi Wallet</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Kelola alokasi saldo berkategori aman.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-amber-500 border border-[var(--border-color)]/20">
                  <BarChart2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Statistik Tren</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Visualisasi alur kas masuk & keluar instan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Section */}
          <div className="pt-4 border-t border-[var(--border-color)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2.5">
              Developer Profile
            </h3>
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-color)]/40 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-tertiary)] shrink-0">Nama Lengkap</span>
                <span className="font-bold text-[var(--text-primary)] text-right">Muhamad Alwan Fadhlurrohman</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-tertiary)] shrink-0">Universitas</span>
                <span className="font-bold text-[var(--text-primary)] text-right">Universitas Nasional Pasim Bandung</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[var(--text-tertiary)] shrink-0">Program Studi</span>
                <span className="font-bold text-[var(--text-primary)] text-right">Teknik Informatika</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer Mobile Only Note style */}
      <div className="mt-6 text-center text-[10px] font-bold text-[var(--text-tertiary)] tracking-wider block lg:hidden">
        Dibuat dengan ❤️ untuk project akhir
      </div>
    </div>
  );
});

export default AboutPage;