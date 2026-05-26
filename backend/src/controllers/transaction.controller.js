const transactionService = require("../services/transaction.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/transactions
 */
const getTransactions = async (req, res, next) => {
  const { type, categoryId, dateFrom, dateTo } = req.query;

  const transactions = await transactionService.getTransactions(req.user.id, {
    type,
    categoryId,
    dateFrom,
    dateTo,
  });

  sendSuccess(res, 200, "Daftar transaksi berhasil diambil", { transactions });
};

/**
 * GET /api/transactions/summary
 */
const getSummary = async (req, res, next) => {
  const summary = await transactionService.getSummary(req.user.id);
  sendSuccess(res, 200, "Summary transaksi berhasil diambil", { summary });
};

/**
 * POST /api/transactions
 */
const createTransaction = async (req, res, next) => {
  const { amount, type, description, date, categoryId } = req.body;

  const transaction = await transactionService.createTransaction(req.user.id, {
    amount,
    type,
    description,
    date,
    categoryId,
  });

  sendSuccess(res, 201, "Transaksi berhasil dibuat", { transaction });
};

/**
 * GET /api/transactions/:id
 */
const getTransactionById = async (req, res, next) => {
  const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);
  sendSuccess(res, 200, "Detail transaksi berhasil diambil", { transaction });
};

/**
 * PUT /api/transactions/:id
 */
const updateTransaction = async (req, res, next) => {
  const { amount, type, description, date, categoryId } = req.body;

  const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, {
    amount,
    type,
    description,
    date,
    categoryId,
  });

  sendSuccess(res, 200, "Transaksi berhasil diperbarui", { transaction });
};

/**
 * DELETE /api/transactions/:id
 */
const deleteTransaction = async (req, res, next) => {
  const transaction = await transactionService.deleteTransaction(req.user.id, req.params.id);
  sendSuccess(res, 200, "Transaksi berhasil dihapus", { transaction });
};

module.exports = {
  getTransactions,
  getSummary,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
