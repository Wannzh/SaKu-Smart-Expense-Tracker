const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Ambil transaksi milik user dengan filter opsional
 *
 * @param {string} userId
 * @param {{ type?: string, categoryId?: string, dateFrom?: string, dateTo?: string }} filters
 * @returns {Promise<object[]>}
 */
const getTransactions = async (userId, { type, categoryId, dateFrom, dateTo } = {}) => {
  const where = { userId };

  if (type) {
    where.type = type;
  }

  if (categoryId) {
    where.categoryId = categoryId;
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
 *
 * @param {string} userId
 * @param {{ amount: number, type: string, description?: string, date: string, categoryId?: string }} data
 * @returns {Promise<object>}
 */
const createTransaction = async (userId, { amount, type, description, date, categoryId }) => {
  if (!amount || amount <= 0) {
    throw createError(400, "Amount harus lebih besar dari 0");
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount,
      type,
      description,
      date: new Date(date),
      userId,
      categoryId: categoryId || null,
    },
    include: {
      category: true,
    },
  });

  return transaction;
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
      receipt: true,
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
 *
 * @param {string} userId
 * @param {string} transactionId
 * @param {{ amount?: number, type?: string, description?: string, date?: string, categoryId?: string }} data
 * @returns {Promise<object>}
 */
const updateTransaction = async (userId, transactionId, { amount, type, description, date, categoryId }) => {
  // Cek kepemilikan
  await getTransactionById(userId, transactionId);

  if (amount !== undefined && amount <= 0) {
    throw createError(400, "Amount harus lebih besar dari 0");
  }

  const updateData = {};
  if (amount !== undefined) updateData.amount = amount;
  if (type !== undefined) updateData.type = type;
  if (description !== undefined) updateData.description = description;
  if (date !== undefined) updateData.date = new Date(date);
  if (categoryId !== undefined) updateData.categoryId = categoryId || null;

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: {
      category: true,
    },
  });

  return updated;
};

/**
 * Hapus transaksi — pastikan milik user
 *
 * @param {string} userId
 * @param {string} transactionId
 * @returns {Promise<object>}
 */
const deleteTransaction = async (userId, transactionId) => {
  // Cek kepemilikan
  const transaction = await getTransactionById(userId, transactionId);

  await prisma.transaction.delete({
    where: { id: transactionId },
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
