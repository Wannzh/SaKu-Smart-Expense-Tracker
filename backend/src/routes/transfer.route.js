const { Router } = require("express");
const transferController = require("../controllers/transfer.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route transfer butuh autentikasi
router.use(authMiddleware);

// GET /api/transfers — list semua transfer
router.get("/", transferController.getTransfers);

// POST /api/transfers — buat transfer baru
router.post("/", transferController.createTransfer);

// DELETE /api/transfers/:id — hapus transfer (reverse balance)
router.delete("/:id", transferController.deleteTransfer);

module.exports = router;
