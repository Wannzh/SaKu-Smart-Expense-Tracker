import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ScanLine, MessageSquare, Wallet, BarChart2 } from "lucide-react";

const AboutPage = memo(function AboutPage() {
  const navigate = useNavigate();

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
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Tentang SaKu</h1>
      </div>

      {/* Main Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl p-6 shadow-sm flex flex-col items-center text-center">
        {/* Logo */}
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-600 shadow-md shadow-indigo-300/40 mb-4 animate-pulse-glow">
          <Wallet className="h-8 w-8 text-white" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-indigo-600 tracking-tight">SaKu</h2>
        <p className="text-sm font-semibold text-[var(--text-secondary)] mt-0.5">Smart Expense Tracker</p>
        <p className="text-xs text-[var(--text-tertiary)] font-bold bg-[var(--bg-tertiary)] px-2.5 py-1 rounded-full mt-2.5">
          v1.0.0
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-[var(--border-color)] my-6" />

        {/* Tentang Section */}
        <div className="text-left w-full space-y-4">
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
            <ul className="space-y-3">
              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-indigo-500">
                  <ScanLine className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Scan Struk OCR</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Foto struk belanja kamu, dan AI akan membaca datanya otomatis.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-purple-500">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">AI Chatbot Assistant</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Konsultasikan pola keuangan dan dapatkan insight finansial yang cerdas.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-emerald-500">
                  <Wallet className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Multi Wallet & Transfer</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Kelola banyak dompet dan catat transfer dana secara atomic & aman.</p>
                </div>
              </li>

              <li className="flex items-start gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-tertiary)] text-amber-500">
                  <BarChart2 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">Statistik & Trend Grafik</h4>
                  <p className="text-[11px] text-[var(--text-tertiary)] leading-tight mt-0.5">Visualisasikan arus kas pemasukan dan pengeluaran secara terperinci.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Developer Section */}
          <div className="pt-2 border-t border-[var(--border-color)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2.5">
              Developer
            </h3>
            <div className="bg-[var(--bg-tertiary)] rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Nama Lengkap</span>
                <span className="font-semibold text-[var(--text-primary)]">Muhamad Alwan Fadhlurrohman</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Universitas</span>
                <span className="font-semibold text-[var(--text-primary)] text-right">Universitas Nasional Pasim Bandung</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Program Studi</span>
                <span className="font-semibold text-[var(--text-primary)]">Teknik Informatika</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] font-bold text-[var(--text-tertiary)] tracking-wide">
          Dibuat dengan ❤️ untuk project akhir
        </div>
      </div>
    </div>
  );
});

export default AboutPage;
