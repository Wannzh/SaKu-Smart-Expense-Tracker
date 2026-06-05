const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route kategori butuh autentikasi
router.use(authMiddleware);

// GET /api/categories — default categories (INCOME or EXPENSE)
router.get("/", categoryController.getCategories);

module.exports = router;
