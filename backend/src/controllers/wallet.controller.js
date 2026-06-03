const walletService = require("../services/wallet.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/wallets
 */
const getWallets = async (req, res, next) => {
  const wallets = await walletService.getWallets(req.user.id);
  sendSuccess(res, 200, "Daftar wallet berhasil diambil", { wallets });
};

/**
 * POST /api/wallets
 */
const createWallet = async (req, res, next) => {
  const { name, type, initialBalance, icon, color, bankName } = req.body;

  const wallet = await walletService.createWallet(req.user.id, {
    name,
    type,
    initialBalance,
    icon,
    color,
    bankName,
  });

  sendSuccess(res, 201, "Wallet berhasil dibuat", { wallet });
};

/**
 * GET /api/wallets/:id
 */
const getWallet = async (req, res, next) => {
  const wallet = await walletService.getWallet(req.user.id, req.params.id);
  sendSuccess(res, 200, "Detail wallet berhasil diambil", { wallet });
};

/**
 * PUT /api/wallets/:id
 */
const updateWallet = async (req, res, next) => {
  const { name, icon, color, bankName } = req.body;

  const wallet = await walletService.updateWallet(req.user.id, req.params.id, {
    name,
    icon,
    color,
    bankName,
  });

  sendSuccess(res, 200, "Wallet berhasil diperbarui", { wallet });
};

/**
 * DELETE /api/wallets/:id
 */
const deleteWallet = async (req, res, next) => {
  const wallet = await walletService.deleteWallet(req.user.id, req.params.id);
  sendSuccess(res, 200, "Wallet berhasil dihapus", { wallet });
};

module.exports = {
  getWallets,
  createWallet,
  getWallet,
  updateWallet,
  deleteWallet,
};
