const { Router } = require("express");

const router = Router();

const authRoutes = require("./auth.route");
const categoryRoutes = require("./category.route");
const transactionRoutes = require("./transaction.route");
const receiptRoutes = require("./receipt.route");
const chatRoutes = require("./chat.route");
const walletRoutes = require("./wallet.route");
const transferRoutes = require("./transfer.route");

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/categories", categoryRoutes);
router.use("/receipts", receiptRoutes);
router.use("/chat", chatRoutes);
router.use("/wallets", walletRoutes);
router.use("/transfers", transferRoutes);

module.exports = router;
