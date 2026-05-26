const { Router } = require("express");
const transactionController = require("../controllers/transaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route transaksi butuh autentikasi
router.use(authMiddleware);

// GET /api/transactions — list dengan filter
router.get("/", transactionController.getTransactions);

// POST /api/transactions — buat transaksi baru
router.post("/", transactionController.createTransaction);

// GET /api/transactions/summary — total income, expense, balance
// ⚠️ PENTING: harus sebelum /:id agar "summary" tidak dianggap sebagai id
router.get("/summary", transactionController.getSummary);

// GET /api/transactions/:id — detail transaksi
router.get("/:id", transactionController.getTransactionById);

// PUT /api/transactions/:id — edit transaksi
router.put("/:id", transactionController.updateTransaction);

// DELETE /api/transactions/:id — hapus transaksi
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
