const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Ambil semua kategori: default (isDefault=true)
 *
 * @param {string} [type] - Optional: filter by "INCOME" | "EXPENSE"
 * @returns {Promise<object[]>}
 */
const getCategories = async (type) => {
  const where = {
    isDefault: true,
  };

  if (type) {
    where.type = type;
  }

  const categories = await prisma.category.findMany({
    where,
    include: {
      subCategories: {
        orderBy: {
          name: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

/**
 * Buat kategori custom milik user (DEPRECATED)
 */
const createCategory = async (userId, { name, icon, color }) => {
  throw createError(403, "Pembuatan kategori custom tidak didukung");
};

/**
 * Update kategori (DEPRECATED)
 */
const updateCategory = async (userId, categoryId, { name, icon, color }) => {
  throw createError(403, "Kategori default tidak bisa diubah");
};

/**
 * Hapus kategori (DEPRECATED)
 */
const deleteCategory = async (userId, categoryId) => {
  throw createError(403, "Kategori default tidak bisa dihapus");
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
