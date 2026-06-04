import { memo, useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTransaction } from "../../hooks/useTransaction";
import TransactionForm from "../transaction/TransactionForm";
import Modal from "../common/Modal";
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  ArrowLeftRight,
  MessageSquare,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Beranda" },
  { to: "/wallets", icon: CreditCard, label: "Wallet" },
  null, // center placeholder
  { to: "/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { to: "/chat", icon: MessageSquare, label: "Chat AI" },
];

const BottomNav = memo(function BottomNav() {
  const location = useLocation();
  const { createTransaction, getTransactions } = useTransaction();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleQuickAdd = useCallback(async (data) => {
    await createTransaction(data);
    setIsQuickAddOpen(false);
    getTransactions();
  }, [createTransaction, getTransactions]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--sidebar-bg)] border-t border-[var(--border-color)]">
        {/* Safe area padding for notch devices */}
        <div className="flex items-end justify-around px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {navItems.map((item, i) => {
            // Center button (FAB)
            if (item === null) {
              return (
                <button
                  key="center-fab"
                  onClick={() => setIsQuickAddOpen(true)}
                  className="flex h-14 w-14 -translate-y-4 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/50 hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="h-7 w-7" />
                </button>
              );
            }

            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-[3.5rem]"
              >
                <Icon
                  className={clsx(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-indigo-600" : "text-[var(--text-tertiary)]"
                  )}
                />
                <span
                  className={clsx(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-indigo-600" : "text-[var(--text-tertiary)]"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Quick Add Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Tambah Transaksi"
      >
        <TransactionForm
          onSubmit={handleQuickAdd}
          onCancel={() => setIsQuickAddOpen(false)}
        />
      </Modal>
    </>
  );
});

export default BottomNav;
