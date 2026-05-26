import { useState, useCallback } from "react";
import { getCategories as fetchCategories } from "../api/category.api";
import toast from "react-hot-toast";

export function useCategory() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchCategories();
      setCategories(res.data.data.categories);
      return res.data.data.categories;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil kategori");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { categories, isLoading, getCategories };
}
