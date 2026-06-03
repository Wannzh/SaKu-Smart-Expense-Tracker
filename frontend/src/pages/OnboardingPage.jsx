import { memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency } from "../utils/format";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  Bell,
  BellOff,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

const TOTAL_STEPS = 5;

/* ─── Step 1: Welcome ────────────────────────────────────── */
const StepWelcome = memo(function StepWelcome({ user }) {
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 mb-6 shadow-md">
        {initial}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Halo, {user?.name?.split(" ")[0] || "User"}! 👋
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Perjalanan finansialmu dimulai dari sini
      </p>
      <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full">
        <Wallet className="h-4 w-4 text-indigo-600" />
        <span className="text-xs font-semibold text-indigo-600">SaKu — Smart Expense Tracker</span>
      </div>
    </div>
  );
});

/* ─── Step 2: Currency ───────────────────────────────────── */
const StepCurrency = memo(function StepCurrency() {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Pilih Mata Uang</h2>
      <p className="text-sm text-gray-400 mb-6 text-center">Default untuk semua transaksi</p>

      {/* IDR Card — selected */}
      <div className="w-full rounded-2xl border-2 border-indigo-600 bg-white p-5 flex items-center gap-4 shadow-sm mb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white font-bold text-lg shrink-0">
          Rp
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Rupiah Indonesia</p>
          <p className="text-xs text-gray-400">IDR — Rp</p>
        </div>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* USD Card — disabled */}
      <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-5 flex items-center gap-4 opacity-50 mb-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-300 text-gray-600 font-bold text-lg shrink-0">
          $
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">US Dollar</p>
          <p className="text-xs text-gray-400">USD — $</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center italic">
        Bisa diubah kapan saja di Pengaturan
      </p>
    </div>
  );
});

/* ─── Step 3: Notifications ──────────────────────────────── */
const StepNotification = memo(function StepNotification({ enabled, onToggle }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Notifikasi Pintar</h2>
      <p className="text-sm text-gray-400 mb-6 text-center">Pengingat harian untuk mencatat pengeluaran</p>

      <div className="w-full rounded-2xl bg-white border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
        <div className={clsx(
          "flex h-12 w-12 items-center justify-center rounded-xl shrink-0 transition-colors",
          enabled ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400"
        )}>
          {enabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Pengingat Harian</p>
          <p className="text-xs text-gray-400">Ingatkan untuk catat pengeluaran setiap hari</p>
        </div>
        {/* Toggle */}
        <button onClick={onToggle}
          className={clsx(
            "relative h-7 w-12 rounded-full transition-colors cursor-pointer",
            enabled ? "bg-indigo-600" : "bg-gray-300"
          )}>
          <div className={clsx(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
            enabled ? "translate-x-5" : "translate-x-0.5"
          )} />
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        {enabled ? "✅ Notifikasi akan aktif" : "Kamu tetap bisa mengaktifkan nanti"}
      </p>
    </div>
  );
});

/* ─── Step 4: First Wallet ───────────────────────────────── */
const StepWallet = memo(function StepWallet({ amount, onAmountChange }) {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Dompet Pertama</h2>
      <p className="text-sm text-gray-400 mb-6 text-center">Masukkan jumlah uang tunai yang kamu pegang saat ini</p>

      <div className="w-full rounded-2xl bg-white border border-gray-200 p-5 shadow-sm mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg">
            💵
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Cash</p>
            <p className="text-xs text-gray-400">Uang tunai</p>
          </div>
        </div>

        {/* Amount input */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">Rp</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-gray-300 pl-10 pr-4 py-3.5 text-lg font-bold text-gray-800 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Kamu bisa menambah dompet lain (Bank, E-Wallet) nanti di menu Wallet
      </p>
    </div>
  );
});

/* ─── Step 5: Done ───────────────────────────────────────── */
const StepDone = memo(function StepDone({ user, walletBalance }) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated checkmark */}
      <div className="relative mb-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 animate-bounce-gentle">
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
        </div>
        <div className="absolute -right-1 -top-1">
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">Semua Siap! 🎉</h2>
      <p className="text-sm text-gray-500 mb-8">Kamu sudah siap mengelola keuangan dengan SaKu</p>

      {/* Summary card */}
      <div className="w-full rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-5 text-white text-left shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">{user?.name || "User"}</p>
            <p className="text-xs text-indigo-200">{user?.email}</p>
          </div>
        </div>
        <div className="h-px bg-white/20 mb-3" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-indigo-200">Wallet Cash</p>
            <p className="text-lg font-bold tabular-nums">{formatCurrency(walletBalance || 0)}</p>
          </div>
          <span className="text-2xl">💵</span>
        </div>
      </div>

      <style>{`
        @keyframes bounceGentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-gentle { animation: bounceGentle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
});

/* ─── Main OnboardingPage ────────────────────────────────── */

const OnboardingPage = memo(function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createWallet } = useWallet();

  const [step, setStep] = useState(0);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNotifToggle = useCallback(async () => {
    if (!notifEnabled && "Notification" in window) {
      const result = await Notification.requestPermission();
      setNotifEnabled(result === "granted");
    } else {
      setNotifEnabled((v) => !v);
    }
  }, [notifEnabled]);

  const handleNext = useCallback(async () => {
    // Step 4 (index 3) — create wallet
    if (step === 3) {
      setIsProcessing(true);
      try {
        const bal = parseFloat(walletAmount) || 0;
        await createWallet({
          name: "Cash",
          type: "cash",
          initialBalance: bal,
          icon: "💵",
          color: "#4F46E5",
        });
        setWalletBalance(bal);
        setStep((s) => s + 1);
      } catch {
        // toast handled by hook
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Last step — finish
    if (step === TOTAL_STEPS - 1) {
      localStorage.setItem("saku_onboarding_done", "true");
      navigate("/");
      return;
    }

    setStep((s) => s + 1);
  }, [step, walletAmount, createWallet, navigate]);

  const handleBack = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
  }, []);

  const buttonText = (() => {
    if (step === 3) return isProcessing ? "Membuat wallet..." : "Lanjut";
    if (step === TOTAL_STEPS - 1) return "Mulai SaKu 🚀";
    return "Lanjut";
  })();

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F0F2F5]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        {step > 0 ? (
          <button onClick={handleBack} className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-white hover:text-gray-600 transition-colors cursor-pointer">
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}

        {/* Step indicator pills */}
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div key={i} className={clsx(
              "h-1.5 rounded-full transition-all duration-300",
              i === step ? "w-7 bg-indigo-600" : i < step ? "w-4 bg-indigo-300" : "w-4 bg-gray-300"
            )} />
          ))}
        </div>

        <div className="h-9 w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm animate-fade-slide-up" key={step}>
          {step === 0 && <StepWelcome user={user} />}
          {step === 1 && <StepCurrency />}
          {step === 2 && <StepNotification enabled={notifEnabled} onToggle={handleNotifToggle} />}
          {step === 3 && <StepWallet amount={walletAmount} onAmountChange={setWalletAmount} />}
          {step === 4 && <StepDone user={user} walletBalance={walletBalance} />}
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-8 pb-10">
        <button
          onClick={handleNext}
          disabled={isProcessing}
          className={clsx(
            "w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold transition-all cursor-pointer shadow-lg",
            step === TOTAL_STEPS - 1
              ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200/50"
              : "bg-gray-900 text-white hover:bg-gray-800 shadow-gray-300/50",
            isProcessing && "opacity-70 cursor-not-allowed"
          )}
        >
          {buttonText}
          {step < TOTAL_STEPS - 1 && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
});

export default OnboardingPage;
