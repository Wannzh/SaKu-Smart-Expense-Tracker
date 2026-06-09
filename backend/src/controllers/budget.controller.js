const budgetService = require("../services/budget.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/budgets
 * Retrieves budgets for the specified month and year, defaults to current month/year.
 */
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month, 10) : (now.getMonth() + 1);
    const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();

    const budgets = await budgetService.getBudgets(req.user.id, month, year);
    sendSuccess(res, 200, "Daftar anggaran berhasil diambil", { budgets });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/budgets
 * Creates or updates (upserts) a budget.
 */
const upsertBudget = async (req, res, next) => {
  try {
    const { categoryId, amount, month, year } = req.body;
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) : (now.getMonth() + 1);
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();

    const budget = await budgetService.upsertBudget(req.user.id, {
      categoryId,
      amount,
      month: targetMonth,
      year: targetYear,
    });

    sendSuccess(res, 200, "Anggaran berhasil disimpan", { budget });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/budgets/:id
 * Deletes a budget.
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budgetId = req.params.id;
    const budget = await budgetService.deleteBudget(req.user.id, budgetId);
    sendSuccess(res, 200, "Anggaran berhasil dihapus", { budget });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  upsertBudget,
  deleteBudget,
};
