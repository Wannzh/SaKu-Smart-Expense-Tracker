import { memo } from "react";
import Sidebar from "./Sidebar";

const AppLayout = memo(function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="ml-64 min-h-screen p-6">
        {children}
      </main>
    </div>
  );
});

export default AppLayout;
