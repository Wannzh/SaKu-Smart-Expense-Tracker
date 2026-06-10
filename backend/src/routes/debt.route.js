const { Router } = require("express");
const debtController = require("../controllers/debt.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route utang & piutang butuh autentikasi
router.use(authMiddleware);

router.get("/", debtController.getDebts);
router.post("/", debtController.createDebt);
router.put("/:id", debtController.updateDebt);
router.patch("/:id/pay", debtController.payDebt);
router.delete("/:id", debtController.deleteDebt);

module.exports = router;
