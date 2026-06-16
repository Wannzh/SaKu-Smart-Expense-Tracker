import { useState, useCallback } from "react";

/**
 * Hook untuk input nominal uang dengan auto-format ribuan.
 * 
 * Format tampilan : "1.000.000" (pakai titik, Indonesian)
 * Nilai asli      : 1000000 (number, untuk dikirim ke backend)
 * 
 * Penggunaan:
 * const { displayValue, numericValue, handleChange, reset } 
 *   = useMoneyInput(0);
 */
export function useMoneyInput(initialValue = 0) {
  const format = (num) => {
    if (!num && num !== 0) return "";
    // Hilangkan semua non-digit, lalu format ribuan pakai titik
    return Number(num)
      .toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
  };

  const [displayValue, setDisplayValue] = useState(
    initialValue ? format(initialValue) : ""
  );
  const [numericValue, setNumericValue] = useState(
    initialValue || 0
  );

  const handleChange = useCallback((e) => {
    const raw = e.target.value;

    // Hapus semua karakter selain angka
    const digitsOnly = raw.replace(/\D/g, "");

    // Cegah angka 0 di depan (kecuali kosong)
    if (digitsOnly.length > 1 && digitsOnly.startsWith("0")) {
      return;
    }

    const numeric = digitsOnly === "" ? 0 : parseInt(digitsOnly, 10);

    // Cegah angka terlalu besar (max 999 Miliar)
    if (numeric > 999_000_000_000) return;

    setNumericValue(numeric);
    setDisplayValue(digitsOnly === "" ? "" : format(numeric));
  }, []);

  // Untuk set value dari luar (misal saat edit data)
  const setValue = useCallback((num) => {
    const numeric = Number(num) || 0;
    setNumericValue(numeric);
    setDisplayValue(numeric ? format(numeric) : "");
  }, []);

  // Reset ke kosong
  const reset = useCallback(() => {
    setNumericValue(0);
    setDisplayValue("");
  }, []);

  return {
    displayValue,   // string "1.000.000" → pakai sebagai value input
    numericValue,   // number 1000000 → kirim ke backend/API
    handleChange,   // onChange handler untuk input
    setValue,       // set programmatic (untuk mode edit)
    reset,          // reset ke kosong
  };
}
