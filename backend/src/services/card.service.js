const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Get all cards for a user, optionally filtered by provider.
 * Returns cards array and summary count object.
 */
const getCards = async (userId, { provider } = {}) => {
  const where = { userId };
  if (provider && provider !== "ALL") {
    where.provider = provider;
  }

  const cards = await prisma.card.findMany({
    where,
    orderBy: [
      { pinToTop: "desc" },
      { createdAt: "desc" }
    ]
  });

  // Calculate summary (always for all cards of the user)
  const allCards = await prisma.card.findMany({ where: { userId } });
  
  const summary = {
    total: allCards.length,
    bank: allCards.filter(c => c.provider === "BANK").length,
    ewallet: allCards.filter(c => c.provider === "EWALLET").length,
    blockchain: allCards.filter(c => c.provider === "BLOCKCHAIN").length,
    rekening: allCards.filter(c => c.provider === "REKENING").length,
    other: allCards.filter(c => c.provider === "OTHER").length,
  };

  return {
    cards,
    summary,
  };
};

/**
 * Get a single card by ID with ownership check.
 */
const getCardById = async (userId, id) => {
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card || card.userId !== userId) {
    throw createError(404, "Kartu tidak ditemukan");
  }
  return card;
};

/**
 * Create a new card.
 */
const createCard = async (userId, data) => {
  const {
    cardName,
    bankName,
    holderName,
    accountNumber,
    expiryMonth,
    expiryYear,
    label,
    branch,
    provider,
    type,
    category,
    cardColor,
    pinToTop,
  } = data;

  if (!cardName || !cardName.trim()) {
    throw createError(400, "Nama kartu wajib diisi");
  }
  if (!bankName || !bankName.trim()) {
    throw createError(400, "Nama bank/wallet wajib diisi");
  }
  if (!holderName || !holderName.trim()) {
    throw createError(400, "Nama pemegang kartu wajib diisi");
  }

  let lastFourDigits = data.lastFourDigits;
  if (accountNumber) {
    lastFourDigits = accountNumber.replace(/\s/g, "").slice(-4);
  }

  if (!lastFourDigits || !/^\d{4}$/.test(lastFourDigits)) {
    throw createError(400, "Nomor akun/kartu tidak valid (harus menyertakan 4 digit angka)");
  }

  const card = await prisma.card.create({
    data: {
      userId,
      cardName: cardName.trim(),
      bankName: bankName.trim(),
      holderName: holderName.trim().toUpperCase(),
      lastFourDigits,
      accountNumber: accountNumber ? accountNumber.trim() : null,
      expiryMonth: expiryMonth ? expiryMonth.trim() : null,
      expiryYear: expiryYear ? expiryYear.trim() : null,
      label: label ? label.trim() : null,
      branch: branch ? branch.trim() : null,
      provider: provider || "BANK",
      type: type || "PERSONAL",
      category: category || "MAIN",
      cardColor: cardColor || "#3525cd",
      pinToTop: pinToTop || false,
    },
  });

  return card;
};

/**
 * Update card details.
 */
const updateCard = async (userId, id, data) => {
  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw createError(404, "Kartu tidak ditemukan");
  }

  const updateData = {};
  if (data.cardName !== undefined) updateData.cardName = data.cardName.trim();
  if (data.bankName !== undefined) updateData.bankName = data.bankName.trim();
  if (data.holderName !== undefined) updateData.holderName = data.holderName.trim().toUpperCase();
  if (data.accountNumber !== undefined) {
    updateData.accountNumber = data.accountNumber ? data.accountNumber.trim() : null;
    updateData.lastFourDigits = data.accountNumber
      ? data.accountNumber.replace(/\s/g, "").slice(-4).padStart(4, "0")
      : existing.lastFourDigits;
  } else if (data.lastFourDigits !== undefined) {
    if (!/^\d{4}$/.test(data.lastFourDigits)) {
      throw createError(400, "Digit terakhir harus 4 digit angka");
    }
    updateData.lastFourDigits = data.lastFourDigits;
  }

  if (data.expiryMonth !== undefined) updateData.expiryMonth = data.expiryMonth ? data.expiryMonth.trim() : null;
  if (data.expiryYear !== undefined) updateData.expiryYear = data.expiryYear ? data.expiryYear.trim() : null;
  if (data.label !== undefined) updateData.label = data.label ? data.label.trim() : null;
  if (data.branch !== undefined) updateData.branch = data.branch ? data.branch.trim() : null;
  if (data.provider !== undefined) updateData.provider = data.provider;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.cardColor !== undefined) updateData.cardColor = data.cardColor;
  if (data.pinToTop !== undefined) updateData.pinToTop = data.pinToTop;

  const card = await prisma.card.update({
    where: { id },
    data: updateData,
  });

  return card;
};

/**
 * Flip card pin status.
 */
const togglePinToTop = async (userId, id) => {
  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw createError(404, "Kartu tidak ditemukan");
  }

  const card = await prisma.card.update({
    where: { id },
    data: { pinToTop: !existing.pinToTop },
  });

  return card;
};

/**
 * Delete a card.
 */
const deleteCard = async (userId, id) => {
  const existing = await prisma.card.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw createError(404, "Kartu tidak ditemukan");
  }

  return prisma.card.delete({ where: { id } });
};

module.exports = {
  getCards,
  getCardById,
  createCard,
  updateCard,
  togglePinToTop,
  deleteCard,
};
