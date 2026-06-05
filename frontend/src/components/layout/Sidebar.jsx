import { memo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ThemeToggle from "../common/ThemeToggle";
import {
  LayoutDashboard,
  ArrowLeftRight,
  ScanLine,
  MessageSquare,
  LogOut,
  Wallet,
  CreditCard,
  BarChart2,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/statistics", icon: BarChart2, label: "Statistik" },
  { to: "/wallets", icon: CreditCard, label: "Wallet" },
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-200/40">
          <Wallet className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-indigo-600">
            SaKu
          </h1>
          <p className="text-[11px] text-[var(--text-tertiary)] -mt-0.5">Smart Expense Tracker</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-[var(--border-color)]" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200/40"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-indigo-600"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-[var(--border-color)]" />

      {/* Theme + User + Logout */}
      <div className="p-4">
        {/* Theme section */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] mb-2 px-2">
          Tampilan
        </p>
        <ThemeToggle />

        {/* Divider */}
        <div className="my-3 h-px bg-[var(--border-color)]" />

        {/* User info */}
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-[var(--text-tertiary)]">
              {user?.email || ""}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
});

export default Sidebar;
