const { Router } = require("express");
const billController = require("../controllers/bill.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route tagihan butuh autentikasi
router.use(authMiddleware);

router.get("/", billController.getBills);
router.post("/", billController.createBill);
router.post("/generate", billController.generateFromRecurring);
router.get("/:id", billController.getBillById);
router.put("/:id", billController.updateBill);
router.patch("/:id/pay", billController.payBill);
router.patch("/:id/unpay", billController.unpayBill);
router.delete("/:id", billController.deleteBill);

module.exports = router;
