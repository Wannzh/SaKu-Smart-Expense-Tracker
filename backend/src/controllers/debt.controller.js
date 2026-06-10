const debtService = require("../services/debt.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/debts
 * Get list of debts and loans with optional type and status filters.
 */
const getDebts = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const debts = await debtService.getDebts(req.user.id, { type, status });
    sendSuccess(res, 200, "Daftar utang & piutang berhasil diambil", { debts });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/debts
 * Create a new debt or loan record.
 */
const createDebt = async (req, res, next) => {
  try {
    const { type, personName, amount, notes, borrowDate, dueDate, walletId } = req.body;
    const debt = await debtService.createDebt(req.user.id, {
      type,
      personName,
      amount,
      notes,
      borrowDate,
      dueDate,
      walletId,
    });
    sendSuccess(res, 201, "Data utang/piutang berhasil dibuat", { debt });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/debts/:id
 * Update descriptive/metadata fields on a debt/loan record.
 */
const updateDebt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { personName, notes, borrowDate, dueDate } = req.body;
    const debt = await debtService.updateDebt(req.user.id, id, {
      personName,
      notes,
      borrowDate,
      dueDate,
    });
    sendSuccess(res, 200, "Data utang/piutang berhasil diperbarui", { debt });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/debts/:id/pay
 * Record a payment/installment on a debt or loan.
 */
const payDebt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paidAmount, walletId } = req.body;
    const debt = await debtService.payDebt(req.user.id, id, { paidAmount, walletId });
    sendSuccess(res, 200, "Pelunasan berhasil dicatat", { debt });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/debts/:id
 * Delete a debt or loan record and reverse its wallet balance effects.
 */
const deleteDebt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const debt = await debtService.deleteDebt(req.user.id, id);
    sendSuccess(res, 200, "Data utang/piutang berhasil dihapus", { debt });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDebts,
  createDebt,
  updateDebt,
  payDebt,
  deleteDebt,
};
