import { memo, useState, useEffect, useCallback } from "react";
import { 
  Plus, ChevronRight, CreditCard, Building2, Wallet, 
  Link2, LayoutList, PlusCircle, Copy, Landmark 
} from "lucide-react";
import { useCard } from "../hooks/useCard";
import CardVisual from "../components/cards/CardVisual";
import CardListItem, { CategoryBadge } from "../components/cards/CardListItem";
import CardForm from "../components/cards/CardForm";
import CardDetail from "../components/cards/CardDetail";

const DesktopCardItem = memo(function DesktopCardItem({ 
  card, onTap, onCopy 
}) {
  const handleCopy = useCallback((e) => {
    e.stopPropagation();
    onCopy(card);
  }, [card, onCopy]);

  return (
    <div 
      className="bg-[var(--card-bg)] border 
        border-[var(--border-color)] rounded-2xl p-4
        shadow-[0px_4px_20px_rgba(0,0,0,0.05)]
        hover:shadow-[0px_8px_30px_rgba(0,0,0,0.08)]
        transition-all cursor-pointer group"
      onClick={() => onTap(card)}>
      
      {/* Card Visual full width */}
      <div className="w-full aspect-[1.6/1] rounded-xl 
        overflow-hidden mb-4">
        <CardVisual card={card} />
      </div>

      {/* Card Info + Copy */}
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-bold text-sm 
            text-[var(--text-primary)]">
            {card.cardName}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <CategoryBadge category={card.category} />
            <span className="text-xs 
              text-[var(--text-tertiary)]">
              • {card.bankName}
            </span>
          </div>
        </div>
        <button 
          onClick={handleCopy}
          className="p-2 text-indigo-600 
            hover:bg-indigo-50 dark:hover:bg-indigo-950/30
            rounded-xl transition-colors 
            flex items-center gap-1 group/copy cursor-pointer">
          <Copy className="w-4 h-4" />
          <span className="text-xs font-bold 
            hidden group-hover/copy:block">
            Salin
          </span>
        </button>
      </div>
    </div>
  );
});

