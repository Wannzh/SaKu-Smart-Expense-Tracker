import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// ─── Lazy-loaded Pages ────────────────────────────────────────
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const TransactionsPage = lazy(() => import("../pages/TransactionsPage"));
const ScanPage = lazy(() => import("../pages/ScanPage"));
const ChatPage = lazy(() => import("../pages/ChatPage"));

/**
 * Fallback loading untuk Suspense
 */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F9FAFB]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}

/**
 * Helper — bungkus page dalam ProtectedRoute + AppLayout
 */
function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes (tanpa sidebar) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes (dengan sidebar) */}
          <Route
            path="/"
            element={
              <ProtectedPage>
                <DashboardPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedPage>
                <TransactionsPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedPage>
                <ScanPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedPage>
                <ChatPage />
              </ProtectedPage>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
