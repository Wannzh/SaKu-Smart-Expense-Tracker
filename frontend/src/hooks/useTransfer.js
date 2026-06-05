import { useState, useCallback } from "react";
import {
  getTransfers as fetchTransfers,
  createTransfer as postTransfer,
  deleteTransfer as removeTransfer,
} from "../api/transfer.api";
import toast from "react-hot-toast";

export function useTransfer() {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTransfers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchTransfers();
      const list = res.data?.data?.transfers ?? [];
      setTransfers(list);
      return list;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil daftar transfer");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTransfer = useCallback(async (data) => {
    try {
      const res = await postTransfer(data);
      toast.success(res.data.message || "Transfer berhasil dibuat");
      return res.data?.data?.transfer;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat transfer");
      throw err;
    }
  }, []);

  const deleteTransfer = useCallback(async (id) => {
    try {
      const res = await removeTransfer(id);
      toast.success(res.data.message || "Transfer berhasil dihapus");
      return res.data?.data?.transfer;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menghapus transfer");
      throw err;
    }
  }, []);

  return {
    transfers,
    isLoading,
    getTransfers,
    createTransfer,
    deleteTransfer,
  };
}
