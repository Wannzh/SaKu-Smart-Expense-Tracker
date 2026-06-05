const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Get all transfers for a user
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const getTransfers = async (userId) => {
  return prisma.transfer.findMany({
    where: { userId },
    include: {
      fromWallet: true,
      toWallet: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Create a new transfer and atomic updates on wallets balance
 * @param {string} userId
 * @param {{ amount: number, description?: string, date: string, fromWalletId: string, toWalletId: string }} data
 * @returns {Promise<object>}
 */
const createTransfer = async (userId, { amount, description, date, fromWalletId, toWalletId }) => {
  if (!amount || amount <= 0) {
    throw createError(400, "Amount harus lebih besar dari 0");
  }

  if (fromWalletId === toWalletId) {
    throw createError(400, "Dompet asal dan dompet tujuan tidak boleh sama");
  }

  // Validate fromWallet ownership & balance
  const fromWallet = await prisma.wallet.findUnique({ where: { id: fromWalletId } });
  if (!fromWallet) throw createError(404, "Dompet asal tidak ditemukan");
  if (fromWallet.userId !== userId) throw createError(403, "Dompet asal bukan milik Anda");

  // Validate toWallet ownership
  const toWallet = await prisma.wallet.findUnique({ where: { id: toWalletId } });
  if (!toWallet) throw createError(404, "Dompet tujuan tidak ditemukan");
  if (toWallet.userId !== userId) throw createError(403, "Dompet tujuan bukan milik Anda");

  // Check if balance is sufficient
  const balanceNum = Number(fromWallet.balance);
  if (balanceNum < amount) {
    throw createError(400, "Saldo tidak mencukupi");
  }

  // Run atomic transaction
  return prisma.$transaction(async (tx) => {
    // 1. Create transfer record
    const transfer = await tx.transfer.create({
      data: {
        amount,
        description,
        date: new Date(date),
        userId,
        fromWalletId,
        toWalletId,
      },
      include: {
        fromWallet: true,
        toWallet: true,
      },
    });

    // 2. Decrement fromWallet balance
    await tx.wallet.update({
      where: { id: fromWalletId },
      data: { balance: { decrement: amount } },
    });

    // 3. Increment toWallet balance
    await tx.wallet.update({
      where: { id: toWalletId },
      data: { balance: { increment: amount } },
    });

    return transfer;
  });
};

/**
 * Delete a transfer and reverse the wallet balances atomically
 * @param {string} userId
 * @param {string} transferId
 * @returns {Promise<object>}
 */
const deleteTransfer = async (userId, transferId) => {
  const existing = await prisma.transfer.findUnique({
    where: { id: transferId },
  });

  if (!existing) {
    throw createError(404, "Transfer tidak ditemukan");
  }

  if (existing.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke transfer ini");
  }

  const amount = Number(existing.amount);

  return prisma.$transaction(async (tx) => {
    // 1. Delete transfer
    await tx.transfer.delete({
      where: { id: transferId },
    });

    // 2. Reverse balance: increase fromWallet, decrease toWallet
    await tx.wallet.update({
      where: { id: existing.fromWalletId },
      data: { balance: { increment: amount } },
    });

    await tx.wallet.update({
      where: { id: existing.toWalletId },
      data: { balance: { decrement: amount } },
    });

    return existing;
  });
};

module.exports = {
  getTransfers,
  createTransfer,
  deleteTransfer,
};
