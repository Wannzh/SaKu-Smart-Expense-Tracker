const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Ambil transaksi milik user dengan filter opsional
 *
 * @param {string} userId
 * @param {{ type?: string, categoryId?: string, walletId?: string, dateFrom?: string, dateTo?: string }} filters
 * @returns {Promise<object[]>}
 */
const getTransactions = async (userId, { type, categoryId, walletId, dateFrom, dateTo } = {}) => {
  const where = { userId };

  if (type) {
    where.type = type;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (walletId) {
    where.walletId = walletId;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      category: true,
      subCategory: true,
      wallet: true,
    },
    orderBy: { date: "desc" },
  });

  return transactions;
};

/**
 * Hitung summary: totalIncome, totalExpense, balance
 *
 * @param {string} userId
 * @returns {Promise<{ totalIncome: number, totalExpense: number, balance: number }>}
 */
const getSummary = async (userId) => {
  const [incomeResult, expenseResult] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME" },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE" },
      _sum: { amount: true },
    }),
  ]);

  const totalIncome = Number(incomeResult._sum.amount || 0);
  const totalExpense = Number(expenseResult._sum.amount || 0);
  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
};

/**
 * Buat transaksi baru
 * Jika walletId ada → update balance wallet (atomic)
 *
 * @param {string} userId
 * @param {{ amount: number, type: string, description?: string, date: string, categoryId?: string, subCategoryId?: string, walletId?: string }} data
 * @returns {Promise<object>}
 */
const createTransaction = async (userId, { amount, type, description, date, categoryId, subCategoryId, walletId }) => {
  if (!amount || amount <= 0) {
    throw createError(400, "Amount harus lebih besar dari 0");
  }

  // Jika walletId ada, validasi ownership
  if (walletId) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw createError(404, "Wallet tidak ditemukan");
    if (wallet.userId !== userId) throw createError(403, "Wallet bukan milik Anda");
  }

  const result = await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        amount,
        type,
        description,
        date: new Date(date),
        userId,
        categoryId: categoryId || null,
        subCategoryId: subCategoryId || null,
        walletId: walletId || null,
      },
      include: {
        category: true,
        subCategory: true,
        wallet: true,
      },
    });

    // Update wallet balance
    if (walletId) {
      const increment = type === "INCOME" ? amount : -amount;
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment } },
      });
    }

    return transaction;
  });

  return result;
};

/**
 * Ambil transaksi by id — pastikan milik user
 *
 * @param {string} userId
 * @param {string} transactionId
 * @returns {Promise<object>}
 */
const getTransactionById = async (userId, transactionId) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      category: true,
      subCategory: true,
      receipt: true,
      wallet: true,
    },
  });

  if (!transaction) {
    throw createError(404, "Transaksi tidak ditemukan");
  }

  if (transaction.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke transaksi ini");
  }

  return transaction;
};

/**
 * Update transaksi — pastikan milik user
 * Jika amount/type/walletId berubah → recalculate balance wallet
 *
 * @param {string} userId
 * @param {string} transactionId
 * @param {{ amount?: number, type?: string, description?: string, date?: string, categoryId?: string, subCategoryId?: string, walletId?: string }} data
 * @returns {Promise<object>}
 */
const updateTransaction = async (userId, transactionId, { amount, type, description, date, categoryId, subCategoryId, walletId }) => {
  // Cek kepemilikan
  const existing = await getTransactionById(userId, transactionId);

  if (amount !== undefined && amount <= 0) {
    throw createError(400, "Amount harus lebih besar dari 0");
  }

  // Validasi wallet baru jika berubah
  const newWalletId = walletId !== undefined ? (walletId || null) : existing.walletId;
  if (newWalletId) {
    const wallet = await prisma.wallet.findUnique({ where: { id: newWalletId } });
    if (!wallet) throw createError(404, "Wallet tidak ditemukan");
    if (wallet.userId !== userId) throw createError(403, "Wallet bukan milik Anda");
  }

  const result = await prisma.$transaction(async (tx) => {
    // 1. Reverse balance pada wallet lama (jika ada)
    if (existing.walletId) {
      const oldAmount = Number(existing.amount);
      const oldReverse = existing.type === "INCOME" ? -oldAmount : oldAmount;
      await tx.wallet.update({
        where: { id: existing.walletId },
        data: { balance: { increment: oldReverse } },
      });
    }

    // 2. Update transaksi
    const updateData = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (categoryId !== undefined) updateData.categoryId = categoryId || null;
    if (subCategoryId !== undefined) updateData.subCategoryId = subCategoryId || null;
    if (walletId !== undefined) updateData.walletId = walletId || null;

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        category: true,
        subCategory: true,
        wallet: true,
      },
    });

    // 3. Apply balance pada wallet baru (jika ada)
    const finalWalletId = updated.walletId;
    if (finalWalletId) {
      const finalAmount = Number(updated.amount);
      const increment = updated.type === "INCOME" ? finalAmount : -finalAmount;
      await tx.wallet.update({
        where: { id: finalWalletId },
        data: { balance: { increment } },
      });
    }

    return updated;
  });

  return result;
};

/**
 * Hapus transaksi — pastikan milik user
 * Jika walletId ada → reverse balance
 *
 * @param {string} userId
 * @param {string} transactionId
 * @returns {Promise<object>}
 */
const deleteTransaction = async (userId, transactionId) => {
  // Cek kepemilikan
  const transaction = await getTransactionById(userId, transactionId);

  await prisma.$transaction(async (tx) => {
    // Reverse wallet balance
    if (transaction.walletId) {
      const amount = Number(transaction.amount);
      const reverse = transaction.type === "INCOME" ? -amount : amount;
      await tx.wallet.update({
        where: { id: transaction.walletId },
        data: { balance: { increment: reverse } },
      });
    }

    await tx.transaction.delete({
      where: { id: transactionId },
    });
  });

  return transaction;
};

module.exports = {
  getTransactions,
  getSummary,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
