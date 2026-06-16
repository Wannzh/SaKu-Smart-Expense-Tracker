import { createContext, useState, useEffect, useCallback } from "react";
import { getMe, loginUser, logoutUser, registerUser, googleLogin } from "../api/auth.api";
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

  const loginWithGoogle = useCallback(async (credentialResponse) => {
    setIsLoading(true);
    try {
      const res = await googleLogin(credentialResponse.credential);
      const user = res.data?.data?.user;
      setUser(user);
      toast.success(`Selamat datang, ${user.name}! 👋`);
      return res.data;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login Google gagal"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    toast.success("Logout berhasil");
  }, []);

  const value = { user, setUser, isLoading, login, logout, register, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
