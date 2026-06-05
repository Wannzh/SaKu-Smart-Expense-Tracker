const transferService = require("../services/transfer.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/transfers
 */
const getTransfers = async (req, res, next) => {
  try {
    const transfers = await transferService.getTransfers(req.user.id);
    sendSuccess(res, 200, "Daftar transfer berhasil diambil", { transfers });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/transfers
 */
const createTransfer = async (req, res, next) => {
  try {
    const { amount, description, date, fromWalletId, toWalletId } = req.body;
    const transfer = await transferService.createTransfer(req.user.id, {
      amount,
      description,
      date,
      fromWalletId,
      toWalletId,
    });
    sendSuccess(res, 201, "Transfer berhasil dibuat", { transfer });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/transfers/:id
 */
const deleteTransfer = async (req, res, next) => {
  try {
    const transfer = await transferService.deleteTransfer(req.user.id, req.params.id);
    sendSuccess(res, 200, "Transfer berhasil dihapus", { transfer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransfers,
  createTransfer,
  deleteTransfer,
};
