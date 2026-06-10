import { useState, useCallback } from "react";
import {
  getDebts as apiGetDebts,
  createDebt as apiCreateDebt,
  updateDebt as apiUpdateDebt,
  payDebt as apiPayDebt,
  deleteDebt as apiDeleteDebt,
} from "../api/debt.api";
import toast from "react-hot-toast";

export function useDebt() {
  const [debts, setDebts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getDebts = useCallback(async (params) => {
    setIsLoading(true);
    try {
      const res = await apiGetDebts(params);
      const list = res.data?.data?.debts ?? [];
      setDebts(list);
      return list;
    } catch (err) {
      console.error("[useDebt] getDebts error:", err);
      toast.error(err.response?.data?.message || "Gagal mengambil data utang & piutang");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createDebt = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await apiCreateDebt(data);
      toast.success(res.data.message || "Data utang/piutang berhasil dibuat");
      return res.data?.data?.debt;
    } catch (err) {
      console.error("[useDebt] createDebt error:", err);
      toast.error(err.response?.data?.message || "Gagal membuat data utang/piutang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDebt = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const res = await apiUpdateDebt(id, data);
      toast.success(res.data.message || "Data utang/piutang berhasil diperbarui");
      return res.data?.data?.debt;
    } catch (err) {
      console.error("[useDebt] updateDebt error:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui data utang/piutang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const payDebt = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const res = await apiPayDebt(id, data);
      toast.success(res.data.message || "Pelunasan berhasil dicatat");
      return res.data?.data?.debt;
    } catch (err) {
      console.error("[useDebt] payDebt error:", err);
      toast.error(err.response?.data?.message || "Gagal mencatat pelunasan");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDebt = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await apiDeleteDebt(id);
      toast.success(res.data.message || "Data utang/piutang berhasil dihapus");
      return res.data?.data?.debt;
    } catch (err) {
      console.error("[useDebt] deleteDebt error:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus data utang/piutang");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    debts,
    isLoading,
    getDebts,
    createDebt,
    updateDebt,
    payDebt,
    deleteDebt,
  };
}
