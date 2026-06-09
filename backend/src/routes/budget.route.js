const { Router } = require("express");
const budgetController = require("../controllers/budget.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route anggaran butuh autentikasi
router.use(authMiddleware);

router.get("/", budgetController.getBudgets);
router.post("/", budgetController.upsertBudget);
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
