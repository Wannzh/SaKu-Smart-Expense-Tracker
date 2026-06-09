const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Get budgets for a user in a specific month and year
 * Includes calculated spent, percentage, remaining, and isOverBudget status.
 * Inherits templates from other months if no explicit budget exists for a category.
 * 
 * @param {string} userId 
 * @param {number} month 
 * @param {number} year 
 * @returns {Promise<object[]>}
 */
const getBudgets = async (userId, month, year) => {
  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);

  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw createError(400, "Bulan tidak valid");
  }
  if (isNaN(parsedYear) || parsedYear < 2000) {
    throw createError(400, "Tahun tidak valid");
  }

  // Construct start and end dates for query
  const startDate = new Date(parsedYear, parsedMonth - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

  // 1. Fetch explicit budgets for this month/year
  const explicitBudgets = await prisma.budget.findMany({
    where: {
      userId,
      month: parsedMonth,
      year: parsedYear,
    },
    include: {
      category: true,
    },
  });

  // 2. Fetch all budgets ever created by the user to find templates for other categories
  const allUserBudgets = await prisma.budget.findMany({
    where: {
      userId,
    },
    include: {
      category: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Group by categoryId to get the latest budget amount as a template
  const budgetTemplates = new Map();
  for (const b of allUserBudgets) {
    if (!budgetTemplates.has(b.categoryId)) {
      budgetTemplates.set(b.categoryId, b);
    }
  }

  // 3. Merge explicit and virtual budgets
  const mergedBudgets = [...explicitBudgets];
  const explicitCategoryIds = new Set(explicitBudgets.map((b) => b.categoryId));

  for (const [categoryId, template] of budgetTemplates.entries()) {
    if (!explicitCategoryIds.has(categoryId)) {
      // Create a virtual budget for the target month/year
      mergedBudgets.push({
        id: `virtual-${categoryId}`, // virtual ID format
        amount: template.amount,
        month: parsedMonth,
        year: parsedYear,
        userId,
        categoryId,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        category: template.category,
        isVirtual: true,
      });
    }
  }

  // Sort by category name asc
  mergedBudgets.sort((a, b) => a.category.name.localeCompare(b.category.name));

  // 4. Calculate spent amounts for each budget
  const budgetsWithCalculations = await Promise.all(
    mergedBudgets.map(async (budget) => {
      const expenseSum = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const spent = Number(expenseSum._sum.amount || 0);
      const amount = Number(budget.amount);
      const percentage = amount > 0 ? Number(((spent / amount) * 100).toFixed(2)) : 0;
      const remaining = Number((amount - spent).toFixed(2));
      const isOverBudget = spent > amount;

      return {
        ...budget,
        amount,
        spent,
        percentage,
        remaining,
        isOverBudget,
      };
    })
  );

  return budgetsWithCalculations;
};

/**
 * Create or update a budget (upsert)
 * 
 * @param {string} userId 
 * @param {object} data 
 * @returns {Promise<object>}
 */
const upsertBudget = async (userId, { categoryId, amount, month, year }) => {
  const parsedAmount = Number(amount);
  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);

  if (!categoryId) {
    throw createError(400, "Category ID harus diisi");
  }
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw createError(400, "Nominal anggaran harus lebih besar dari 0");
  }
  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw createError(400, "Bulan tidak valid");
  }
  if (isNaN(parsedYear) || parsedYear < 2000) {
    throw createError(400, "Tahun tidak valid");
  }

  // Validate that category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });
  if (!category) {
    throw createError(404, "Kategori tidak ditemukan");
  }

  const budget = await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId,
        month: parsedMonth,
        year: parsedYear,
      },
    },
    update: {
      amount: parsedAmount,
    },
    create: {
      userId,
      categoryId,
      amount: parsedAmount,
      month: parsedMonth,
      year: parsedYear,
    },
    include: {
      category: true,
    },
  });

  return {
    ...budget,
    amount: Number(budget.amount),
  };
};

/**
 * Delete a budget
 * 
 * @param {string} userId 
 * @param {string} budgetId 
 * @returns {Promise<object>}
 */
const deleteBudget = async (userId, budgetId) => {
  if (!budgetId) {
    throw createError(400, "Budget ID harus diisi");
  }

  // If deleting a virtual budget, delete all budgets for this category
  // so it doesn't get inherited anymore
  if (budgetId.startsWith("virtual-")) {
    const categoryId = budgetId.replace("virtual-", "");
    await prisma.budget.deleteMany({
      where: {
        userId,
        categoryId,
      },
    });

    return {
      id: budgetId,
      categoryId,
      amount: 0,
    };
  }

  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
  });

  if (!budget) {
    throw createError(404, "Anggaran tidak ditemukan");
  }

  if (budget.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses untuk menghapus anggaran ini");
  }

  const deleted = await prisma.budget.delete({
    where: { id: budgetId },
  });

  return {
    ...deleted,
    amount: Number(deleted.amount),
  };
};

module.exports = {
  getBudgets,
  upsertBudget,
  deleteBudget,
};
