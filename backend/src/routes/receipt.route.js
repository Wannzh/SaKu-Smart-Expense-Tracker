const { Router } = require("express");
const receiptController = require("../controllers/receipt.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

// Semua route receipt butuh autentikasi
router.use(authMiddleware);

// POST /api/receipts/scan — upload foto struk → OCR → return parsed data
router.post("/scan", upload.single("receipt"), receiptController.scan);

// POST /api/receipts/confirm — konfirmasi → create transaction + receipt
router.post("/confirm", receiptController.confirm);

module.exports = router;
