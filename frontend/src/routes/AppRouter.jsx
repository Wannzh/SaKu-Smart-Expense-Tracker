import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import { Loader2, UserCircle } from "lucide-react";

// ─── Lazy-loaded Pages ────────────────────────────────────────
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const IntroPage = lazy(() => import("../pages/IntroPage"));
const OnboardingPage = lazy(() => import("../pages/OnboardingPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const TransactionsPage = lazy(() => import("../pages/TransactionsPage"));
const ScanPage = lazy(() => import("../pages/ScanPage"));
const ChatPage = lazy(() => import("../pages/ChatPage"));
const WalletPage = lazy(() => import("../pages/WalletPage"));
const StatisticsPage = lazy(() => import("../pages/StatisticsPage"));

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

/**
 * Root redirect logic:
 * - Belum lihat intro → /intro
 * - Sudah intro, belum onboarding → /onboarding
 * - Sudah semua → Dashboard
 */
function RootRedirect() {
  const introSeen = localStorage.getItem("saku_intro_seen") === "true";
  const onboardingDone = localStorage.getItem("saku_onboarding_done") === "true";

  if (!introSeen) return <Navigate to="/intro" replace />;
  if (!onboardingDone) return <Navigate to="/onboarding" replace />;
  return (
    <ProtectedPage>
      <DashboardPage />
    </ProtectedPage>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Onboarding — protected but no AppLayout */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />

          {/* Root — redirect logic */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected routes (dengan sidebar) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedPage>
                <DashboardPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/wallets"
            element={
              <ProtectedPage>
                <WalletPage />
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
          <Route
            path="/statistics"
            element={
              <ProtectedPage>
                <StatisticsPage />
              </ProtectedPage>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedPage>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
                    <UserCircle className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">Profil Pengguna</h2>
                    <p className="text-sm text-[var(--text-tertiary)] mt-1">Halaman profil akan segera hadir! 🚀</p>
                  </div>
                </div>
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
