import { useState, useCallback } from "react";
import {
  getBudgets as fetchBudgets,
  upsertBudget as postBudget,
  deleteBudget as removeBudget,
} from "../api/budget.api";
import toast from "react-hot-toast";

export function useBudget() {
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getBudgets = useCallback(async (month, year) => {
    setIsLoading(true);
    try {
      const res = await fetchBudgets(month, year);
      const list = res.data?.data?.budgets ?? [];
      setBudgets(list);
      return list;
    } catch (err) {
      console.error("[useBudget] getBudgets error:", err);
      toast.error(err.response?.data?.message || "Gagal mengambil anggaran");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const upsertBudget = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await postBudget(data);
      toast.success(res.data.message || "Anggaran berhasil disimpan");
      return res.data?.data?.budget;
    } catch (err) {
      console.error("[useBudget] upsertBudget error:", err);
      toast.error(err.response?.data?.message || "Gagal menyimpan anggaran");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteBudget = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await removeBudget(id);
      toast.success(res.data.message || "Anggaran berhasil dihapus");
      return res.data?.data?.budget;
    } catch (err) {
      console.error("[useBudget] deleteBudget error:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus anggaran");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    budgets,
    isLoading,
    getBudgets,
    upsertBudget,
    deleteBudget,
  };
}
