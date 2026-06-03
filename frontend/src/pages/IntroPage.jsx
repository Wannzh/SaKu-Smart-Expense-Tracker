import { memo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, ChevronRight } from "lucide-react";
import clsx from "clsx";

/* ─── SVG Illustrations ──────────────────────────────────── */

const Illust1 = memo(function Illust1() {
  return (
    <svg viewBox="0 0 300 250" fill="none" className="w-full max-w-[280px] mx-auto">
      {/* Receipt body */}
      <rect x="75" y="30" width="150" height="190" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="2" />
      <rect x="75" y="30" width="150" height="40" rx="12" fill="#4F46E5" />
      <rect x="75" y="58" width="150" height="12" fill="#4F46E5" />
      <text x="150" y="56" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui">RECEIPT</text>
      {/* Lines */}
      <rect x="95" y="85" width="110" height="6" rx="3" fill="#E5E7EB" />
      <rect x="95" y="100" width="80" height="6" rx="3" fill="#E5E7EB" />
      <rect x="95" y="115" width="100" height="6" rx="3" fill="#E5E7EB" />
      <rect x="95" y="130" width="60" height="6" rx="3" fill="#E5E7EB" />
      {/* Total */}
      <rect x="95" y="152" width="110" height="2" fill="#D1D5DB" />
      <rect x="95" y="165" width="50" height="8" rx="4" fill="#4F46E5" />
      <rect x="155" y="165" width="50" height="8" rx="4" fill="#10B981" />
      {/* Scan effect */}
      <rect x="65" y="120" width="170" height="3" rx="1.5" fill="#FBBF24" opacity="0.7">
        <animate attributeName="y" values="50;200;50" dur="2.5s" repeatCount="indefinite" />
      </rect>
      {/* Camera icon */}
      <circle cx="240" cy="60" r="28" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
      <rect x="228" y="50" width="24" height="18" rx="4" fill="#4F46E5" />
      <circle cx="240" cy="59" r="5" fill="white" />
      <rect x="232" y="46" width="16" height="5" rx="2" fill="#4F46E5" />
      {/* Sparkles */}
      <circle cx="60" cy="50" r="4" fill="#FBBF24" opacity="0.6" />
      <circle cx="50" cy="180" r="3" fill="#10B981" opacity="0.5" />
      <circle cx="255" cy="200" r="5" fill="#FBBF24" opacity="0.4" />
    </svg>
  );
});

const Illust2 = memo(function Illust2() {
  return (
    <svg viewBox="0 0 300 250" fill="none" className="w-full max-w-[280px] mx-auto">
      {/* Chart area */}
      <rect x="40" y="50" width="160" height="150" rx="14" fill="white" stroke="#E5E7EB" strokeWidth="2" />
      {/* Bars */}
      <rect x="62" y="140" width="18" height="40" rx="4" fill="#E5E7EB" />
      <rect x="88" y="110" width="18" height="70" rx="4" fill="#4F46E5" />
      <rect x="114" y="125" width="18" height="55" rx="4" fill="#10B981" />
      <rect x="140" y="90" width="18" height="90" rx="4" fill="#4F46E5" />
      <rect x="166" y="105" width="18" height="75" rx="4" fill="#FBBF24" />
      {/* Trend line */}
      <polyline points="71,135 97,105 123,118 149,85 175,100" stroke="#4F46E5" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 3" />
      {/* Header bar */}
      <rect x="60" y="62" width="55" height="6" rx="3" fill="#D1D5DB" />
      <circle cx="180" cy="65" r="5" fill="#10B981" />
      {/* AI Chat bubble */}
      <rect x="180" y="65" width="100" height="110" rx="16" fill="#4F46E5" />
      <rect x="180" y="65" width="100" height="30" rx="16" fill="#4338CA" />
      <circle cx="200" cy="80" r="8" fill="#FBBF24" />
      <text x="218" y="84" fill="white" fontSize="9" fontWeight="600" fontFamily="system-ui">SaKu AI</text>
      {/* Chat lines */}
      <rect x="195" y="105" width="70" height="5" rx="2.5" fill="white" opacity="0.4" />
      <rect x="195" y="117" width="55" height="5" rx="2.5" fill="white" opacity="0.3" />
      <rect x="195" y="129" width="65" height="5" rx="2.5" fill="white" opacity="0.4" />
      <rect x="195" y="148" width="45" height="14" rx="7" fill="#FBBF24" />
      <text x="218" y="159" textAnchor="middle" fill="#1F2937" fontSize="7" fontWeight="700" fontFamily="system-ui">Tips ✨</text>
      {/* Sparkles */}
      <circle cx="45" cy="42" r="4" fill="#FBBF24" opacity="0.6" />
      <circle cx="265" cy="195" r="3" fill="#10B981" opacity="0.5" />
    </svg>
  );
});

