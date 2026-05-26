import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Custom hook untuk consume AuthContext
 * @returns {{ user: object|null, isLoading: boolean, login: Function, logout: Function, register: Function }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }

  return context;
};
