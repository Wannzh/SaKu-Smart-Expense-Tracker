import { memo, useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTransaction } from "../../hooks/useTransaction";
import { useTransfer } from "../../hooks/useTransfer";
import TransactionForm from "../transaction/TransactionForm";
import Modal from "../common/Modal";
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  BarChart2,
  UserCircle,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Beranda" },
  { to: "/statistics", icon: BarChart2, label: "Statistik" },
  null, // center placeholder
  { to: "/wallets", icon: CreditCard, label: "Dompet" },
  { to: "/profile", icon: UserCircle, label: "Profil" },
];

const BottomNav = memo(function BottomNav() {
  const location = useLocation();
  const { createTransaction } = useTransaction();
  const { createTransfer } = useTransfer();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleQuickAdd = useCallback(async (data) => {
    if (data.type === "TRANSFER") {
      await createTransfer({
        fromWalletId: data.fromWalletId,
        toWalletId: data.toWalletId,
        amount: data.amount,
        description: data.description,
        date: data.date,
      });
    } else {
      await createTransaction(data);
    }
    setIsQuickAddOpen(false);
    window.dispatchEvent(new CustomEvent("refresh-data"));
  }, [createTransaction, createTransfer]);

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

      {/* Quick Add Form */}
      <TransactionForm
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSubmit={handleQuickAdd}
        onCancel={() => setIsQuickAddOpen(false)}
      />
    </>
  );
});

export default BottomNav;
