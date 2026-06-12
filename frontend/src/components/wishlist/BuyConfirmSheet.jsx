import { memo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronDown, Banknote, Building2, Smartphone, Loader2 } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { useTransaction } from "../../hooks/useTransaction";
import { useWishlist } from "../../hooks/useWishlist";
import { formatCurrency } from "../../utils/format";
import WalletPicker from "../transaction/WalletPicker";
import toast from "react-hot-toast";
import clsx from "clsx";

const walletIconMap = {
  cash: Banknote,
  bank: Building2,
  ewallet: Smartphone,
};

const BuyConfirmSheet = memo(function BuyConfirmSheet({
  isOpen,
  item,
  onClose,
  onSuccess,
}) {
  const { wallets, getWallets } = useWallet();
  const { createTransaction } = useTransaction();
  const { markWishlistAchieved } = useWishlist();
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getWallets();
    }
  }, [isOpen, getWallets]);

  // Set default wallet
  useEffect(() => {
    if (isOpen && wallets.length > 0 && !selectedWallet) {
      const cashWallet = wallets.find((w) => w.type === "cash");
      setSelectedWallet(cashWallet || wallets[0]);
    }
  }, [isOpen, wallets, selectedWallet]);

  // Reset selected wallet on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedWallet(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!selectedWallet || isProcessing) return;

    setIsProcessing(true);
    try {
      const txPayload = {
        amount: Number(item.targetPrice),
        type: "EXPENSE",
        description: `Pembelian: ${item.name}`,
        date: new Date().toISOString(),
        walletId: selectedWallet.id,
      };

      await createTransaction(txPayload);
      await markWishlistAchieved(item.id);

      toast.success("Pembelian Berhasil! Mimpimu Tercapai 🎉");
      onSuccess();
    } catch (err) {
      console.error("[BuyConfirmSheet] handleConfirm error:", err);
      toast.error(err.response?.data?.message || err.message || "Gagal melakukan pembelian");
    } finally {
      setIsProcessing(false);
    }
  };

  return createPortal(
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in cursor-pointer"
      />
      <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4 pointer-events-none animate-fade-in">
        <div
          className="w-full lg:max-w-md bg-[var(--card-bg)] border border-[var(--border-color)] rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up pointer-events-auto"
        >
          {/* Header */}
          <div className="relative flex items-center justify-center px-6 py-4 border-b border-[var(--border-color)]">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              Beli Barang
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none space-y-5">
            <p className="font-semibold text-sm text-[var(--text-primary)] mb-4">
              Beli "{item?.name}"
            </p>

            {/* Section Bayar dengan Dompet */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                Bayar dengan Dompet
              </span>

              {wallets.length === 0 ? (
                <p className="text-sm text-red-500 font-semibold mt-1">
                  Belum ada dompet, tambahkan dulu di menu Wallet
                </p>
              ) : (
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
                          const WalletIcon = walletIconMap[selectedWallet.type] || Banknote;
                          return <WalletIcon className="h-3.5 w-3.5" />;
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
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--border-color)] flex justify-between items-center bg-[var(--card-bg)]">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Total</span>
              <span className="font-bold text-sm text-[var(--text-primary)]">
                {formatCurrency(item?.targetPrice ?? 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing || !selectedWallet}
              className={clsx(
                "bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5",
                (isProcessing || !selectedWallet) && "opacity-50 cursor-not-allowed"
              )}
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Konfirmasi Pembelian
            </button>
          </div>
        </div>
      </div>

      <WalletPicker
        isOpen={isWalletPickerOpen}
        onClose={() => setIsWalletPickerOpen(false)}
        onSelect={(wallet) => {
          setSelectedWallet(wallet);
        }}
      />
    </>,
    document.body
  );
});

export default BuyConfirmSheet;
