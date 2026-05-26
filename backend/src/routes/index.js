const { Router } = require("express");

const router = Router();

const authRoutes = require("./auth.route");
const categoryRoutes = require("./category.route");
const transactionRoutes = require("./transaction.route");
// TODO: Uncomment setelah masing-masing route file dibuat
// const receiptRoutes = require("./receipt.routes");
// const chatRoutes = require("./chat.routes");

router.use("/auth", authRoutes);
router.use("/transactions", transactionRoutes);
router.use("/categories", categoryRoutes);
// router.use("/receipts", receiptRoutes);
// router.use("/chat", chatRoutes);

module.exports = router;
