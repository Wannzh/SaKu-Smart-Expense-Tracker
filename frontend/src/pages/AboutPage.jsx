import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Info, Sparkles } from "lucide-react";

const AboutPage = memo(function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-3xl mx-auto pb-12 animate-fade-slide-up select-none">
      {/* Header back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] cursor-pointer transition-colors"
          title="Kembali"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Tentang Aplikasi</h1>
      </div>

      <div className="w-full text-center space-y-8">
        {/* App Icon Area */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="w-16 h-16 bg-[var(--card-bg)] border border-[var(--border-color)]/40 rounded-2xl flex items-center justify-center shadow-lg relative z-10 hover:scale-105 transition-transform duration-300 p-2">
              <img alt="SaKu App Icon" className="w-full h-full object-contain dark:bg-white dark:rounded-md dark:p-1" src="/saku.svg" />
            </div>
          </div>
        </div>

        {/* Title & Slogan */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">SaKu</h1>
            <span className="bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/15 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">v1.0.4</span>
          </div>
          <p className="text-base text-[var(--text-secondary)] max-w-lg mt-2 leading-relaxed">
            Menciptakan kejelasan finansial personal melalui desain antarmuka modern dan kecerdasan pemindaian AI.
          </p>
        </div>

        {/* Bento Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
          
          {/* Card: calculated confidence */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-6 rounded-2xl space-y-4 hover:shadow-xs transition-shadow duration-200">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Info className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Calculated Confidence</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
              Misi kami adalah menggantikan kecemasan finansial dengan data empiris. Kami membangun alat yang mengelola ekonomi personal Anda layaknya mesin performa tinggi—andal, efisien, dan transparan.
            </p>
          </div>

          {/* Card: smart fluidity */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-6 rounded-2xl space-y-4 hover:shadow-xs transition-shadow duration-200">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Smart Fluidity</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
              Memanfaatkan pemindaian struk berbasis AI dan pengategorian transaksi real-time untuk memastikan akurasi data finansial Anda. Rasakan pengalaman pengelolaan keuangan yang adaptif dan cerdas.
            </p>
          </div>

        </div>

        {/* Skyscraper Team Image */}
        <div className="mt-12 w-full h-[280px] rounded-2xl overflow-hidden relative group shadow-sm border border-[var(--border-color)]/40">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
            alt="Modern skyscraper structure reflecting the sky" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaNV7eGxOH9cUEZzr4HKbZQyd7lJIk03GiHZETYccMez8cGS3BWZA2CWSADfeQuxgaFZNT-bhQNffCcTnlHwLyj9G4cB3rr-lJCmbKOZtwIXEfuAYDWYVfQR-ENO_dx4UOqceLhG__-y4Dy3FxH5CREvRdfRQrTQ7JIDqVIneOEiWFSPPGUfuWBEmqFRMSjrgzVRS-a7nzuMJ6olwQl8z76yDL9YWxPcFj_btaLX9102xhzS95AMaubaYfqdgVixz1fP0f_4tVqOk" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 text-left">
            <span className="text-[10px] text-indigo-400 uppercase font-extrabold tracking-widest">Built for Impact</span>
            <h2 className="text-lg font-bold text-white mt-1">Standar Global, Sentuhan Personal</h2>
          </div>
        </div>

        {/* Developer Info Section */}
        <div className="pt-6 border-t border-[var(--border-color)]/60 text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
            Profil Pengembang
          </h3>
          <div className="bg-[var(--bg-tertiary)]/40 border border-[var(--border-color)]/50 rounded-2xl p-5 space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)] shrink-0 font-semibold">Nama Lengkap</span>
              <span className="font-bold text-[var(--text-primary)] text-right">Muhamad Alwan Fadhlurrohman</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)] shrink-0 font-semibold">Universitas</span>
              <span className="font-bold text-[var(--text-primary)] text-right">Universitas Nasional Pasim Bandung</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--text-tertiary)] shrink-0 font-semibold">Program Studi</span>
              <span className="font-bold text-[var(--text-primary)] text-right">Teknik Informatika</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="pt-8 border-t border-[var(--border-color)]/40 flex flex-col sm:flex-row justify-between items-start gap-4 text-left">
          <div className="space-y-1">
            <p className="text-xs text-[var(--text-secondary)] font-bold">© 2024 SaKu Financial Technologies Inc.</p>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium">Dirancang dengan presisi neo-Swiss di Jakarta, Indonesia.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <a className="text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-[var(--border-color)]" href="#">Privacy Policy</a>
            <a className="text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-[var(--border-color)]" href="#">Terms of Service</a>
            <a className="text-[var(--text-secondary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors underline underline-offset-4 decoration-[var(--border-color)]" href="#">Legal Notice</a>
          </div>
        </footer>
      </div>
    </div>
  );
});

export default AboutPage;