const CardsPage = memo(function CardsPage() {
  const { 
    cards, summary, isLoading,
    pinnedCards, filteredCards,
    activeFilter, setActiveFilter,
    fetchCards, createCard, updateCard, 
    togglePin, deleteCard, copyToClipboard
  } = useCard();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const handleCreate = useCallback(async (data) => {
    await createCard(data);
    setShowForm(false);
  }, [createCard]);

  const handleUpdate = useCallback(async (data) => {
    if (!editItem) return;
    await updateCard(editItem?.id, data);
    setEditItem(null);
  }, [editItem, updateCard]);

  const handleDelete = useCallback(async (id) => {
    await deleteCard(id);
    setDetailItem(null);
  }, [deleteCard]);

  return (
    <div className="min-h-full pb-24 md:pb-6 text-left">
      
      {/* Header */}
      <header className="sticky top-0 z-20 
        bg-[var(--bg-primary)]/80 backdrop-blur-md 
        border-b border-[var(--border-color)] 
        px-4 py-4 flex justify-between items-center select-none">
        <h1 className="text-2xl font-black tracking-tight 
          text-indigo-600">
          Kartu Saya
        </h1>
        <button onClick={() => setShowForm(true)}
          className="w-10 h-10 rounded-full bg-indigo-600 
            text-white flex items-center justify-center 
            active:scale-95 transition-transform cursor-pointer shadow-md shadow-indigo-600/10">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <main className="mt-4">
        {/* Wrap existing content dengan grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 
          lg:max-w-[1280px] lg:mx-auto lg:px-8 lg:py-8">

          {/* LEFT COLUMN — 4/12 */}
          <section className="lg:col-span-4 space-y-6 
            hidden lg:block">
            
            {/* Summary Stats Card */}
            <div className="bg-[var(--card-bg)] border 
              border-[var(--border-color)] rounded-2xl p-6
              shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
              
              <h3 className="text-xs font-semibold uppercase 
                tracking-wider text-[var(--text-secondary)] mb-4">
                Ringkasan Kartu
              </h3>
              
              {/* Total count */}
              <div className="mb-6">
                <span className="text-4xl font-bold 
                  text-indigo-600 tabular-nums">
                  {String(summary.total).padStart(2, "0")}
                </span>
                <span className="text-[var(--text-secondary)] 
                  text-sm ml-2">Kartu Aktif</span>
              </div>

              {/* Breakdown by provider */}
              <div className="space-y-3">
                {[
                  { label: "Bank", key: "bank", 
                    icon: Building2, color: "text-indigo-600" },
                  { label: "Rekening", key: "rekening", 
                    icon: Landmark, color: "text-sky-600" },
                  { label: "E-Wallet", key: "ewallet", 
                    icon: Wallet, color: "text-amber-600" },
                  { label: "Kripto", key: "blockchain", 
                    icon: Link2, color: "text-emerald-600" },
                  { label: "Lainnya", key: "other", 
                    icon: CreditCard, color: "text-gray-500" },
                ].map(({ label, key, icon: Icon, color }) => (
                  <div key={key} 
                    className="flex justify-between items-center 
                      p-3 rounded-xl bg-[var(--bg-secondary)] 
                      border border-[var(--border-color)]">
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm font-medium 
                        text-[var(--text-primary)]">
                        {label}
                      </span>
                    </div>
                    <span className="font-bold text-sm 
                      text-[var(--text-primary)] tabular-nums">
                      {String(summary[key] || 0).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter by Type (desktop only) */}
            <div className="bg-[var(--card-bg)] border 
              border-[var(--border-color)] rounded-2xl p-6
              shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
              
              <h3 className="text-xs font-semibold uppercase 
                tracking-wider text-[var(--text-secondary)] mb-4">
                Filter Kategori
              </h3>
              
              <nav className="flex flex-col gap-2">
                {[
                  { value: "ALL", label: "Semua Kartu", 
                    icon: LayoutList, count: summary.total },
                  { value: "BANK", label: "Bank", 
                    icon: Building2, count: summary.bank },
                  { value: "REKENING", label: "Rekening", 
                    icon: Landmark, count: summary.rekening },
                  { value: "EWALLET", label: "E-Wallet", 
                    icon: Wallet, count: summary.ewallet },
                  { value: "BLOCKCHAIN", label: "Kripto", 
                    icon: Link2, count: summary.blockchain },
                  { value: "OTHER", label: "Lainnya", 
                    icon: CreditCard, count: summary.other },
                ].map(({ value, label, icon: Icon, count }) => (
                  <button key={value}
                    onClick={() => setActiveFilter(value)}
                    className={`flex justify-between items-center 
                      px-4 py-3 rounded-xl transition-all font-medium cursor-pointer
                      ${activeFilter === value
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                      }`}>
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {label}
                    </span>
                    <span className={`text-xs font-bold
                      ${activeFilter === value 
                        ? "opacity-80" 
                        : "opacity-60"}`}>
                      {count || 0}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Add Card Button desktop */}
            <button 
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center 
                gap-3 bg-amber-400 text-amber-900 py-4 rounded-2xl 
                font-bold text-base hover:scale-[1.02] 
                active:scale-95 transition-all shadow-lg group cursor-pointer">
              <PlusCircle className="w-5 h-5 
                group-hover:rotate-90 transition-transform" />
              Tambah Kartu Baru
            </button>

          </section>

          {/* RIGHT COLUMN — 8/12 */}
          <section className="lg:col-span-8">
            
            <div className="lg:hidden">
              {/* Filter Pills */}
              <section className="px-4 overflow-x-auto 
                no-scrollbar flex gap-2 mb-8 select-none">
                {[
                  { value: "ALL", label: "Semua" },
                  { value: "BANK", label: "Bank" },
                  { value: "REKENING", label: "Rekening" },
                  { value: "EWALLET", label: "E-Wallet" },
                  { value: "BLOCKCHAIN", label: "Kripto" },
                  { value: "OTHER", label: "Lainnya" },
                ].map(({ value, label }) => (
                  <button key={value}
                    onClick={() => setActiveFilter(value)}
                    className={`px-5 py-2 rounded-full text-sm 
                      font-semibold whitespace-nowrap 
                      transition-colors cursor-pointer border-transparent
                      ${activeFilter === value
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      }`}>
                    {label}
                  </button>
                ))}
              </section>

              {/* Pinned Cards - hanya tampil jika ada */}
              {pinnedCards.length > 0 && (
                <section className="mb-8 select-none">
                  <div className="flex items-center 
                    justify-between px-4 mb-4">
                    <h2 className="text-xl font-bold 
                      text-indigo-600">
                      Kartu Utama
                    </h2>
                    <span className="text-xs 
                      text-[var(--text-tertiary)] uppercase 
                      font-semibold flex items-center gap-1">
                      Geser 
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex overflow-x-auto 
                    no-scrollbar gap-4 px-4 
                    snap-x snap-mandatory pb-2">
                    {pinnedCards.map(card => (
                      <div key={card.id} 
                        className="snap-center shrink-0 w-[320px]"
                        onClick={() => setDetailItem(card)}>
                        <CardVisual card={card} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* All Cards List */}
            <section className="px-4 mb-10 lg:px-0">
              <h2 className="text-xl font-bold 
                text-indigo-600 mb-4 select-none lg:text-2xl lg:mb-6">
                Semua Kartu
              </h2>

              {isLoading ? (
                <>
                  <div className="hidden lg:grid grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-64 rounded-2xl 
                        bg-[var(--bg-secondary)] animate-pulse" />
                    ))}
                  </div>
                  <div className="lg:hidden flex flex-col gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 rounded-2xl 
                        bg-[var(--bg-secondary)] animate-pulse mb-4" />
                    ))}
                  </div>
                </>
              ) : filteredCards.length === 0 ? (
                <div className="flex flex-col items-center 
                  justify-center py-16 text-center select-none">
                  <div className="w-20 h-20 
                    bg-[var(--bg-secondary)] rounded-full 
                    flex items-center justify-center mb-6">
                    <CreditCard className="w-10 h-10 
                      text-[var(--text-tertiary)]" />
                  </div>
                  <h3 className="text-xl font-bold 
                    text-[var(--text-primary)] mb-2">
                    Belum ada kartu
                  </h3>
                  <p className="text-sm 
                    text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed">
                    Simpan info kartu bank atau e-wallet kamu 
                    untuk akses cepat tanpa buka banyak aplikasi.
                  </p>
                  <button onClick={() => setShowForm(true)}
                    className="bg-indigo-600 text-white 
                      px-8 py-3 rounded-xl font-bold 
                      active:scale-95 transition-transform cursor-pointer shadow-md shadow-indigo-600/10">
                    Tambah Kartu Pertama
                  </button>
                </div>
              ) : (
                <>
                  {/* Desktop Cards Grid */}
                  <div className="hidden lg:grid grid-cols-2 gap-6 mb-8">
                    {filteredCards.map(card => (
                      <DesktopCardItem
                        key={card.id}
                        card={card}
                        onTap={() => setDetailItem(card)}
                        onCopy={copyToClipboard}
                      />
                    ))}
                  </div>

                  {/* Mobile List — tetap ada, hidden di desktop */}
                  <div className="lg:hidden flex flex-col gap-4">
                    {filteredCards.map(card => (
                      <CardListItem
                        key={card.id}
                        card={card}
                        onTap={() => setDetailItem(card)}
                        onCopy={copyToClipboard}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Add more CTA (desktop only) */}
            <div className="hidden lg:flex mt-8 p-12 
              border-2 border-dashed border-[var(--border-color)] 
              rounded-2xl flex-col items-center text-center">
              <div className="w-16 h-16 bg-[var(--bg-secondary)] 
                rounded-full flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 
                  text-[var(--text-tertiary)]" />
              </div>
              <h3 className="font-bold text-lg 
                text-[var(--text-primary)]">
                Punya kartu lain?
              </h3>
              <p className="text-[var(--text-secondary)] 
                max-w-sm mx-auto mb-6 text-sm">
                Tambahkan semua kartu bank atau e-wallet kamu 
                di sini untuk akses cepat tanpa buka banyak aplikasi.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-2 border-2 border-indigo-600 
                  text-indigo-600 font-bold rounded-xl 
                  hover:bg-indigo-600 hover:text-white 
                  transition-all active:scale-95 cursor-pointer">
                Tambah Kartu Sekarang
              </button>
            </div>

          </section>
        </div>
      </main>

      {/* Sheets */}
      {showForm && (
        <CardForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isLoading={isLoading}
        />
      )}
      {editItem && (
        <CardForm
          initialData={editItem}
          onSubmit={handleUpdate}
          onClose={() => setEditItem(null)}
          isLoading={isLoading}
        />
      )}
      {detailItem && (
        <CardDetail
          card={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={(card) => {
            setDetailItem(null);
            setEditItem(card);
          }}
          onDelete={handleDelete}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
});

export default CardsPage;
