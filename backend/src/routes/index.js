const { Router } = require("express");

const router = Router();

const authRoutes = require("./auth.route");
const categoryRoutes = require("./category.route");
const transactionRoutes = require("./transaction.route");
const receiptRoutes = require("./receipt.route");
const chatRoutes = require("./chat.route");
const walletRoutes = require("./wallet.route");

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/categories", categoryRoutes);
router.use("/receipts", receiptRoutes);
router.use("/chat", chatRoutes);
router.use("/wallets", walletRoutes);

module.exports = router;
