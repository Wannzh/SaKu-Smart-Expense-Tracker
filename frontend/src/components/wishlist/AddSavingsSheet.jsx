import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Coins, ChevronDown, Banknote, Building2, Smartphone, Delete, Check, Loader2 } from "lucide-react";
import { formatCurrency } from "../../utils/format";
import WalletPicker from "../transaction/WalletPicker";
import clsx from "clsx";

const walletIconMap = {
  cash: Banknote,
  bank: Building2,
  ewallet: Smartphone,
};

const AddSavingsSheet = memo(function AddSavingsSheet({
  isOpen,
  onClose,
  onSubmit,
  wallets = [],
  wishlist,
  isLoading = false,
}) {
  const [amount, setAmount] = useState("0");
  const [walletId, setWalletId] = useState("");
  const [error, setError] = useState("");
  const [walletError, setWalletError] = useState("");
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);

  const selectedWallet = useMemo(() => {
    return wallets.find((w) => w.id === walletId);
  }, [wallets, walletId]);

  useEffect(() => {
    setAmount("0");
    setWalletId("");
    setError("");
    setWalletError("");
  }, [isOpen, wishlist]);

  if (!isOpen || !wishlist) return null;

  const { name, targetPrice, savedAmount } = wishlist;
  const remaining = Number(targetPrice || 0) - Number(savedAmount || 0);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const parsedAmount = Number(amount);
    let hasError = false;

    if (!amount || parsedAmount <= 0) {
      setError("Jumlah tabungan harus lebih besar dari 0");
      hasError = true;
    }

    if (!walletId) {
      setWalletError("Sumber dompet wajib dipilih");
      hasError = true;
    } else {
      // Check wallet balance
      const wallet = wallets.find((w) => w.id === walletId);
      if (wallet && Number(wallet.balance) < parsedAmount) {
        setError("Saldo dompet tidak mencukupi");
        hasError = true;
      }
    }

    if (hasError) return;

    onSubmit(wishlist.id, parsedAmount, walletId);
  };

  const handleQuickSelect = (value) => {
    // Cap at the remaining amount
    const finalVal = Math.min(value, remaining);
    setAmount(finalVal.toString());
    setError("");
  };

  const handleNumpadPress = useCallback((value) => {
    setAmount((prev) => {
      let current = prev;
      if (value === "delete") {
        current = current.slice(0, -1);
        if (current === "" || current === "-") current = "0";
      } else if (value === "clear") {
        current = "0";
      } else if (value === ".") {
        if (!current.includes(".")) {
          current = current === "" ? "0." : current + ".";
        }
      } else if (value === "000") {
        if (current !== "0" && current !== "") {
          current = current + "000";
        }
      } else {
        if (current === "0" || current === "") {
          current = value;
        } else {
          current = current + value;
        }
      }
      return current;
    });
  }, []);

  const formattedAmount = useMemo(() => {
    if (!amount || amount === "0") return "Rp 0";
    const [integer, decimal] = amount.split(".");
    const formattedInteger = Number(integer || 0).toLocaleString("id-ID");
    if (amount.includes(".")) {
      return `Rp ${formattedInteger},${decimal || ""}`;
    }
    return `Rp ${formattedInteger}`;
  }, [amount]);

  const quickAmounts = [20000, 50000, 100000, 200000, 500000];

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />

      {/* Sheet Container */}
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <form
          onSubmit={handleSubmit}
          className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pointer-events-auto"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Tambah Tabungan
            </h3>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-5">
            {/* Context Info */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-3 items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white flex-shrink-0">
                <Coins className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-[var(--text-secondary)]">Menabung untuk:</p>
                <h4 className="font-bold text-sm text-[var(--text-primary)] truncate">{name}</h4>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                  Sisa target: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(remaining)}</span>
                </p>
              </div>
            </div>

            {/* Wallet Picker trigger */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">
                Pilih Sumber Dompet <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsWalletPickerOpen(true)}
                className="w-full flex items-center justify-between rounded-xl border border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)] hover:border-indigo-500 text-left cursor-pointer transition-all mt-1"
              >
                {selectedWallet ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-lg shrink-0"
                      style={{
                        backgroundColor: `${selectedWallet.color || "#6B7280"}18`,
                        color: selectedWallet.color || "#6B7280",
                      }}
                    >
                      {(() => {
                        const Icon = walletIconMap[selectedWallet.type] || Banknote;
                        return <Icon className="h-3.5 w-3.5" />;
                      })()}
                    </div>
                    <span className="font-semibold text-sm text-[var(--text-primary)] truncate">
                      {selectedWallet.name} ({formatCurrency(selectedWallet.balance)})
                    </span>
                  </div>
                ) : (
                  <span className="text-[var(--text-tertiary)] text-xs">Pilih Dompet...</span>
                )}
                <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
              </button>
              {walletError && (
                <p className="text-xs text-red-500 px-1">{walletError}</p>
              )}
            </div>

            {/* Quick Select Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Pilih Nominal Cepat
              </label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((val) => {
                  // Hide if already fully saved
                  if (remaining <= 0) return null;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickSelect(val)}
                      className="py-2 px-3 text-xs font-semibold rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-500/50 transition-all cursor-pointer bg-transparent"
                    >
                      +{formatCurrency(val)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Summary Display & Inputs section */}
          <div className="shrink-0 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {/* LARGE AMOUNT DISPLAY */}
            <div className="flex flex-col items-center justify-center py-4 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
              <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-tertiary)]">
                Jumlah Tabungan
              </span>
              <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight tabular-nums mt-0.5">
                {formattedAmount}
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>

            {/* NUMPAD GRID */}
            <div className="p-3 bg-[var(--bg-secondary)]">
              <div className="grid grid-cols-4 gap-2 text-center max-w-md mx-auto">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("1")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("2")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("3")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("delete")}
                  className="bg-red-950/20 dark:bg-red-900/20 hover:bg-red-900/30 text-red-500 rounded-xl py-3 flex items-center justify-center cursor-pointer transition-transform active:scale-95 font-bold"
                >
                  <Delete className="h-4.5 w-4.5" />
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("4")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("5")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("6")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("clear")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  C
                </button>

                {/* Row 3 */}
                <button
                  type="button"
                  onClick={() => handleNumpadPress("7")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("8")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("9")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  9
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("000")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  000
                </button>

                {/* Row 4 */}
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-secondary)] font-bold text-xs py-3 rounded-xl cursor-pointer transition-transform active:scale-95 flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress("0")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadPress(".")}
                  className="bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] font-bold text-base py-3 rounded-xl cursor-pointer transition-transform active:scale-95"
                >
                  .
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-md font-bold"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        onSelect={(wallet) => {
          setWalletId(wallet.id);
          setWalletError("");
          setError("");
        }}
      />
    </>,
    document.body
  );
});

export default AddSavingsSheet;
