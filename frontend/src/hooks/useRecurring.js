import { useState, useCallback, useEffect } from "react";
import {
  getRecurrings as apiGetRecurrings,
  createRecurring as apiCreateRecurring,
  updateRecurring as apiUpdateRecurring,
  toggleRecurringStatus as apiToggleRecurringStatus,
  executeRecurring as apiExecuteRecurring,
  deleteRecurring as apiDeleteRecurring,
} from "../api/recurring.api";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export function useRecurring() {
  const [recurrings, setRecurrings] = useState([]);
  const [monthlyCommitment, setMonthlyCommitment] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState(() => dayjs());

  const prevMonth = useCallback(() => {
    setActiveMonth((prev) => prev.subtract(1, "month"));
  }, []);

  const nextMonth = useCallback(() => {
    setActiveMonth((prev) => prev.add(1, "month"));
  }, []);

  const fetchRecurrings = useCallback(async () => {
    setIsLoading(true);
    try {
      const month = activeMonth.month() + 1; // 1-indexed for backend
      const year = activeMonth.year();
      const res = await apiGetRecurrings({ month, year });
      const data = res.data?.data;
      setRecurrings(data?.recurrings ?? []);
      setMonthlyCommitment(data?.monthlyCommitment ?? 0);
      setActiveCount(data?.activeCount ?? 0);
    } catch (err) {
      console.error("[useRecurring] fetchRecurrings error:", err);
      toast.error(err.response?.data?.message || "Gagal mengambil daftar transaksi berulang");
    } finally {
      setIsLoading(false);
    }
  }, [activeMonth]);

  useEffect(() => {
    fetchRecurrings();
  }, [fetchRecurrings]);

  const createRecurring = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const res = await apiCreateRecurring(formData);
      toast.success(res.data.message || "Transaksi berulang berhasil ditambahkan");
      fetchRecurrings();
      return res.data?.data?.recurring;
    } catch (err) {
      console.error("[useRecurring] createRecurring error:", err);
      toast.error(err.response?.data?.message || "Gagal menambahkan transaksi berulang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecurrings]);

  const updateRecurring = useCallback(async (id, formData) => {
    setIsLoading(true);
    try {
      const res = await apiUpdateRecurring(id, formData);
      toast.success(res.data.message || "Transaksi berulang berhasil diperbarui");
      fetchRecurrings();
      return res.data?.data?.recurring;
    } catch (err) {
      console.error("[useRecurring] updateRecurring error:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui transaksi berulang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecurrings]);

  const toggleStatus = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await apiToggleRecurringStatus(id);
      toast.success(res.data.message || "Status transaksi berulang berhasil diubah");
      fetchRecurrings();
      return res.data?.data?.recurring;
    } catch (err) {
      console.error("[useRecurring] toggleStatus error:", err);
      toast.error(err.response?.data?.message || "Gagal mengubah status transaksi berulang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecurrings]);

  const executeRecurring = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await apiExecuteRecurring(id);
      toast.success(res.data.message || "Transaksi berulang berhasil dijalankan");
      fetchRecurrings();
      // Dispatch a global event to refresh wallet balance and transactions list
      window.dispatchEvent(new CustomEvent("refresh-data"));
      return res.data?.data?.recurring;
    } catch (err) {
      console.error("[useRecurring] executeRecurring error:", err);
      toast.error(err.response?.data?.message || "Gagal menjalankan transaksi berulang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecurrings]);

  const deleteRecurring = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await apiDeleteRecurring(id);
      toast.success(res.data.message || "Transaksi berulang berhasil dihapus");
      fetchRecurrings();
      return res.data?.data?.recurring;
    } catch (err) {
      console.error("[useRecurring] deleteRecurring error:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus transaksi berulang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecurrings]);

  return {
    recurrings,
    monthlyCommitment,
    activeCount,
    isLoading,
    activeMonth,
    prevMonth,
    nextMonth,
    fetchRecurrings,
    createRecurring,
    updateRecurring,
    toggleStatus,
    executeRecurring,
    deleteRecurring,
  };
}