const Illust3 = memo(function Illust3() {
  return (
    <svg viewBox="0 0 300 250" fill="none" className="w-full max-w-[280px] mx-auto">
      {/* Card 1 (back) */}
      <rect x="55" y="50" width="190" height="110" rx="16" fill="#10B981" opacity="0.3" transform="rotate(-6 150 105)" />
      {/* Card 2 (middle) */}
      <rect x="55" y="55" width="190" height="110" rx="16" fill="#FBBF24" opacity="0.5" transform="rotate(-2 150 110)" />
      {/* Card 3 (front) */}
      <rect x="55" y="60" width="190" height="110" rx="16" fill="#4F46E5" />
      <rect x="75" y="80" width="40" height="28" rx="6" fill="white" opacity="0.25" />
      <text x="85" y="100" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui">💵</text>
      <text x="75" y="140" fill="white" opacity="0.7" fontSize="10" fontFamily="system-ui">Cash</text>
      <text x="75" y="155" fill="white" fontSize="16" fontWeight="700" fontFamily="system-ui">Rp 2.500.000</text>
      {/* Chip */}
      <rect x="195" y="80" width="30" height="22" rx="4" fill="white" opacity="0.2" />
      <line x1="195" y1="88" x2="225" y2="88" stroke="white" opacity="0.3" strokeWidth="1" />
      <line x1="195" y1="95" x2="225" y2="95" stroke="white" opacity="0.3" strokeWidth="1" />
      {/* Bottom icons */}
      <circle cx="90" cy="210" r="20" fill="#EEF2FF" />
      <text x="90" y="215" textAnchor="middle" fontSize="16">💵</text>
      <circle cx="150" cy="210" r="20" fill="#FEF3C7" />
      <text x="150" y="215" textAnchor="middle" fontSize="16">🏦</text>
      <circle cx="210" cy="210" r="20" fill="#ECFDF5" />
      <text x="210" y="215" textAnchor="middle" fontSize="16">💳</text>
      {/* Sparkles */}
      <circle cx="40" cy="45" r="4" fill="#FBBF24" opacity="0.5" />
      <circle cx="260" cy="50" r="3" fill="#10B981" opacity="0.6" />
    </svg>
  );
});

const Illust4 = memo(function Illust4() {
  return (
    <svg viewBox="0 0 300 250" fill="none" className="w-full max-w-[280px] mx-auto">
      {/* Target circle */}
      <circle cx="150" cy="110" r="70" fill="#EEF2FF" />
      <circle cx="150" cy="110" r="50" fill="#C7D2FE" opacity="0.5" />
      <circle cx="150" cy="110" r="30" fill="#4F46E5" />
      <circle cx="150" cy="110" r="10" fill="white" />
      {/* Rocket */}
      <g transform="translate(140,60) rotate(30 10 30)">
        <path d="M10,0 L18,25 L10,20 L2,25 Z" fill="#FBBF24" />
        <rect x="6" y="20" width="8" height="4" rx="2" fill="#EF4444" />
        <rect x="4" y="22" width="12" height="4" rx="2" fill="#F97316" opacity="0.7" />
      </g>
      {/* Coins */}
      <circle cx="70" cy="170" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
      <text x="70" y="175" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="700" fontFamily="system-ui">$</text>
      <circle cx="95" cy="185" r="12" fill="#FBBF24" stroke="#D97706" strokeWidth="2" opacity="0.7" />
      <circle cx="210" cy="180" r="14" fill="#10B981" stroke="#059669" strokeWidth="2" />
      <text x="210" y="185" textAnchor="middle" fill="white" fontSize="10" fontWeight="700" fontFamily="system-ui">Rp</text>
      <circle cx="235" cy="168" r="10" fill="#10B981" stroke="#059669" strokeWidth="2" opacity="0.6" />
      {/* Stars */}
      <circle cx="80" cy="55" r="4" fill="#FBBF24" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="230" cy="70" r="3" fill="#4F46E5" opacity="0.5">
        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="50" cy="120" r="3" fill="#10B981" opacity="0.6">
        <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="255" cy="130" r="4" fill="#FBBF24" opacity="0.4">
        <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Bottom text bar */}
      <rect x="90" y="215" width="120" height="24" rx="12" fill="#4F46E5" />
      <text x="150" y="231" textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="system-ui">Let's Go! 🚀</text>
    </svg>
  );
});

