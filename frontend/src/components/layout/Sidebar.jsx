import { memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import {
  LayoutDashboard,
  BarChart2,
  Wallet,
  ArrowLeftRight,
  Star,
  RefreshCw,
  ScanLine,
  MessageSquare,
  CreditCard,
  UserCircle,
  LogOut,
  ReceiptText,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/statistics", icon: BarChart2, label: "Statistik" },
  { to: "/wallets", icon: Wallet, label: "Wallet" },
  { to: "/transactions", icon: ArrowLeftRight, label: "Transaksi" },
  { to: "/scan", icon: ScanLine, label: "Scan Struk" },
  { to: "/chat", icon: MessageSquare, label: "Chat AI" },
];

const Sidebar = memo(function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] shadow-sm flex flex-col py-4 z-50">
      {/* Brand Header */}
      <div className="px-6 py-4 flex items-center gap-3">
        <img
          src="/saku.svg"
          className="w-10 h-10 object-contain dark:bg-white dark:rounded-lg dark:p-1"
          alt="SaKu Logo"
        />
        <div>
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-200 leading-none">
            SaKu
          </h1>
          <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest mt-1">
            Smart Expense Tracker
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex-1 px-4 mt-6 space-y-1 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 font-medium text-sm",
                    isActive
                      ? "text-indigo-600 dark:text-indigo-200 font-bold border-r-2 border-indigo-600 bg-[var(--bg-tertiary)]"
                      : "text-[var(--text-secondary)] hover:text-indigo-600 hover:bg-[var(--bg-tertiary)]"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* CTA - Theme Toggle placed here replacing the manual transaction button */}
        <div className="pt-6 px-2">
          <ThemeToggle />
        </div>
      </nav>

      {/* Footer Tabs */}
      <div className="px-4 py-4 border-t border-[var(--border-color)]/30 space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 font-medium text-sm",
              isActive
                ? "text-indigo-600 dark:text-indigo-200 font-bold border-r-2 border-indigo-600 bg-[var(--bg-tertiary)]"
                : "text-[var(--text-secondary)] hover:text-indigo-600 hover:bg-[var(--bg-tertiary)]"
            )
          }
        >
          <UserCircle className="h-5 w-5 shrink-0" />
          <span>Profile</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors duration-200 font-medium text-sm cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
