import { useState, useCallback } from "react";
import {
  getWallets as fetchWallets,
  getWallet as fetchWallet,
  createWallet as postWallet,
  updateWallet as putWallet,
  deleteWallet as removeWallet,
} from "../api/wallet.api";
import toast from "react-hot-toast";

export function useWallet() {
  const [wallets, setWallets] = useState([]);
  const [activeWallet, setActiveWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getWallets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchWallets();
      const list = res.data?.data?.wallets ?? [];
      setWallets(list);
      return list;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil wallet");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getWallet = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await fetchWallet(id);
      const wallet = res.data?.data?.wallet;
      setActiveWallet(wallet);
      return wallet;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil detail wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWallet = useCallback(async (data) => {
    const res = await postWallet(data);
    toast.success(res.data.message);
    return res.data?.data?.wallet;
  }, []);

  const updateWallet = useCallback(async (id, data) => {
    const res = await putWallet(id, data);
    toast.success(res.data.message);
    return res.data?.data?.wallet;
  }, []);

  const deleteWallet = useCallback(async (id) => {
    const res = await removeWallet(id);
    toast.success(res.data.message);
    return res.data?.data?.wallet;
  }, []);

  return {
    wallets,
    activeWallet,
    isLoading,
    getWallets,
    getWallet,
    createWallet,
    updateWallet,
    deleteWallet,
  };
}
