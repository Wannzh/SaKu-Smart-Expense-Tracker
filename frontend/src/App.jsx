import { AuthProvider } from "./context/AuthContext";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            background: "#1F2937",
            color: "#F9FAFB",
            fontSize: "14px",
          },
        }}
      />
    </AuthProvider>
  );
}
