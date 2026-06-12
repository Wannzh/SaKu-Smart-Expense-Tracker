import { useState, useCallback } from "react";
import {
  getWishlists as apiGetWishlists,
  createWishlist as apiCreateWishlist,
  updateWishlist as apiUpdateWishlist,
  markWishlistAchieved as apiMarkWishlistAchieved,
  deleteWishlist as apiDeleteWishlist,
} from "../api/wishlist.api";
import toast from "react-hot-toast";

export function useWishlist() {
  const [wishlists, setWishlists] = useState([]);
  const [summary, setSummary] = useState({
    totalItems: 0,
    activeCount: 0,
    achievedCount: 0,
    totalValue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const getWishlists = useCallback(async (params) => {
    setIsLoading(true);
    try {
      const res = await apiGetWishlists(params);
      const data = res.data?.data;
      const list = data?.wishlists ?? [];
      const sum = data?.summary ?? {
        totalItems: 0,
        activeCount: 0,
        achievedCount: 0,
        totalValue: 0,
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

  const markWishlistAchieved = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await apiMarkWishlistAchieved(id);
      return res.data?.data?.wishlist;
    } catch (err) {
      console.error("[useWishlist] markWishlistAchieved error:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui status keinginan");
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
    markWishlistAchieved,
    deleteWishlist,
  };
}
