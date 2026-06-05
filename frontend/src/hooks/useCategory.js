import { useState, useCallback, useMemo } from "react";
import { getCategories as fetchCategories } from "../api/category.api";
import toast from "react-hot-toast";

export function useCategory() {
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCategories = useCallback(async (type) => {
    setIsLoading(true);
    try {
      const res = await fetchCategories(type);
      const fetched = res.data.data.categories || [];
      if (type === "EXPENSE") {
        setExpenseCategories(fetched);
      } else if (type === "INCOME") {
        setIncomeCategories(fetched);
      } else {
        const expenses = fetched.filter((c) => c.type === "EXPENSE");
        const incomes = fetched.filter((c) => c.type === "INCOME");
        setExpenseCategories(expenses);
        setIncomeCategories(incomes);
      }
      return fetched;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil kategori");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const categories = useMemo(() => {
    return [...expenseCategories, ...incomeCategories];
  }, [expenseCategories, incomeCategories]);

  return {
    categories,
    expenseCategories,
    incomeCategories,
    isLoading,
    getCategories,
  };
}
