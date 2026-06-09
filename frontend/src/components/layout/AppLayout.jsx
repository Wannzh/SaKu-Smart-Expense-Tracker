import { memo } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const AppLayout = memo(function AppLayout({ children }) {
  const location = useLocation();
  const hideBottomNav = [
    "/budget",
    "/export",
    "/categories",
    "/about",
    "/bug-report",
    "/feedback"
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Bottom Nav — mobile only */}
      {!hideBottomNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}

      {/* Main content */}
      <main className={`lg:ml-64 min-h-screen p-4 lg:p-6 lg:pb-6 ${hideBottomNav ? "pb-4" : "pb-24"}`}>
        {children}
      </main>
    </div>
  );
});

export default AppLayout;
