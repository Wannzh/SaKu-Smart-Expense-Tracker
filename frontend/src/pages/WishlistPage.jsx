import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Loader2, Sparkles, Gift, Flame, Trophy, CheckCircle, Search, Filter } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { useWallet } from "../hooks/useWallet";
import { formatCurrency } from "../utils/format";
import WishlistForm from "../components/wishlist/WishlistForm";
import WishlistCard from "../components/wishlist/WishlistCard";
import WishlistDetail from "../components/wishlist/WishlistDetail";
import AddSavingsSheet from "../components/wishlist/AddSavingsSheet";
import Button from "../components/common/Button";
import clsx from "clsx";

const WishlistPage = memo(function WishlistPage() {
  const navigate = useNavigate();
  const {
    wishlists,
    summary,
    isLoading,
    getWishlists,
    createWishlist,
    updateWishlist,
    addWishlistSavings,
    deleteWishlist,
  } = useWishlist();

  const { wallets, getWallets } = useWallet();

  // Filters state
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // ACTIVE | ACHIEVED | ALL
  const [priorityFilter, setPriorityFilter] = useState(""); // "" | LOW | MEDIUM | HIGH
  const [searchQuery, setSearchQuery] = useState("");

  // Sheet/Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSavingsOpen, setIsSavingsOpen] = useState(false);

  // Focus item state
  const [selectedWishlist, setSelectedWishlist] = useState(null);

  // Load data on mount and whenever filters change
  const loadData = useCallback(() => {
    const params = {};
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    getWishlists(params);
  }, [statusFilter, priorityFilter, getWishlists]);

  useEffect(() => {
    loadData();
    getWallets();
  }, [statusFilter, priorityFilter, getWallets]);

  // Client-side search filtering
  const filteredWishlists = useMemo(() => {
    if (!searchQuery.trim()) return wishlists;
    const query = searchQuery.toLowerCase().trim();
    return wishlists.filter((w) => w.name.toLowerCase().includes(query));
  }, [wishlists, searchQuery]);

  // Form submit handler (Create / Edit)
  const handleFormSubmit = async (data) => {
    let success = false;
    if (selectedWishlist) {
      const res = await updateWishlist(selectedWishlist.id, data);
      if (res) {
        success = true;
        // Update local detail view if open
        setSelectedWishlist(res);
      }
    } else {
      const res = await createWishlist(data);
      if (res) success = true;
    }

    if (success) {
      setIsFormOpen(false);
      loadData();
      getWallets();
    }
  };

  // Savings submit handler
  const handleSavingsSubmit = async (id, amount, walletId) => {
    const res = await addWishlistSavings(id, amount, walletId);
    if (res) {
      setIsSavingsOpen(false);
      loadData();
      getWallets();
      // If detail is open, update the displayed item
      if (selectedWishlist && selectedWishlist.id === id) {
        setSelectedWishlist(res);
        // Re-open detail since it was auto closed by add savings click
        setIsDetailOpen(true);
      }
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    const res = await deleteWishlist(id);
    if (res) {
      setIsDetailOpen(false);
      loadData();
    }
  };

  // Open Handlers
  const handleOpenAdd = () => {
    setSelectedWishlist(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wishlist) => {
    setSelectedWishlist(wishlist);
    setIsDetailOpen(false); // close detail view
    setIsFormOpen(true);
  };

  const handleOpenDetail = (wishlist) => {
    setSelectedWishlist(wishlist);
    setIsDetailOpen(true);
  };

  const handleOpenSavings = (wishlist) => {
    setSelectedWishlist(wishlist);
    setIsSavingsOpen(true);
  };

  // Calculate overall savings progress
  const overallProgress = useMemo(() => {
    if (summary.totalTargetPrice <= 0) return 0;
    return Math.min(Math.round((summary.totalSaved / summary.totalTargetPrice) * 100), 100);
  }, [summary]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 pb-24 animate-fade-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between py-4 mb-4 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-primary)] cursor-pointer transition-colors lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Keinginan (Wishlist)</h2>
            <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5 hidden sm:block">
              Rencanakan tabungan untuk barang impian dengan target pencapaian terstruktur.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Tambah Keinginan
        </button>
      </div>

      {/* SUMMARY CARD (Premium Style) */}
      <div className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden mb-6 select-none bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-500">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-white/15">
          <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-100 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Total Tabungan Keinginan
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 tabular-nums">
            {formatCurrency(summary.totalSaved)}
          </h1>
          <span className="mt-2 text-[10px] font-bold bg-white/20 rounded-full px-3 py-1 uppercase tracking-wider">
            Sisa Target: {formatCurrency(Math.max(0, summary.totalTargetPrice - summary.totalSaved))}
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="py-4">
          <div className="flex justify-between text-xs font-black text-indigo-100 mb-1.5 uppercase tracking-wider">
            <span>Progres Gabungan</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-3 w-full bg-white/25 rounded-full overflow-hidden">
            <div
              style={{ width: `${overallProgress}%` }}
              className="h-full bg-amber-400 transition-all duration-500 ease-out"
            />
          </div>
        </div>

        {/* Breakdown counters */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10">
          <div className="text-center">
            <p className="text-[9px] uppercase font-extrabold text-indigo-200 tracking-wider">Total Barang</p>
            <p className="text-base font-extrabold mt-0.5 tabular-nums">{summary.total}</p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="text-[9px] uppercase font-extrabold text-indigo-200 tracking-wider">Aktif</p>
            <p className="text-base font-extrabold mt-0.5 tabular-nums">{summary.active}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase font-extrabold text-indigo-200 tracking-wider">Tercapai</p>
            <p className="text-base font-extrabold mt-0.5 tabular-nums text-amber-300 flex items-center justify-center gap-1">
              <Trophy className="h-4.5 w-4.5" /> {summary.achieved}
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Cari barang impian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all"
          />
        </div>

        {/* Tab-like Pill Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-color)] pb-3 select-none">
          {/* Status filter */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {[
              { key: "ACTIVE", label: "Aktif" },
              { key: "ACHIEVED", label: "Tercapai 🎉" },
              { key: "ALL", label: "Semua" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  statusFilter === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] bg-transparent"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-tertiary)] flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" /> Prioritas:
            </span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-xs text-[var(--text-secondary)] outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="">Semua</option>
              <option value="LOW">Rendah</option>
              <option value="MEDIUM">Sedang</option>
              <option value="HIGH">Tinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* WISHLIST ITEMS GRID */}
      {isLoading && wishlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 select-none">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2.5" />
          <p className="text-xs text-[var(--text-secondary)] font-medium">Memuat daftar keinginan...</p>
        </div>
      ) : (
        <>
          {filteredWishlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredWishlists.map((item) => (
                <WishlistCard
                  key={item.id}
                  wishlist={item}
                  onClick={() => handleOpenDetail(item)}
                  onAddSavings={handleOpenSavings}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-16 px-6 text-center shadow-xs select-none">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100 dark:border-transparent">
                <Gift className="h-7 w-7 animate-bounce" />
              </div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
                {statusFilter === "ACTIVE" ? "Mulai Menulis Keinginan! 🎯" : "Belum Ada Keinginan Terpenuhi"}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto font-medium leading-relaxed">
                {statusFilter === "ACTIVE"
                  ? "Tulis barang impian Anda, tentukan harganya, dan mulai menabung untuk mewujudkannya."
                  : "Jangan patah semangat! Terus menabung untuk mencapai barang impian Anda selanjutnya."}
              </p>
              {statusFilter === "ACTIVE" && (
                <Button onClick={handleOpenAdd} className="mt-6 text-xs py-2.5 px-5">
                  <Plus className="h-4.5 w-4.5" />
                  Tambah Keinginan
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Floating Action Button (FAB) for Mobile only */}
      <button
        onClick={handleOpenAdd}
        className="fixed bottom-6 right-6 z-40 sm:hidden flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 active:scale-90 active:bg-indigo-700 transition-all cursor-pointer"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Sheet Components */}
      <WishlistForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        wallets={wallets}
        wishlist={selectedWishlist}
        isLoading={isLoading}
      />

      <WishlistDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        wishlist={selectedWishlist}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onAddSavings={handleOpenSavings}
      />

      <AddSavingsSheet
        isOpen={isSavingsOpen}
        onClose={() => setIsSavingsOpen(false)}
        onSubmit={handleSavingsSubmit}
        wallets={wallets}
        wishlist={selectedWishlist}
        isLoading={isLoading}
      />
    </div>
  );
});

export default WishlistPage;
