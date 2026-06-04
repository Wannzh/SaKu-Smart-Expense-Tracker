import { memo } from "react";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const AppLayout = memo(function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Bottom Nav — mobile only */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 min-h-screen p-4 lg:p-6 pb-24 lg:pb-6">
        {children}
      </main>
    </div>
  );
});

export default AppLayout;
