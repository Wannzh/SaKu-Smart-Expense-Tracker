import { useState, useCallback } from "react";
import {
  getWishlists as apiGetWishlists,
  createWishlist as apiCreateWishlist,
  updateWishlist as apiUpdateWishlist,
  addWishlistSavings as apiAddWishlistSavings,
  deleteWishlist as apiDeleteWishlist,
} from "../api/wishlist.api";
import toast from "react-hot-toast";

export function useWishlist() {
  const [wishlists, setWishlists] = useState([]);
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    achieved: 0,
    totalTargetPrice: 0,
    totalSaved: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getWishlists = useCallback(async (params) => {
    setIsLoading(true);
    try {
      const res = await apiGetWishlists(params);
      const data = res.data?.data;
      const list = data?.wishlists ?? [];
      const sum = data?.summary ?? {
        total: 0,
        active: 0,
        achieved: 0,
        totalTargetPrice: 0,
        totalSaved: 0,
      };
      setWishlists(list);
      setSummary(sum);
      return { wishlists: list, summary: sum };
    } catch (err) {
      console.error("[useWishlist] getWishlists error:", err);
      toast.error(err.response?.data?.message || "Gagal mengambil daftar keinginan");
      return { wishlists: [], summary };
    } finally {
      setIsLoading(false);
    }
  }, [summary]);

  const createWishlist = useCallback(async (data) => {
    setIsLoading(true);
    try {
      const res = await apiCreateWishlist(data);
      toast.success(res.data.message || "Keinginan berhasil ditambahkan");
      return res.data?.data?.wishlist;
    } catch (err) {
      console.error("[useWishlist] createWishlist error:", err);
      toast.error(err.response?.data?.message || "Gagal menambahkan keinginan");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWishlist = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      const res = await apiUpdateWishlist(id, data);
      toast.success(res.data.message || "Keinginan berhasil diperbarui");
      return res.data?.data?.wishlist;
    } catch (err) {
      console.error("[useWishlist] updateWishlist error:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui keinginan");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addWishlistSavings = useCallback(async (id, amount, walletId) => {
    setIsLoading(true);
    try {
      const res = await apiAddWishlistSavings(id, amount, walletId);
      toast.success(res.data.message || "Tabungan berhasil ditambahkan");
      return res.data?.data?.wishlist;
    } catch (err) {
      console.error("[useWishlist] addWishlistSavings error:", err);
      toast.error(err.response?.data?.message || "Gagal menambahkan tabungan");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteWishlist = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await apiDeleteWishlist(id);
      toast.success(res.data.message || "Keinginan berhasil dihapus");
      return res.data?.data?.wishlist;
    } catch (err) {
      console.error("[useWishlist] deleteWishlist error:", err);
      toast.error(err.response?.data?.message || "Gagal menghapus keinginan");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    wishlists,
    summary,
    isLoading,
    getWishlists,
    createWishlist,
    updateWishlist,
    addWishlistSavings,
    deleteWishlist,
  };
}
