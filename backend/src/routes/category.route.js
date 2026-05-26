const { Router } = require("express");
const categoryController = require("../controllers/category.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route kategori butuh autentikasi
router.use(authMiddleware);

// GET /api/categories — default + user categories
router.get("/", categoryController.getCategories);

// POST /api/categories — buat kategori custom
router.post("/", categoryController.createCategory);

// PUT /api/categories/:id — edit kategori milik user
router.put("/:id", categoryController.updateCategory);

// DELETE /api/categories/:id — hapus kategori milik user
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
