import { useState, useCallback } from "react";
import { scanReceipt as apiScan, confirmReceipt as apiConfirm } from "../api/receipt.api";
import toast from "react-hot-toast";

export function useReceipt() {
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const scanReceipt = useCallback(async (file) => {
    setIsScanning(true);
    setScanResult(null);
    try {
      const res = await apiScan(file);
      const result = res.data.data;
      setScanResult(result);
      toast.success("Struk berhasil di-scan!");
      return result;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal scan struk");
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const confirmReceipt = useCallback(async (data) => {
    setIsConfirming(true);
    try {
      const res = await apiConfirm(data);
      toast.success(res.data.message);
      return res.data.data.transaction;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal menyimpan transaksi");
      return null;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const resetScan = useCallback(() => {
    setScanResult(null);
  }, []);

  return {
    isScanning,
    isConfirming,
    scanResult,
    scanReceipt,
    confirmReceipt,
    resetScan,
  };
}
