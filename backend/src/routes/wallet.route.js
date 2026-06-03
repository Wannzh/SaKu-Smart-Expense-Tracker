const { Router } = require("express");
const walletController = require("../controllers/wallet.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route wallet butuh autentikasi
router.use(authMiddleware);

// GET /api/wallets — list semua wallet user
router.get("/", walletController.getWallets);

// POST /api/wallets — buat wallet baru
router.post("/", walletController.createWallet);

// GET /api/wallets/:id — detail wallet
router.get("/:id", walletController.getWallet);

// PUT /api/wallets/:id — edit wallet
router.put("/:id", walletController.updateWallet);

// DELETE /api/wallets/:id — hapus wallet
router.delete("/:id", walletController.deleteWallet);

module.exports = router;