const illustrations = [Illust1, Illust2, Illust3, Illust4];

const slides = [
  { title: "Catat Lebih Cerdas", subtitle: "SCAN STRUK", desc: "Foto struk belanja dan biarkan AI membaca otomatis dalam hitungan detik" },
  { title: "Wawasan Finansial", subtitle: "AI CHATBOT", desc: "Tanya asisten AI SaKu untuk analisis pengeluaran dan saran keuangan" },
  { title: "Kelola Semua Dompet", subtitle: "MULTI WALLET", desc: "Pantau saldo Cash, Bank, dan E-Wallet dalam satu tampilan" },
  { title: "Mulai Perjalananmu", subtitle: "MULAI SEKARANG", desc: "Bergabung dan mulai kelola keuanganmu lebih cerdas bersama SaKu" },
];

/* ─── Splash Screen ──────────────────────────────────────── */

const SplashScreen = memo(function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800">
      <div className="animate-fade-slide-up flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm mb-5 shadow-lg">
          <Wallet className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">SaKu</h1>
        <p className="text-indigo-200 text-sm mt-1">Smart Expense Tracker</p>
      </div>
      {/* Subtle loading bar */}
      <div className="absolute bottom-20 w-32 h-1 rounded-full bg-white/20 overflow-hidden">
        <div className="h-full bg-white/60 rounded-full" style={{ animation: "loadBar 2s ease-in-out forwards" }} />
      </div>
      <style>{`@keyframes loadBar { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
});

/* ─── Main IntroPage ─────────────────────────────────────── */

const IntroPage = memo(function IntroPage() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const isLast = currentSlide === slides.length - 1;

  const finish = useCallback((target) => {
    localStorage.setItem("saku_intro_seen", "true");
    navigate(target);
  }, [navigate]);

  const handleNext = useCallback(() => {
    if (isLast) {
      finish("/register");
    } else {
      setCurrentSlide((i) => i + 1);
    }
  }, [isLast, finish]);

  const handleSkip = useCallback(() => {
    finish("/login");
  }, [finish]);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  const slide = slides[currentSlide];
  const Illustration = illustrations[currentSlide];

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F0F2F5]">
      {/* Skip button */}
      <div className="flex justify-end px-6 pt-6">
        <button onClick={handleSkip} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
          Lewati
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Illustration */}
        <div className="mb-8 animate-fade-slide-up" key={currentSlide}>
          <Illustration />
        </div>

        {/* Step indicator pills */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={clsx(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentSlide ? "w-8 bg-indigo-600" : "w-4 bg-gray-300"
            )} />
          ))}
        </div>

        {/* Text */}
        <div className="text-center max-w-sm animate-fade-slide-up" key={`text-${currentSlide}`}>
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
            {slide.subtitle}
          </span>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">{slide.title}</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{slide.desc}</p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="px-8 pb-10">
        <button onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-indigo-200/50">
          {isLast ? "Mulai Sekarang" : "Lanjut"}
          <ChevronRight className="h-4 w-4" />
        </button>
        {isLast && (
          <button onClick={() => finish("/login")}
            className="w-full text-center mt-4 text-sm text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer">
            Sudah punya akun? <span className="font-semibold">Masuk</span>
          </button>
        )}
      </div>
    </div>
  );
});

export default IntroPage;
