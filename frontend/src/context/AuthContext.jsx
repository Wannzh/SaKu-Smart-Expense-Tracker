import { createContext, useState, useEffect, useCallback } from "react";
import { getMe, loginUser, logoutUser, registerUser } from "../api/auth.api";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cek session saat mount — GET /auth/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await getMe();
        setUser(res.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginUser({ email, password });
    setUser(res.data.data.user);
    toast.success(res.data.message);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    setUser(res.data.data.user);
    toast.success(res.data.message);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    toast.success("Logout berhasil");
  }, []);

  const value = { user, isLoading, login, logout, register };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
