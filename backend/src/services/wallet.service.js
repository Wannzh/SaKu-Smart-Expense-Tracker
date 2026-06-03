const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Ambil semua wallet milik user
 */
const getWallets = async (userId) => {
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    include: {
      _count: { select: { transactions: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return wallets;
};

/**
 * Buat wallet baru — balance = initialBalance saat create
 */
const createWallet = async (userId, { name, type, initialBalance, icon, color, bankName }) => {
  const balance = initialBalance || 0;

  const wallet = await prisma.wallet.create({
    data: {
      name,
      type,
      balance,
      initialBalance: balance,
      icon: icon || null,
      color: color || null,
      bankName: bankName || null,
      userId,
    },
  });

  return wallet;
};

/**
 * Ambil wallet by id — include 5 transaksi terbaru + total in/out
 */
const getWallet = async (userId, walletId) => {
  const wallet = await prisma.wallet.findUnique({
    where: { id: walletId },
    include: {
      transactions: {
        include: { category: true },
        orderBy: { date: "desc" },
        take: 5,
      },
      _count: { select: { transactions: true } },
    },
  });

  if (!wallet) {
    throw createError(404, "Wallet tidak ditemukan");
  }

  if (wallet.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke wallet ini");
  }

  // Hitung total income & expense untuk wallet ini
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { walletId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { walletId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  return {
    ...wallet,
    totalIncome: Number(incomeResult._sum.amount || 0),
    totalExpense: Number(expenseResult._sum.amount || 0),
  };
};

/**
 * Update wallet — hanya name/icon/color/bankName
 * Balance tidak bisa diedit langsung
 */
const updateWallet = async (userId, walletId, { name, icon, color, bankName }) => {
  const existing = await prisma.wallet.findUnique({ where: { id: walletId } });

  if (!existing) {
    throw createError(404, "Wallet tidak ditemukan");
  }

  if (existing.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke wallet ini");
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (icon !== undefined) updateData.icon = icon;
  if (color !== undefined) updateData.color = color;
  if (bankName !== undefined) updateData.bankName = bankName;

  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: updateData,
  });

  return wallet;
};

/**
 * Hapus wallet — set walletId semua transaksinya ke null
 */
const deleteWallet = async (userId, walletId) => {
  const existing = await prisma.wallet.findUnique({ where: { id: walletId } });

  if (!existing) {
    throw createError(404, "Wallet tidak ditemukan");
  }

  if (existing.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke wallet ini");
  }

  // Atomic: nullify walletId on transactions, then delete wallet
  const wallet = await prisma.$transaction(async (tx) => {
    await tx.transaction.updateMany({
      where: { walletId },
      data: { walletId: null },
    });

    return tx.wallet.delete({ where: { id: walletId } });
  });

  return wallet;
};

module.exports = {
  getWallets,
  createWallet,
  getWallet,
  updateWallet,
  deleteWallet,
};
