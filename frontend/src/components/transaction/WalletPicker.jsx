import { memo, useState, useEffect, useMemo, useRef } from "react";
import { X, Search, Banknote, Building2, Smartphone } from "lucide-react";
import clsx from "clsx";
import { useWallet } from "../../hooks/useWallet";
import { formatCurrency } from "../../utils/format";

const WalletPicker = memo(function WalletPicker({
  isOpen,
  onClose,
  onSelect,
  excludeWalletId = null,
  title = "Pilih Dompet",
}) {
  const { wallets, getWallets } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, cash, bank, ewallet
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      getWallets();
      setSearchQuery("");
      setTypeFilter("ALL");
    }
  }, [isOpen, getWallets]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const filteredWallets = useMemo(() => {
    return wallets.filter((wallet) => {
      // 1. Exclude matching wallet id
      if (excludeWalletId && wallet.id === excludeWalletId) {
        return false;
      }
      // 2. Filter by search query
      if (
        searchQuery &&
        !wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(wallet.bankName && wallet.bankName.toLowerCase().includes(searchQuery.toLowerCase()))
      ) {
        return false;
      }
      // 3. Filter by type
      if (typeFilter !== "ALL" && wallet.type !== typeFilter) {
        return false;
      }
      return true;
    });
  }, [wallets, excludeWalletId, searchQuery, typeFilter]);

  const getWalletIcon = (type) => {
    switch (type) {
      case "cash":
        return Banknote;
      case "bank":
        return Building2;
      case "ewallet":
        return Smartphone;
      default:
        return Banknote;
    }
  };

  const getWalletTypeLabel = (type) => {
    switch (type) {
      case "cash":
        return "Tunai";
      case "bank":
        return "Akun Bank";
      case "ewallet":
        return "E-Wallet";
      default:
        return "Dompet";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl overflow-hidden transition-all duration-300 transform translate-y-0 max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto flex-1 scrollbar-none">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Cari dompet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-color)] pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-all"
            />
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: "ALL", label: "Semua" },
              { key: "cash", label: "Tunai" },
              { key: "bank", label: "Akun Bank" },
              { key: "ewallet", label: "E-Wallet" },
            ].map((chip) => (
              <button
                key={chip.key}
                onClick={() => setTypeFilter(chip.key)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                  typeFilter === chip.key
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)]"
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Wallet list */}
          <div className="flex flex-col gap-2 mt-1">
            {filteredWallets.length > 0 ? (
              filteredWallets.map((wallet) => {
                const WalletIcon = getWalletIcon(wallet.type);
                const walletColor = wallet.color || "#6B7280";

                return (
                  <button
                    key={wallet.id}
                    onClick={() => {
                      onSelect(wallet);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border-color)] hover:border-indigo-500/50 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:scale-105"
                        style={{
                          backgroundColor: `${walletColor}18`,
                          color: walletColor,
                        }}
                      >
                        <WalletIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">
                          {wallet.name}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)] font-medium mt-0.5">
                          {getWalletTypeLabel(wallet.type)}
                          {wallet.bankName && ` · ${wallet.bankName}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-[var(--text-tertiary)] text-xs">
                Tidak ada dompet ditemukan
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-out both; }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
      `}</style>
    </div>
  );
});

export default WalletPicker;
