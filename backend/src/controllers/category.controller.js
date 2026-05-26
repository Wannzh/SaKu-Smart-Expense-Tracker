const categoryService = require("../services/category.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/categories
 */
const getCategories = async (req, res, next) => {
  const categories = await categoryService.getCategories(req.user.id);
  sendSuccess(res, 200, "Daftar kategori berhasil diambil", { categories });
};

/**
 * POST /api/categories
 */
const createCategory = async (req, res, next) => {
  const { name, icon, color } = req.body;

  const category = await categoryService.createCategory(req.user.id, { name, icon, color });
  sendSuccess(res, 201, "Kategori berhasil dibuat", { category });
};

/**
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res, next) => {
  const { name, icon, color } = req.body;

  const category = await categoryService.updateCategory(req.user.id, req.params.id, { name, icon, color });
  sendSuccess(res, 200, "Kategori berhasil diperbarui", { category });
};

/**
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res, next) => {
  const category = await categoryService.deleteCategory(req.user.id, req.params.id);
  sendSuccess(res, 200, "Kategori berhasil dihapus", { category });
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
