import { memo, useState, useEffect, useCallback, useMemo, forwardRef, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTransaction } from "../hooks/useTransaction";
import { useTransfer } from "../hooks/useTransfer";
import { useCategory } from "../hooks/useCategory";
import { useWallet } from "../hooks/useWallet";
import WalletPicker from "../components/transaction/WalletPicker";
import { formatCurrency, cleanDescription } from "../utils/format";
import {
  ChevronLeft,
  Calendar,
  ChevronDown,
  Loader2,
  Tag,
  Wallet as WalletIcon,
  Copy,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PieChart, Pie, Cell, Legend } from "recharts";
import XLSX from "xlsx-js-style";

dayjs.locale("id");

// ─── Component Tersembunyi untuk Preview Ekspor PDF ──────────────────
const ExportPreview = memo(forwardRef(function ExportPreview({
  items,
  totalIncome,
  totalExpense,
  netBalance,
  expenseBreakdown,
  incomeBreakdown,
  dateRange,
}, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "794px",
        backgroundColor: "#ffffff",
        color: "#0f172a",
        zIndex: -1,
        pointerEvents: "none",
        visibility: "hidden",
      }}
      aria-hidden="true"
      className="p-10 font-sans space-y-6"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start pb-5" style={{ borderBottom: "1px solid #e2e8f0" }}>
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: "#4f46e5" }}>SaKu</h1>
          <p className="text-xs font-semibold mt-0.5" style={{ color: "#64748b" }}>Smart Expense Tracker</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold" style={{ color: "#1e293b" }}>Financial Report</h2>
          <p className="text-xs font-semibold mt-1" style={{ color: "#64748b" }}>Periode: {dateRange}</p>
        </div>
      </div>

      {/* BALANCE OVERVIEW */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "#94a3b8" }}>Balance Overview</h3>
        <div className="grid grid-cols-3 gap-4 rounded-xl p-4" style={{ backgroundColor: "#f8fafc", border: "1px solid #f1f5f9" }}>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Pemasukan</span>
            <span className="text-base font-extrabold mt-1" style={{ color: "#059669" }}>{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex flex-col pl-4" style={{ borderLeft: "1px solid #e2e8f0" }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Pengeluaran</span>
            <span className="text-base font-extrabold mt-1" style={{ color: "#ef4444" }}>{formatCurrency(totalExpense)}</span>
          </div>
          <div className="flex flex-col pl-4" style={{ borderLeft: "1px solid #e2e8f0" }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8" }}>Saldo Bersih</span>
            <span className="text-base font-extrabold mt-1" style={{ color: netBalance >= 0 ? "#4f46e5" : "#ef4444" }}>
              {netBalance < 0 ? "-" : ""}{formatCurrency(Math.abs(netBalance))}
            </span>
          </div>
        </div>
      </div>

      {/* BREAKDOWN SECTIONS */}
      <div className="grid grid-cols-2 gap-6">
        {/* EXPENSE BREAKDOWN */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "#94a3b8" }}>Expense Breakdown</h3>
          <div className="rounded-xl p-4 space-y-2.5 min-h-[120px]" style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            {expenseBreakdown.length > 0 ? (
              <>
                <div style={{ width: "100%", height: 200 }} className="flex justify-center">
                  <PieChart width={350} height={200}>
                    <Pie
                      data={expenseBreakdown}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      isAnimationActive={false}
                    >
                      {expenseBreakdown.map((entry, index) => {
                        const COLORS = ["#ef4444","#f97316","#eab308",
                                        "#22c55e","#06b6d4","#8b5cf6",
                                        "#ec4899","#64748b","#0ea5e9","#10b981"];
                        return <Cell key={index} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Legend 
                      formatter={(value) => (
                        <span style={{ fontSize: "10px", color: "#334155" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </div>
                <div className="space-y-2 pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                  {expenseBreakdown.map((item, idx) => {
                    const COLORS = ["#ef4444","#f97316","#eab308",
                                    "#22c55e","#06b6d4","#8b5cf6",
                                    "#ec4899","#64748b","#0ea5e9","#10b981"];
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-semibold" style={{ color: "#334155" }}>{item.categoryName}</span>
                        </div>
                        <div className="text-right font-bold" style={{ color: "#0f172a" }}>
                          {formatCurrency(item.amount)} <span className="font-normal" style={{ color: "#94a3b8" }}>({item.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs italic" style={{ color: "#94a3b8" }}>Tidak ada pengeluaran</p>
            )}
          </div>
        </div>

        {/* INCOME BREAKDOWN */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "#94a3b8" }}>Income Breakdown</h3>
          <div className="rounded-xl p-4 space-y-2.5 min-h-[120px]" style={{ border: "1px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            {incomeBreakdown.length > 0 ? (
              <>
                <div style={{ width: "100%", height: 200 }} className="flex justify-center">
                  <PieChart width={350} height={200}>
                    <Pie
                      data={incomeBreakdown}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={65}
                      isAnimationActive={false}
                    >
                      {incomeBreakdown.map((entry, index) => {
                        const COLORS = ["#ef4444","#f97316","#eab308",
                                        "#22c55e","#06b6d4","#8b5cf6",
                                        "#ec4899","#64748b","#0ea5e9","#10b981"];
                        return <Cell key={index} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Legend 
                      formatter={(value) => (
                        <span style={{ fontSize: "10px", color: "#334155" }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </div>
                <div className="space-y-2 pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                  {incomeBreakdown.map((item, idx) => {
                    const COLORS = ["#ef4444","#f97316","#eab308",
                                    "#22c55e","#06b6d4","#8b5cf6",
                                    "#ec4899","#64748b","#0ea5e9","#10b981"];
                    return (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="font-semibold" style={{ color: "#334155" }}>{item.categoryName}</span>
                        </div>
                        <div className="text-right font-bold" style={{ color: "#0f172a" }}>
                          {formatCurrency(item.amount)} <span className="font-normal" style={{ color: "#94a3b8" }}>({item.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs italic" style={{ color: "#94a3b8" }}>Tidak ada pemasukan</p>
            )}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5" style={{ color: "#94a3b8" }}>Daftar Transaksi</h3>
        <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid #e2e8f0" }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="uppercase text-[9px] font-extrabold tracking-wider" style={{ backgroundColor: "#f1f5f9", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Judul</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Dompet</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, idx) => {
                  const isTransfer = item.type === "TRANSFER";
                  const isIncome = item.type === "INCOME";
                  
                  let typeText = "Pengeluaran";
                  let amountColor = "#ef4444";
                  let prefix = "-";
                  
                  if (isTransfer) {
                    typeText = "Transfer";
                    amountColor = "#334155";
                    prefix = "";
                  } else if (isIncome) {
                    typeText = "Pemasukan";
                    amountColor = "#059669";
                    prefix = "+";
                  }

                  let walletText = "-";
                  let categoryText = "-";
                  if (isTransfer) {
                    categoryText = "Transfer";
                    walletText = `${item.fromWallet?.name || "-"} -> ${item.toWallet?.name || "-"}`;
                  } else {
                    categoryText = item.category?.name || "-";
                    walletText = item.wallet?.name || "-";
                  }

                  const tagStyle = isTransfer
                    ? { backgroundColor: "#e0e7ff", color: "#4f46e5" }
                    : isIncome
                    ? { backgroundColor: "#d1fae5", color: "#059669" }
                    : { backgroundColor: "#fee2e2", color: "#ef4444" };

                  return (
                    <tr
                      key={idx}
                      className="text-[10px] font-semibold"
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc"
                      }}
                    >
                      <td className="py-2 px-3 tabular-nums" style={{ color: "#64748b" }}>
                        {dayjs(item.date).format("DD/MM/YY")}
                      </td>
                      <td className="py-2 px-3 truncate max-w-[150px]" style={{ color: "#1e293b" }}>
                        {cleanDescription(item.description) || "-"}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#334155" }}>{categoryText}</td>
                      <td className="py-2 px-3" style={{ color: "#334155" }}>{walletText}</td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                          style={tagStyle}
                        >
                          {typeText}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right tabular-nums font-bold" style={{ color: amountColor }}>
                        {prefix}{formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-xs italic" style={{ color: "#94a3b8" }}>
                    Tidak ada transaksi pada periode ini
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-between items-center pt-4 text-[9px] font-bold uppercase tracking-wider" style={{ borderTop: "1px solid #e2e8f0", color: "#94a3b8" }}>
        <span>Generated by SaKu - Smart Expense Tracker</span>
        <span className="tabular-nums">Digenerate: {dayjs().format("D MMM YYYY HH:mm")}</span>
      </div>
    </div>
  );
}));

// ─── Main ExportPage Component ────────────────────────────────────────
const ExportPage = memo(function ExportPage() {
  const navigate = useNavigate();

  // Data Hooks
  const { transactions, getTransactions, isLoading: txLoading } = useTransaction();
  const { transfers, getTransfers, isLoading: tfLoading } = useTransfer();
  const { categories, getCategories } = useCategory();
  const { getWallets } = useWallet();

  // Initial loads
  useEffect(() => {
    getTransactions();
    getTransfers();
    getCategories();
    getWallets();
  }, [getTransactions, getTransfers, getCategories, getWallets]);

  // Filter States
  const [dateFrom, setDateFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(() => dayjs().endOf("month").format("YYYY-MM-DD"));
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [selectedType, setSelectedType] = useState("Semua"); // Semua | Pemasukan | Pengeluaran | Transfer
  const [selectedWallet, setSelectedWallet] = useState(null); // null = Semua Dompet
  const [selectedCategory, setSelectedCategory] = useState(""); // "" = Semua Kategori
  const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);

  // PDF Generation States
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);

  const isDataLoading = txLoading || tfLoading;

  // Filter Categories by Type (INCOME / EXPENSE)
  const filteredCategories = useMemo(() => {
    if (selectedType === "Pemasukan") {
      return categories.filter((c) => c.type === "INCOME");
    }
    if (selectedType === "Pengeluaran") {
      return categories.filter((c) => c.type === "EXPENSE");
    }
    return categories;
  }, [categories, selectedType]);

  // Reset selected category if type changes and it's not valid anymore
  useEffect(() => {
    if (selectedCategory) {
      const isValid = filteredCategories.some((c) => c.id === selectedCategory);
      if (!isValid || selectedType === "Transfer") {
        setSelectedCategory("");
      }
    }
  }, [selectedType, filteredCategories, selectedCategory]);

  // Date Range Formatting helper
  const rangeText = useMemo(() => {
    if (!dateFrom && !dateTo) return "Semua Waktu";
    const fromText = dateFrom ? dayjs(dateFrom).format("D MMM YYYY") : "Awal";
    const toText = dateTo ? dayjs(dateTo).format("D MMM YYYY") : "Sekarang";
    return `${fromText} - ${toText}`;
  }, [dateFrom, dateTo]);

  // Shortcut Click Handlers
  const handleShortcutClick = useCallback((type) => {
    if (type === "THIS_MONTH") {
      setDateFrom(dayjs().startOf("month").format("YYYY-MM-DD"));
      setDateTo(dayjs().endOf("month").format("YYYY-MM-DD"));
      setShowCustomDates(false);
    } else if (type === "LAST_MONTH") {
      setDateFrom(dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD"));
      setDateTo(dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD"));
      setShowCustomDates(false);
    } else if (type === "ALL_TIME") {
      setDateFrom("");
      setDateTo("");
      setShowCustomDates(false);
    }
  }, []);

  // Filter Combined Items client-side
  const filteredItems = useMemo(() => {
    let list = [];

    const includeTx = selectedType === "Semua" || selectedType === "Pemasukan" || selectedType === "Pengeluaran";
    const includeTf = selectedType === "Semua" || selectedType === "Transfer";

    // 1. Accumulate Transactions
    if (includeTx) {
      transactions.forEach((tx) => {
        if (selectedType === "Pemasukan" && tx.type !== "INCOME") return;
        if (selectedType === "Pengeluaran" && tx.type !== "EXPENSE") return;
        list.push(tx);
      });
    }

    // 2. Accumulate Transfers
    if (includeTf) {
      transfers.forEach((tf) => {
        list.push({
          ...tf,
          type: "TRANSFER",
        });
      });
    }

    // 3. Filter by Date Range
    if (dateFrom) {
      list = list.filter((item) => !dayjs(item.date).isBefore(dayjs(dateFrom), "day"));
    }
    if (dateTo) {
      list = list.filter((item) => !dayjs(item.date).isAfter(dayjs(dateTo), "day"));
    }

    // 4. Filter by Wallet
    if (selectedWallet) {
      list = list.filter((item) => {
        if (item.type === "TRANSFER") {
          return (
            item.fromWallet?.id === selectedWallet.id ||
            item.toWallet?.id === selectedWallet.id ||
            item.fromWalletId === selectedWallet.id ||
            item.toWalletId === selectedWallet.id
          );
        } else {
          return (
            item.wallet?.id === selectedWallet.id ||
            item.walletId === selectedWallet.id
          );
        }
      });
    }

    // 5. Filter by Category
    if (selectedCategory && selectedType !== "Transfer") {
      list = list.filter((item) => {
        if (item.type === "TRANSFER") return false;
        return (
          item.category?.id === selectedCategory ||
          item.categoryId === selectedCategory
        );
      });
    }

    // Sort Descending by Date
    return list.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  }, [transactions, transfers, selectedType, dateFrom, dateTo, selectedWallet, selectedCategory]);

  // ─── Financial Calculations for PDF/CSV Summary ────────────────────
  const { totalIncome, totalExpense, netBalance, expenseBreakdown, incomeBreakdown } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const expenseMap = {};
    const incomeMap = {};

    filteredItems.forEach((item) => {
      const amount = Number(item.amount || 0);
      if (item.type === "INCOME") {
        income += amount;
        const catName = item.category?.name || "Lain-lain";
        incomeMap[catName] = (incomeMap[catName] || 0) + amount;
      } else if (item.type === "EXPENSE") {
        expense += amount;
        const catName = item.category?.name || "Lain-lain";
        expenseMap[catName] = (expenseMap[catName] || 0) + amount;
      }
    });

    const expBreakdown = Object.entries(expenseMap).map(([name, amt]) => ({
      categoryName: name,
      amount: amt,
      percentage: expense > 0 ? Math.round((amt / expense) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    const incBreakdown = Object.entries(incomeMap).map(([name, amt]) => ({
      categoryName: name,
      amount: amt,
      percentage: income > 0 ? Math.round((amt / income) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      expenseBreakdown: expBreakdown,
      incomeBreakdown: incBreakdown,
    };
  }, [filteredItems]);

  // CSV Generator String logic (Ollo layout format)
  const generateCSVString = useCallback((items) => {
    const lines = [];
    
    // Header Info
    lines.push("SaKu Financial Report");
    lines.push(`Periode: ${rangeText}`);
    lines.push(`Digenerate: ${dayjs().format("D MMM YYYY HH:mm")}`);
    lines.push(""); // Empty line
    
    // Ringkasan
    lines.push("RINGKASAN");
    lines.push(`Total Pemasukan,${formatCurrency(totalIncome).replace(/,/g, "")}`);
    lines.push(`Total Pengeluaran,${formatCurrency(totalExpense).replace(/,/g, "")}`);
    
    const isNetNegative = netBalance < 0;
    const netFormatted = isNetNegative 
      ? `-${formatCurrency(Math.abs(netBalance))}`
      : formatCurrency(netBalance);
    lines.push(`Saldo Bersih,${netFormatted.replace(/,/g, "")}`);
    lines.push(""); // Empty line
    
    // Transaksi
    lines.push("TRANSAKSI");
    lines.push("Tanggal,Judul,Kategori,Sub-kategori,Dompet,Tipe,Jumlah");
    
    items.forEach((item) => {
      const tanggal = dayjs(item.date).format("DD/MM/YY");
      const judul = cleanDescription(item.description) || "";
      
      let kategori = "-";
      let subKategori = "-";
      let dompet = "-";
      let tipe = "";
      let sign = "";
      
      if (item.type === "TRANSFER") {
        kategori = "Transfer";
        dompet = `${item.fromWallet?.name || "-"} -> ${item.toWallet?.name || "-"}`;
        tipe = "Transfer";
      } else {
        kategori = item.category?.name || "-";
        subKategori = item.subCategory?.name || "-";
        dompet = item.wallet?.name || "-";
        tipe = item.type === "INCOME" ? "Pemasukan" : "Pengeluaran";
        sign = item.type === "INCOME" ? "" : "-";
      }
      
      const jumlah = `${sign}${formatCurrency(item.amount)}`;

      const row = [
        tanggal,
        judul,
        kategori,
        subKategori,
        dompet,
        tipe,
        jumlah
      ].map((val) => {
        const strVal = String(val);
        // Escape quotes and wrap in double quotes if commas or quotes or newlines exist
        if (strVal.includes(",") || strVal.includes("\"") || strVal.includes("\n") || strVal.includes("\r")) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      });
      
      lines.push(row.join(","));
    });

    // Add UTF-8 BOM character at the start (\uFEFF)
    return "\uFEFF" + lines.join("\n");
  }, [rangeText, totalIncome, totalExpense, netBalance]);

  // Export to XLSX Download function
  const handleExportXLSX = useCallback(() => {
    if (filteredItems.length === 0) {
      toast.error("Tidak ada transaksi untuk diekspor");
      return;
    }
    try {
      // 1. Inisialisasi Workbook
      const wb = XLSX.utils.book_new();

      // --- STYLE TEMPLATE DEFINITIONS ---
      const borderThinGray = {
        top: { style: "thin", color: { rgb: "E2E8F0" } },
        bottom: { style: "thin", color: { rgb: "E2E8F0" } },
        left: { style: "thin", color: { rgb: "E2E8F0" } },
        right: { style: "thin", color: { rgb: "E2E8F0" } }
      };

      const fontMain = { name: "Arial", sz: 10, color: { rgb: "1E293B" } };
      
      const styleTitle = {
        font: { name: "Arial", sz: 16, bold: true, color: { rgb: "4F46E5" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      const styleMeta = {
        font: { name: "Arial", sz: 10, italic: true, color: { rgb: "64748B" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
      
      const styleSummaryHeader = {
        font: { name: "Arial", sz: 11, bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: borderThinGray
      };

      const styleRowLabel = {
        font: { name: "Arial", sz: 10, bold: true, color: { rgb: "334155" } },
        border: borderThinGray,
        fill: { fgColor: { rgb: "F8FAFC" } }
      };

      // ─── Sheet 1: Ringkasan ───
      const summaryData = [
        ["SaKu Financial Report"],
        [`Periode: ${rangeText}`],
        [`Digenerate: ${dayjs().format("D MMM YYYY HH:mm")}`],
        [],
        ["RINGKASAN", ""],
        ["Total Pemasukan", totalIncome],
        ["Total Pengeluaran", totalExpense],
        ["Saldo Bersih", netBalance],
      ];
      
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Styling Sheet 1 cells
      wsSummary["A1"].s = styleTitle;
      wsSummary["A2"].s = styleMeta;
      wsSummary["A3"].s = styleMeta;
      
      // Header Ringkasan
      wsSummary["A5"].s = styleSummaryHeader;
      wsSummary["B5"].s = styleSummaryHeader;
      
      // Number format helper (standard financial accounting parenthesis format)
      const formatCurrencyXLSX = () => {
        return {
          numFmt: '"Rp"#,##0;"(Rp"#,##0")";"-";@'
        };
      };
      
      // Total Pemasukan row (6)
      wsSummary["A6"].s = styleRowLabel;
      wsSummary["B6"].s = {
        font: { name: "Arial", sz: 10, bold: true, color: { rgb: "059669" } }, // Green
        border: borderThinGray,
        alignment: { horizontal: "right" },
        ...formatCurrencyXLSX()
      };
      
      // Total Pengeluaran row (7)
      wsSummary["A7"].s = styleRowLabel;
      wsSummary["B7"].s = {
        font: { name: "Arial", sz: 10, bold: true, color: { rgb: "EF4444" } }, // Red
        border: borderThinGray,
        alignment: { horizontal: "right" },
        ...formatCurrencyXLSX()
      };
      
      // Saldo Bersih row (8)
      wsSummary["A8"].s = styleRowLabel;
      wsSummary["B8"].s = {
        font: { name: "Arial", sz: 10, bold: true, color: { rgb: netBalance >= 0 ? "4F46E5" : "EF4444" } },
        border: borderThinGray,
        alignment: { horizontal: "right" },
        ...formatCurrencyXLSX()
      };
      
      // Merging Cells in Summary Sheet
      wsSummary["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Merge Title A1:B1
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }, // Merge Periode A2:B2
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Merge Digenerate A3:B3
        { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }  // Merge RINGKASAN Header A5:B5
      ];
      
      wsSummary["!cols"] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

      // ─── Sheet 2: Transaksi ───
      const headers = [
        "Tanggal", "Judul", "Kategori", 
        "Sub-kategori", "Dompet", "Tipe", "Jumlah"
      ];
      
      const rows = filteredItems.map((item) => {
        const tanggal = dayjs(item.date).format("DD/MM/YYYY");
        const isTransfer = item.type === "TRANSFER";
        const isIncome = item.type === "INCOME";
        
        return [
          tanggal,
          cleanDescription(item.description) || "-",
          isTransfer ? "Transfer" : (item.category?.name || "-"),
          isTransfer ? "-" : (item.subCategory?.name || "-"),
          isTransfer 
            ? `${item.fromWallet?.name || "-"} → ${item.toWallet?.name || "-"}`
            : (item.wallet?.name || "-"),
          isTransfer ? "Transfer" : (isIncome ? "Pemasukan" : "Pengeluaran"),
          isTransfer ? Number(item.amount) : (isIncome ? Number(item.amount) : -Number(item.amount)),
        ];
      });
      
      const wsData = [headers, ...rows];
      const wsTransaksi = XLSX.utils.aoa_to_sheet(wsData);
      
      // Styling Table Headers
      const colCodes = ["A", "B", "C", "D", "E", "F", "G"];
      colCodes.forEach((col) => {
        wsTransaksi[`${col}1`].s = {
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: borderThinGray
        };
      });
      
      // Styling Data Rows
      rows.forEach((row, rowIdx) => {
        const rNum = rowIdx + 2; // 1-based index starting after headers (row 2)
        const isAlternate = rowIdx % 2 !== 0;
        const bgHex = isAlternate ? "F8FAFC" : "FFFFFF";
        const rowBg = { fill: { fgColor: { rgb: bgHex } } };
        
        // Date column (A)
        wsTransaksi[`A${rNum}`].s = {
          font: fontMain,
          alignment: { horizontal: "center" },
          border: borderThinGray,
          ...rowBg
        };
        
        // Title (B)
        wsTransaksi[`B${rNum}`].s = {
          font: fontMain,
          alignment: { horizontal: "left" },
          border: borderThinGray,
          ...rowBg
        };
        
        // Category (C)
        wsTransaksi[`C${rNum}`].s = {
          font: fontMain,
          alignment: { horizontal: "left" },
          border: borderThinGray,
          ...rowBg
        };
        
        // Sub-category (D)
        wsTransaksi[`D${rNum}`].s = {
          font: fontMain,
          alignment: { horizontal: "left" },
          border: borderThinGray,
          ...rowBg
        };
        
        // Wallet (E)
        wsTransaksi[`E${rNum}`].s = {
          font: fontMain,
          alignment: { horizontal: "left" },
          border: borderThinGray,
          ...rowBg
        };
        
        // Tipe (F)
        const tipeVal = row[5];
        let tipeColor = "334155"; // Transfer (Slate)
        if (tipeVal === "Pemasukan") tipeColor = "059669"; // Green
        else if (tipeVal === "Pengeluaran") tipeColor = "EF4444"; // Red
        
        wsTransaksi[`F${rNum}`].s = {
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: tipeColor } },
          alignment: { horizontal: "center" },
          border: borderThinGray,
          ...rowBg
        };
        
        // Jumlah (G)
        const amtVal = row[6];
        let amtColor = "334155";
        if (tipeVal === "Pemasukan") amtColor = "059669";
        else if (tipeVal === "Pengeluaran") amtColor = "EF4444";
        
        wsTransaksi[`G${rNum}`].s = {
          font: { name: "Arial", sz: 10, bold: true, color: { rgb: amtColor } },
          alignment: { horizontal: "right" },
          border: borderThinGray,
          ...formatCurrencyXLSX(),
          ...rowBg
        };
      });
      
      // Lebar kolom transaksi
      wsTransaksi["!cols"] = [
        { wch: 12 }, // Tanggal
        { wch: 30 }, // Judul
        { wch: 20 }, // Kategori
        { wch: 20 }, // Sub-kategori
        { wch: 22 }, // Dompet
        { wch: 12 }, // Tipe
        { wch: 16 }, // Jumlah
      ];
      
      XLSX.utils.book_append_sheet(wb, wsTransaksi, "Transaksi");
      
      // Download
      const timestamp = dayjs().format("YYYYMMDD_HHmmss");
      XLSX.writeFile(wb, `saku-export-${timestamp}.xlsx`);
      toast.success("XLSX berhasil diekspor! 📊");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengekspor XLSX");
    }
  }, [filteredItems, rangeText, totalIncome, totalExpense, netBalance]);

  // Copy to Clipboard function
  const handleCopyToClipboard = useCallback(async () => {
    if (filteredItems.length === 0) {
      toast.error("Tidak ada transaksi untuk disalin");
      return;
    }
    try {
      const csvContent = generateCSVString(filteredItems);
      await navigator.clipboard.writeText(csvContent);
      toast.success("CSV berhasil disalin ke clipboard! 📋");
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyalin ke clipboard");
    }
  }, [filteredItems, generateCSVString]);

  // PDF Exporter function using html2canvas + jsPDF
  const handleExportPDF = useCallback(async () => {
    if (filteredItems.length === 0) {
      toast.error("Tidak ada transaksi untuk diekspor");
      return;
    }
    setIsGenerating(true);
    try {
      const element = previewRef.current;
      if (!element) {
        throw new Error("Elemen preview laporan tidak ditemukan.");
      }
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        throw new Error("Gagal merender lembar laporan (kanvas kosong).");
      }
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      // Page 1
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= 297; // A4 height in mm
      
      // Additional pages if height overflows
      while (heightLeft > 0.5) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= 297;
      }
      
      pdf.save(`saku-report-${dayjs().format('YYYYMMDD')}.pdf`);
      toast.success('PDF berhasil diexport! 📄');
    } catch (err) {
      console.error("PDF Export error details:", err);
      toast.error(`Gagal mengexport PDF: ${err.message || "Terjadi kesalahan sistem"}`);
    } finally {
      setIsGenerating(false);
    }
  }, [filteredItems]);

  return (
    <div className="max-w-xl mx-auto pb-48 animate-fade-slide-up">
      {/* HEADER */}
      <div className="flex items-center gap-3 py-4 mb-4">
        <button
          id="btn-back"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:scale-95 transition-all cursor-pointer shadow-sm"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-extrabold text-[var(--text-primary)]">
          Ekspor Data
        </h2>
      </div>

      <div className="space-y-6">
        {/* SECTION - Rentang Tanggal */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
            Rentang Tanggal
          </label>
          
          {/* Card Tanggal */}
          <button
            id="btn-toggle-date-range"
            onClick={() => setShowCustomDates((prev) => !prev)}
            className="w-full flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl cursor-pointer hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/30 transition-all text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-650 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {rangeText}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] font-medium mt-0.5">
                  Klik untuk ubah rentang tanggal kustom
                </p>
              </div>
            </div>
            <ChevronDown
              className={clsx(
                "h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-200",
                showCustomDates && "rotate-180"
              )}
            />
          </button>

          {/* Custom Date Inputs (collapsible) */}
          {showCustomDates && (
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col gap-3 shadow-sm animate-fade-in">
              <div className="flex gap-3 items-center">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1">Mulai</span>
                  <input
                    id="input-date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <span className="text-[var(--text-tertiary)] font-bold pt-5">—</span>
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider px-1">Selesai</span>
                  <input
                    id="input-date-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3 Shortcut Chips */}
          <div className="flex gap-2.5 pt-1">
            {[
              { key: "THIS_MONTH", label: "Bulan Ini", id: "btn-shortcut-this-month" },
              { key: "LAST_MONTH", label: "Bulan Lalu", id: "btn-shortcut-last-month" },
              { key: "ALL_TIME", label: "Semua Waktu", id: "btn-shortcut-all-time" },
            ].map((chip) => {
              const isSelected =
                (chip.key === "THIS_MONTH" &&
                  dateFrom === dayjs().startOf("month").format("YYYY-MM-DD") &&
                  dateTo === dayjs().endOf("month").format("YYYY-MM-DD") &&
                  !showCustomDates) ||
                (chip.key === "LAST_MONTH" &&
                  dateFrom === dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD") &&
                  dateTo === dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD") &&
                  !showCustomDates) ||
                (chip.key === "ALL_TIME" && !dateFrom && !dateTo && !showCustomDates);

              return (
                <button
                  key={chip.key}
                  id={chip.id}
                  onClick={() => handleShortcutClick(chip.key)}
                  className={clsx(
                    "flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center",
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION - Tipe Transaksi */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
            Tipe Transaksi
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: "Semua", id: "btn-type-semua" },
              { key: "Pemasukan", id: "btn-type-pemasukan" },
              { key: "Pengeluaran", id: "btn-type-pengeluaran" },
              { key: "Transfer", id: "btn-type-transfer" },
            ].map((type) => {
              const isSelected = selectedType === type.key;
              return (
                <button
                  key={type.key}
                  id={type.id}
                  onClick={() => setSelectedType(type.key)}
                  className={clsx(
                    "px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer flex-1 text-center",
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                      : "bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                  )}
                >
                  {type.key}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION - Dompet */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
            Dompet
          </label>
          <button
            id="btn-wallet-picker"
            onClick={() => setIsWalletPickerOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl cursor-pointer hover:bg-[var(--bg-tertiary)] hover:border-indigo-500/30 transition-all text-left shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div
                className={clsx(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                  selectedWallet
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                )}
                style={
                  selectedWallet?.color
                    ? {
                        backgroundColor: `${selectedWallet.color}1c`,
                        color: selectedWallet.color,
                      }
                    : undefined
                }
              >
                <WalletIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {selectedWallet ? selectedWallet.name : "Semua Dompet"}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] font-medium mt-0.5">
                  {selectedWallet ? `${selectedWallet.bankName || "Dompet"} · ${formatCurrency(selectedWallet.balance)}` : "Tampilkan transaksi dari semua dompet"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {selectedWallet && (
                <button
                  id="btn-reset-wallet"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedWallet(null);
                  }}
                  className="px-2 py-1 text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg cursor-pointer transition-colors"
                >
                  Reset
                </button>
              )}
              <ChevronDown className="h-5 w-5 text-[var(--text-tertiary)]" />
            </div>
          </button>
        </div>

        {/* SECTION - Kategori */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider px-1">
            Kategori
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <select
              id="select-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={selectedType === "Transfer"}
              className="w-full rounded-2xl border border-[var(--border-color)] pl-11 pr-10 py-3.5 text-sm text-[var(--text-primary)] bg-[var(--card-bg)] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none shadow-sm"
            >
              <option value="">Semua Kategori</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {selectedType === "Transfer" && (
            <p className="text-[10px] text-amber-500 font-semibold px-1">
              ⚠️ Kategori tidak berlaku untuk transaksi bertipe Transfer
            </p>
          )}
        </div>

        {/* FOOTER ACTIONS IN FLOW */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 shadow-sm mt-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Total Filter
            </span>
            <span className="text-sm font-extrabold text-[var(--text-primary)] flex items-center gap-1.5">
              {isDataLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              ) : (
                <span className="tabular-nums">{filteredItems.length}</span>
              )}
              <span className="text-xs font-semibold text-[var(--text-secondary)] normal-case">
                Transaksi ditemukan
              </span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* COPY BUTTON */}
            <button
              id="btn-copy-csv"
              onClick={handleCopyToClipboard}
              disabled={isDataLoading || isGenerating || filteredItems.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] font-bold text-xs cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-transparent whitespace-nowrap"
              title="Salin CSV"
            >
              <Copy className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">Salin CSV</span>
            </button>

            {/* XLSX BUTTON */}
            <button
              id="btn-export-xlsx"
              onClick={handleExportXLSX}
              disabled={isDataLoading || isGenerating || filteredItems.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-[var(--card-bg)] shadow-sm whitespace-nowrap"
              title="Ekspor XLSX"
            >
              <FileSpreadsheet className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">Ekspor XLSX</span>
            </button>

            {/* PDF BUTTON */}
            <button
              id="btn-export-pdf"
              onClick={handleExportPDF}
              disabled={isDataLoading || isGenerating || filteredItems.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/10 dark:shadow-none whitespace-nowrap"
              title="Ekspor PDF"
            >
              {isGenerating ? (
                <Loader2 className="h-4.5 w-4.5 animate-spin shrink-0" />
              ) : (
                <FileText className="h-4.5 w-4.5 shrink-0" />
              )}
              <span className="whitespace-nowrap">
                {isGenerating ? "Generating..." : "Ekspor PDF"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* WALLET PICKER DIALOG */}
      {isWalletPickerOpen && createPortal(
        <WalletPicker
          isOpen={isWalletPickerOpen}
          onClose={() => setIsWalletPickerOpen(false)}
          onSelect={(wallet) => {
            setSelectedWallet(wallet);
            setIsWalletPickerOpen(false);
          }}
        />,
        document.body
      )}

      {/* COMPONENT TERSEMBUNYI UNTUK PREVIEW EXPORT PDF */}
      <ExportPreview
        ref={previewRef}
        items={filteredItems}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netBalance={netBalance}
        expenseBreakdown={expenseBreakdown}
        incomeBreakdown={incomeBreakdown}
        dateRange={rangeText}
      />
    </div>
  );
});

export default ExportPage;
