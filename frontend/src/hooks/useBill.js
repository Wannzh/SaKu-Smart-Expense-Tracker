import { useState, useCallback, useEffect, useMemo } from "react";
import {
  getBills as apiGetBills,
  createBill as apiCreateBill,
  updateBill as apiUpdateBill,
  payBill as apiPayBill,
  unpayBill as apiUnpayBill,
  deleteBill as apiDeleteBill,
  generateFromRecurring as apiGenerateFromRecurring,
} from "../api/bill.api";
import toast from "react-hot-toast";
import dayjs from "dayjs";

export function useBill() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({
    totalUnpaid: 0,
    totalPaid: 0,
    countUnpaid: 0,
    countPaid: 0,
    countOverdue: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState(() => dayjs());
  const [activeFilter, setActiveFilter] = useState("ALL");

  const prevMonth = useCallback(() => {
    setActiveMonth((prev) => prev.subtract(1, "month"));
  }, []);

  const nextMonth = useCallback(() => {
    setActiveMonth((prev) => prev.add(1, "month"));
  }, []);

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    try {
      const month = activeMonth.month() + 1; // 1-indexed for backend
      const year = activeMonth.year();
      const res = await apiGetBills({
        month,
        year,
        ...(activeFilter !== "ALL" && { 
          status: activeFilter 
        }),
      });
      const data = res.data?.data;
      
      const fetchedBills = data?.bills ?? [];
      const fetchedSummary = data?.summary ?? {
        totalUnpaid: 0,
        totalPaid: 0,
        countUnpaid: 0,
        countPaid: 0,
        countOverdue: 0,
      };

      // Re-calculate OVERDUE di frontend
      // karena status di DB masih UNPAID
      const today = dayjs();
      const processedBills = fetchedBills.map(bill => {
        if (bill.status === "UNPAID" && 
            dayjs(bill.dueDate).isBefore(today, "day")) {
          return { ...bill, status: "OVERDUE" };
        }
        return bill;
      });

      // Setelah processedBills dibuat, recalculate summary
      const recalculatedSummary = {
        ...fetchedSummary,
        countOverdue: processedBills.filter(
          b => b.status === "OVERDUE"
        ).length,
        countUnpaid: processedBills.filter(
          b => b.status === "UNPAID" || b.status === "OVERDUE"
        ).length,
        totalUnpaid: processedBills
          .filter(b => b.status === "UNPAID" || 
                       b.status === "OVERDUE")
          .reduce((sum, b) => sum + Number(b.amount), 0),
      };

      setBills(processedBills);
      setSummary(recalculatedSummary);
    } catch (err) {
      console.error("[useBill] fetchBills error:", err);
      toast.error("Gagal memuat tagihan");
    } finally {
      setIsLoading(false);
    }
  }, [activeMonth, activeFilter]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // Computed: filtered bills based on activeFilter
  const filteredBills = useMemo(() => {
    if (activeFilter === "ALL") return bills;
    return bills.filter((b) => b.status === activeFilter);
  }, [bills, activeFilter]);

  // Computed: grouped bills
  const groupedBills = useMemo(() => {
    const today = dayjs().startOf("day");
    return {
      overdue: bills.filter((b) => b.status === "OVERDUE"),
      upcoming: bills.filter(
        (b) =>
          b.status === "UNPAID" &&
          dayjs(b.dueDate).diff(today, "day") <= 7
      ),
      thisMonth: bills.filter(
        (b) =>
          b.status === "UNPAID" &&
          dayjs(b.dueDate).diff(today, "day") > 7
      ),
      paid: bills.filter((b) => b.status === "PAID"),
    };
  }, [bills]);

  const createBill = useCallback(
    async (data) => {
      setIsLoading(true);
      try {
        const res = await apiCreateBill(data);
        toast.success(res.data.message || "Tagihan berhasil ditambahkan");
        fetchBills();
        return res.data?.data?.bill;
      } catch (err) {
        console.error("[useBill] createBill error:", err);
        toast.error(err.response?.data?.message || "Gagal menambahkan tagihan");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBills]
  );

  const updateBill = useCallback(
    async (id, data) => {
      setIsLoading(true);
      try {
        const res = await apiUpdateBill(id, data);
        toast.success(res.data.message || "Tagihan berhasil diperbarui");
        fetchBills();
        return res.data?.data?.bill;
      } catch (err) {
        console.error("[useBill] updateBill error:", err);
        toast.error(err.response?.data?.message || "Gagal memperbarui tagihan");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBills]
  );

  const payBill = useCallback(
    async (id, walletId, paidAt) => {
      setIsLoading(true);
      try {
        const res = await apiPayBill(id, { walletId, paidAt });
        toast.success("Tagihan berhasil dilunasi! ✓");
        fetchBills();
        // Dispatch global event to update wallets, transactions, dashboard etc.
        window.dispatchEvent(new CustomEvent("refresh-data"));
        return res.data?.data?.bill;
      } catch (err) {
        console.error("[useBill] payBill error:", err);
        toast.error(err.response?.data?.message || "Gagal melunasi tagihan");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBills]
  );

  const unpayBill = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        const res = await apiUnpayBill(id);
        toast.success(res.data.message || "Pembayaran tagihan berhasil dibatalkan");
        fetchBills();
        // Dispatch global event to update wallets, transactions, dashboard etc.
        window.dispatchEvent(new CustomEvent("refresh-data"));
        return res.data?.data?.bill;
      } catch (err) {
        console.error("[useBill] unpayBill error:", err);
        toast.error(
          err.response?.data?.message || "Gagal membatalkan pembayaran tagihan"
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBills]
  );

  const deleteBill = useCallback(
    async (id) => {
      setIsLoading(true);
      try {
        const res = await apiDeleteBill(id);
        toast.success(res.data.message || "Tagihan berhasil dihapus");
        fetchBills();
        return res.data?.data?.bill;
      } catch (err) {
        console.error("[useBill] deleteBill error:", err);
        toast.error(err.response?.data?.message || "Gagal menghapus tagihan");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchBills]
  );

  const generateFromRecurring = useCallback(async (toastId) => {
    setIsLoading(true);
    const month = activeMonth.month() + 1;
    const year = activeMonth.year();
    try {
      const res = await apiGenerateFromRecurring(month, year);
      const count = res.data?.data?.count ?? 0;
      if (toastId) {
        toast.success(`${count} tagihan berhasil dibuat`, { id: toastId });
      } else {
        toast.success(`${count} tagihan berhasil dibuat`);
      }
      fetchBills();
      return count;
    } catch (err) {
      console.error("[useBill] generateFromRecurring error:", err);
      const errMsg =
        err.response?.data?.message || "Gagal sinkronisasi dari transaksi berulang";
      if (toastId) {
        toast.error(errMsg, { id: toastId });
      } else {
        toast.error(errMsg);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [activeMonth, fetchBills]);

  return {
    bills,
    summary,
    isLoading,
    activeMonth,
    activeFilter,
    filteredBills,
    groupedBills,
    setActiveFilter,
    prevMonth,
    nextMonth,
    fetchBills,
    createBill,
    updateBill,
    payBill,
    unpayBill,
    deleteBill,
    generateFromRecurring,
  };
}
