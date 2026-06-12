import { memo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Plus, Loader2, Gift, CheckCircle } from "lucide-react";
import { useWishlist } from "../hooks/useWishlist";
import { formatCurrency } from "../utils/format";
import WishlistForm from "../components/wishlist/WishlistForm";
import WishlistCard from "../components/wishlist/WishlistCard";
import BuyConfirmSheet from "../components/wishlist/BuyConfirmSheet";
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
              Rencanakan target barang impian Anda secara terstruktur.
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

        {/* Baris Atas Card */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-indigo-100">
            Total Nilai Mimpi
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight mt-1 tabular-nums">
            {formatCurrency(summary.totalValue || 0)}
          </h1>
        </div>

        {/* Baris Bawah Card */}
        <div className="flex justify-between items-center mt-6">
          <span className="text-sm font-medium text-white/90">
            {summary.activeCount === 0 || !summary.activeCount ? "0 Keinginan" : `${summary.activeCount} Keinginan`}
          </span>
          <div className="bg-white/20 text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>
              {summary.achievedCount === 0 || !summary.achievedCount ? "0 Mimpi Tercapai" : `${summary.achievedCount} Mimpi Tercapai`}
            </span>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center border-b border-[var(--border-color)] pb-3 mb-6 select-none">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {[
            { key: "ACTIVE", label: "Aktif" },
            { key: "ACHIEVED", label: "Tercapai" },
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
      </div>

      {/* WISHLIST ITEMS GRID */}
      {isLoading && wishlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 select-none">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2.5" />
          <p className="text-xs text-[var(--text-secondary)] font-medium">Memuat daftar keinginan...</p>
        </div>
      ) : (
        <>
          {wishlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="rounded-3xl bg-[var(--card-bg)] border border-[var(--border-color)] py-16 px-6 text-center shadow-xs select-none">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border border-indigo-100 dark:border-transparent">
                <Gift className="h-7 w-7 animate-bounce" />
              </div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-1">
                {statusFilter === "ACTIVE" ? "Mulai Menulis Keinginan! 🎯" : "Belum Ada Keinginan Terpenuhi"}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-sm mx-auto font-medium leading-relaxed">
                {statusFilter === "ACTIVE"
                  ? "Tulis barang impian Anda, tentukan harganya, dan bersiaplah untuk mewujudkannya."
                  : "Jangan patah semangat! Terus berusaha untuk mencapai barang impian Anda selanjutnya."}
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
