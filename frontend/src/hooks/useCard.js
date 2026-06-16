import { useState, useCallback, useMemo, useEffect } from "react";
import * as cardApi from "../api/card.api";
import toast from "react-hot-toast";

export function useCard() {
  const [cards, setCards] = useState([]);
  const [summary, setSummary] = useState({ total: 0, bank: 0, ewallet: 0, blockchain: 0, other: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cardApi.getCards();
      // standard api format returns response inside data.data
      const data = res.data.data;
      setCards(data.cards || []);
      setSummary(data.summary || { total: 0, bank: 0, ewallet: 0, blockchain: 0, other: 0 });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengambil data kartu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCard = useCallback(async (data) => {
    setIsLoading(true);
    try {
      await cardApi.createCard(data);
      toast.success("Kartu berhasil ditambahkan! ✅");
      await fetchCards();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menambahkan kartu");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  const updateCard = useCallback(async (id, data) => {
    setIsLoading(true);
    try {
      await cardApi.updateCard(id, data);
      toast.success("Kartu berhasil diperbarui! ✅");
      await fetchCards();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal memperbarui kartu");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  const togglePin = useCallback(async (id) => {
    try {
      await cardApi.togglePinToTop(id);
      await fetchCards();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menyematkan kartu");
    }
  }, [fetchCards]);

  const deleteCard = useCallback(async (id) => {
    setIsLoading(true);
    try {
      await cardApi.deleteCard(id);
      toast.success("Kartu berhasil dihapus! ✅");
      await fetchCards();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal menghapus kartu");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCards]);

  const copyToClipboard = useCallback((cardOrText) => {
    if (!cardOrText) return;
    
    let textToCopy = "";
    if (typeof cardOrText === "object" && cardOrText !== null) {
      const holderName = (cardOrText.holderName || "").trim();
      const providerName = (cardOrText.bankName || cardOrText.cardName || "").trim();
      const number = (cardOrText.accountNumber || cardOrText.lastFourDigits || "").trim();
      textToCopy = `${holderName}\n${providerName}\n${number}`;
    } else {
      textToCopy = cardOrText;
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => toast.success("Berhasil disalin! ✓"))
      .catch(() => toast.error("Gagal menyalin"));
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // computed properties
  const pinnedCards = useMemo(() => {
    return cards.filter((c) => c.pinToTop);
  }, [cards]);

  const filteredCards = useMemo(() => {
    if (activeFilter === "ALL") return cards;
    return cards.filter((c) => c.provider === activeFilter);
  }, [cards, activeFilter]);

  return {
    cards,
    summary,
    isLoading,
    activeFilter,
    setActiveFilter,
    pinnedCards,
    filteredCards,
    fetchCards,
    createCard,
    updateCard,
    togglePin,
    deleteCard,
    copyToClipboard,
  };
}
