import { memo, useState, useCallback } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTransaction } from "../../hooks/useTransaction";
import { useTransfer } from "../../hooks/useTransfer";
import TransactionForm from "../transaction/TransactionForm";
import {
  LayoutDashboard,
  BarChart2,
  Plus,
  Wallet,
  UserCircle,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/statistics", icon: BarChart2, label: "Stats" },
  null, // center FAB placeholder
  { to: "/wallets", icon: Wallet, label: "Wallet" },
  { to: "/profile", icon: UserCircle, label: "Profile" },
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
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 backdrop-blur-xl bg-[var(--card-bg)]/80 border-t border-[var(--border-color)]/30 flex justify-around items-center px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {navItems.map((item, i) => {
          if (item === null) {
            return (
              <div key="center-fab-container" className="relative -mt-10">
                <button
                  onClick={() => setIsQuickAddOpen(true)}
                  className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/20 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                >
                  <Plus className="h-8 w-8" />
                </button>
              </div>
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
              className="flex flex-col items-center justify-center"
            >
              <Icon
                className={clsx(
                  "h-6 w-6 transition-colors",
                  isActive ? "text-indigo-600" : "text-[var(--text-secondary)]"
                )}
              />
              <span
                className={clsx(
                  "text-[10px] font-semibold mt-1 transition-colors",
                  isActive ? "text-indigo-600" : "text-[var(--text-secondary)]"
                )}
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
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
