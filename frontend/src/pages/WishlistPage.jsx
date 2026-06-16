import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Plus, 
  Loader2, 
  Gift, 
  Bot, 
  TrendingUp,
  ImageOff,
  Link2,
  Trash2,
  Calendar,
  Wallet,
  LayoutDashboard,
  BarChart2,
  UserCircle
} from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { formatCurrency } from "../utils/format";
import WishlistForm from "../components/wishlist/WishlistForm";
import WishlistCard from "../components/wishlist/WishlistCard";
import BuyConfirmSheet from "../components/wishlist/BuyConfirmSheet";
import clsx from "clsx";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const WishlistPage = memo(function WishlistPage() {
  const navigate = useNavigate();
  const {
    wishlists,
    summary,
    isLoading,
    getWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
  } = useWishlist();

  // Filters state
  const [statusFilter, setStatusFilter] = useState("ACTIVE"); // ACTIVE | ACHIEVED

  // Sheet/Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [buyItem, setBuyItem] = useState(null);

  // Focus item state
  const [selectedWishlist, setSelectedWishlist] = useState(null);

  // Load data on mount and whenever filters change
  const loadData = useCallback(() => {
    getWishlists({ status: statusFilter });
  }, [statusFilter, getWishlists]);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Form submit handler (Create / Edit)
  const handleFormSubmit = async (data) => {
    let success = false;
    if (selectedWishlist) {
      const res = await updateWishlist(selectedWishlist.id, data);
      if (res) success = true;
    } else {
      const res = await createWishlist(data);
      if (res) success = true;
    }

    if (success) {
      setIsFormOpen(false);
      loadData();
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus keinginan ini?")) {
      const res = await deleteWishlist(id);
      if (res) {
        loadData();
      }
    }
  };

  // Open Handlers
  const handleOpenAdd = () => {
    setSelectedWishlist(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = useCallback((wishlist) => {
    setSelectedWishlist(wishlist);
    setIsFormOpen(true);
  }, []);

  // Calculate dynamic savings progress
  const progressPercent = useMemo(() => {
    if (!summary.totalItems) return 0;
    return Math.round((summary.achievedCount / summary.totalItems) * 100);
  }, [summary]);

  // Get active item name dynamically
  const activeWishlistItemName = useMemo(() => {
    const activeItem = wishlists.find(w => w.status === "ACTIVE");
    return activeItem ? activeItem.name : null;
  }, [wishlists]);

  return (
    <div className="w-full max-w-6xl mx-auto pb-24 animate-fade-slide-up select-none">
      
      {/* ─── DESKTOP VIEWPORT ─── */}
      <div className="hidden lg:block">
        {/* Header */}
        <header className="flex justify-between items-center py-4 mb-6 border-b border-[var(--border-color)]/60">
          <div className="text-left">
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Keinginan</h2>
            <p className="text-xs text-[var(--text-secondary)] font-semibold mt-0.5">
              Kelola daftar impian dan target belanja Anda secara terstruktur.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Tambah
          </button>
        </header>

        {/* Two Column Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column (35% width on desktop) */}
          <div className="w-full lg:w-[35%] flex flex-col gap-6 lg:sticky lg:top-6">
            
            {/* Card Summary (Premium style) */}
            <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-lg min-h-[280px] flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-600/80 to-violet-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-transparent -z-10" />
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-left">
                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Total Nilai Mimpi</p>
                <h3 className="text-3xl font-extrabold leading-none tracking-tight tabular-nums">
                  {formatCurrency(summary.totalValue || 0)}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-amber-300" />
                    <span className="text-xs font-bold text-white">Progress Tabungan</span>
                  </div>
                  <span className="text-xs font-extrabold text-white tabular-nums">{progressPercent}%</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left">
                    <p className="text-[9px] text-white/60 font-extrabold uppercase">Item Aktif</p>
                    <p className="text-lg font-extrabold text-white mt-1 leading-none tabular-nums">{summary.activeCount || 0}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-left">
                    <p className="text-[9px] text-white/60 font-extrabold uppercase">Tercapai</p>
                    <p className="text-lg font-extrabold text-white mt-1 leading-none tabular-nums">{summary.achievedCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Active / Achieved Toggle pill */}
            <div className="bg-[var(--bg-tertiary)] p-1 rounded-2xl flex select-none border border-[var(--border-color)]/30">
              <button 
                onClick={() => setStatusFilter("ACTIVE")}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer",
                  statusFilter === "ACTIVE" 
                    ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent"
                )}>
                Aktif
              </button>
              <button 
                onClick={() => setStatusFilter("ACHIEVED")}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer",
                  statusFilter === "ACHIEVED" 
                    ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-sm" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent"
                )}>
                Tercapai
              </button>
            </div>

            {/* Saran AI SaKu Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl p-6 text-left">
              <h4 className="text-xs font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Bot className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                Saran AI SaKu
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 font-semibold">
                {activeWishlistItemName 
                  ? `Berdasarkan pola pengeluaran Anda, Anda bisa mencapai target "${activeWishlistItemName}" lebih cepat jika mengurangi pengeluaran sekunder Anda sebesar 15%.`
                  : summary.achievedCount > 0 
                    ? "Selamat! Target keinginan Anda telah tercapai. Buat target keinginan baru untuk memotivasi Anda dalam menabung dan mengelola pos pengeluaran secara optimal."
                    : "Buat target keinginan baru untuk memotivasi Anda dalam menabung serta memantau pos pengeluaran secara optimal di SaKu."}
              </p>
              <button 
                onClick={() => navigate("/chat")}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100/60 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/20 transition-colors cursor-pointer"
              >
                Optimalkan Tabungan
              </button>
            </div>
          </div>

          {/* Right Column (65% width on desktop) */}
          <div className="w-full lg:w-[65%]">
            {isLoading && wishlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-3" />
                <p className="text-xs text-[var(--text-secondary)] font-semibold">Memuat daftar keinginan...</p>
              </div>
            ) : wishlists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {wishlists.map((item) => (
                  <WishlistCard
                    key={item.id}
                    wishlist={item}
                    onTap={handleOpenEdit}
                    onDelete={handleDelete}
                    onBuy={(item) => setBuyItem(item)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]/60 py-20 px-6 text-center shadow-xs">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100/30 dark:border-transparent">
                  <Gift className="h-7 w-7 animate-bounce" />
                </div>
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
                  {statusFilter === "ACTIVE" ? "Mulai Menulis Keinginan! 🎯" : "Belum Ada Keinginan Terpenuhi"}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] max-w-xs mx-auto font-medium leading-relaxed mt-1">
                  {statusFilter === "ACTIVE"
                    ? "Tulis barang impian Anda, tentukan harganya, dan bersiaplah untuk mewujudkannya di SaKu."
                    : "Jangan patah semangat! Terus kumpulkan tabungan untuk mencapai barang impian Anda selanjutnya."}
                </p>
                {statusFilter === "ACTIVE" && (
                  <button 
                    onClick={handleOpenAdd} 
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 active:scale-95 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Keinginan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── MOBILE VIEWPORT ─── */}
      <div className="block lg:hidden -mx-4 -mt-4 pb-24">
        {/* Header Section */}
        <header className="sticky top-0 z-40 bg-[var(--bg-secondary)]/80 backdrop-blur-xl px-4 py-4 flex justify-between items-center border-b border-[var(--border-color)]/30 mb-6 transition-all">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-1 hover:bg-[var(--bg-tertiary)] rounded-lg text-[var(--text-primary)] cursor-pointer shrink-0 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)]">Keinginan</h1>
          </div>
          <button 
            onClick={handleOpenAdd}
            className="w-10 h-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl active:scale-90 transition-transform shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-5 w-5" />
          </button>
        </header>

        <main className="px-4 space-y-6">
          {/* Summary Card */}
          <section className="mt-2 mb-6">
            <div className="relative overflow-hidden rounded-[24px] p-6 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-500 text-white shadow-xl">
              {/* Background Decoration */}
              <div className="absolute -right-6 -top-6 opacity-10 pointer-events-none">
                <Wallet className="w-[120px] h-[120px]" />
              </div>
              
              <p className="text-xs font-semibold uppercase tracking-wider opacity-85">Total Nilai Mimpi</p>
              <h2 className="mt-1 text-3xl font-extrabold leading-none tracking-tight tabular-nums">
                {formatCurrency(summary.totalValue || 0)}
              </h2>
              
              <div className="mt-6 flex gap-4">
                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-left">
                  <p className="text-[10px] uppercase font-bold opacity-70">Item Aktif</p>
                  <p className="text-lg font-bold mt-1 leading-none tabular-nums">{summary.activeCount || 0}</p>
                </div>
                <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-left">
                  <p className="text-[10px] uppercase font-bold opacity-70">Tercapai</p>
                  <p className="text-lg font-bold mt-1 leading-none tabular-nums">{summary.achievedCount || 0}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Tabs Section */}
          <nav className="flex bg-[var(--bg-tertiary)] rounded-2xl p-1 mb-6 border border-[var(--border-color)]/30">
            <button 
              onClick={() => setStatusFilter("ACTIVE")}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center",
                statusFilter === "ACTIVE" 
                  ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-[0_4px_12px_rgba(53,37,205,0.15)] font-bold" 
                  : "text-[var(--text-secondary)]"
              )}
            >
              Aktif
            </button>
            <button 
              onClick={() => setStatusFilter("ACHIEVED")}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center",
                statusFilter === "ACHIEVED" 
                  ? "bg-[var(--card-bg)] text-indigo-600 dark:text-indigo-400 shadow-[0_4px_12px_rgba(53,37,205,0.15)] font-bold" 
                  : "text-[var(--text-secondary)]"
              )}
            >
              Tercapai
            </button>
          </nav>

          {/* Wishlist Items List */}
          <div className="space-y-4">
            {isLoading && wishlists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mb-2" />
                <p className="text-xs text-[var(--text-secondary)] font-medium">Memuat...</p>
              </div>
            ) : wishlists.length > 0 ? (
              wishlists.map((item) => {
                const handleOpenProductLink = (e) => {
                  e.stopPropagation();
                  if (item.productLink) {
                    window.open(item.productLink, "_blank", "noopener,noreferrer");
                  }
                };

                const handleDeleteClick = (e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                };

                const handleBuyClick = (e) => {
                  e.stopPropagation();
                  setBuyItem(item);
                };

                return (
                  <div
                    key={item.id}
                    onClick={() => item.status === "ACTIVE" && handleOpenEdit(item)}
                    className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-4 rounded-xl flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] duration-200 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--bg-tertiary)] flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff className="h-6 w-6 text-[var(--text-tertiary)] opacity-35" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{item.name}</h3>
                      <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1 mt-1 font-semibold">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {item.targetDate ? dayjs(item.targetDate).format("DD MMM YYYY") : "Tanpa Target"}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="font-bold text-base text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {formatCurrency(item.targetPrice)}
                        </span>
                        {item.productLink && (
                          <button
                            type="button"
                            onClick={handleOpenProductLink}
                            className="text-indigo-500 hover:text-indigo-600 p-0.5 shrink-0 cursor-pointer"
                          >
                            <Link2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end justify-between gap-3 h-full self-stretch shrink-0">
                      <button
                        onClick={handleDeleteClick}
                        className="text-[var(--text-tertiary)]/50 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                      
                      {item.status === "ACTIVE" ? (
                        <button
                          onClick={handleBuyClick}
                          className="px-4 py-1.5 bg-[#ffc329] text-[#6f5100] hover:bg-[#ffc329]/95 font-bold text-xs rounded-lg active:scale-90 transition-transform cursor-pointer shadow-sm border border-amber-500/20"
                        >
                          Beli
                        </button>
                      ) : (
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          Tercapai 🎉
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)]/60 py-12 px-6 text-center shadow-xs">
                <Gift className="h-7 w-7 text-[var(--text-tertiary)] mx-auto mb-3" />
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-1">
                  {statusFilter === "ACTIVE" ? "Keinginan Kosong" : "Belum Ada Target Tercapai"}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] font-medium leading-relaxed max-w-xs mx-auto">
                  {statusFilter === "ACTIVE"
                    ? "Tulis impian Anda dan bersiaplah mewujudkannya."
                    : "Terus menabung untuk mewujudkan impian selanjutnya."}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Form & Confirmation Modals */}
      <WishlistForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        wishlist={selectedWishlist}
        isLoading={isLoading}
      />

      {buyItem && (
        <BuyConfirmSheet
          isOpen={Boolean(buyItem)}
          item={buyItem}
          onClose={() => setBuyItem(null)}
          onSuccess={() => {
            setBuyItem(null);
            loadData();
          }}
        />
      )}

    </div>
  );
});

export default WishlistPage;
