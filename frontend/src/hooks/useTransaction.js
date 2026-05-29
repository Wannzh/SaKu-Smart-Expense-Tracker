import { useState, useCallback } from "react";
import {
  getTransactions as fetchTransactions,
  getTransactionSummary,
  createTransaction as postTransaction,
  updateTransaction as putTransaction,
  deleteTransaction as removeTransaction,
} from "../api/transaction.api";
import toast from "react-hot-toast";

export function useTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getTransactions = useCallback(async (filters = {}) => {
    setIsLoading(true);
    try {
      const res = await fetchTransactions(filters);
      const list = res.data?.data?.transactions ?? [];
      setTransactions(list);
      return list;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil transaksi");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSummary = useCallback(async () => {
    try {
      const res = await getTransactionSummary();
      // Akses defensif — handle berbagai kemungkinan response shape
      const raw = res.data?.data?.summary ?? res.data?.data ?? res.data;
      const parsed = {
        totalIncome: Number(raw?.totalIncome ?? 0),
        totalExpense: Number(raw?.totalExpense ?? 0),
        balance: Number(raw?.balance ?? 0),
      };
      setSummary(parsed);
      return parsed;
    } catch (err) {
      console.error("[useTransaction] getSummary error:", err);
      toast.error(err.response?.data?.message || "Gagal mengambil summary");
      return null;
    }
  }, []);

  const createTransaction = useCallback(async (data) => {
    const res = await postTransaction(data);
    toast.success(res.data.message);
    return res.data?.data?.transaction;
  }, []);

  const updateTransaction = useCallback(async (id, data) => {
    const res = await putTransaction(id, data);
    toast.success(res.data.message);
    return res.data?.data?.transaction;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const res = await removeTransaction(id);
    toast.success(res.data.message);
    return res.data?.data?.transaction;
  }, []);

  return {
    transactions,
    summary,
    isLoading,
    getTransactions,
    getSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
