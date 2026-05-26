const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Ambil semua kategori: default (isDefault=true) + milik user
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const getCategories = async (userId) => {
  const categories = await prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId },
      ],
    },
    orderBy: [
      { isDefault: "desc" },
      { name: "asc" },
    ],
  });

  return categories;
};

/**
 * Buat kategori custom milik user
 *
 * @param {string} userId
 * @param {{ name: string, icon?: string, color?: string }} data
 * @returns {Promise<object>}
 */
const createCategory = async (userId, { name, icon, color }) => {
  const category = await prisma.category.create({
    data: {
      name,
      icon,
      color,
      isDefault: false,
      userId,
    },
  });

  return category;
};

/**
 * Update kategori — hanya jika milik user (bukan default)
 *
 * @param {string} userId
 * @param {string} categoryId
 * @param {{ name?: string, icon?: string, color?: string }} data
 * @returns {Promise<object>}
 */
const updateCategory = async (userId, categoryId, { name, icon, color }) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw createError(404, "Kategori tidak ditemukan");
  }

  if (category.isDefault) {
    throw createError(403, "Kategori default tidak bisa diedit");
  }

  if (category.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke kategori ini");
  }

  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: { name, icon, color },
  });

  return updated;
};

/**
 * Hapus kategori — hanya jika milik user (bukan default)
 *
 * @param {string} userId
 * @param {string} categoryId
 * @returns {Promise<object>}
 */
const deleteCategory = async (userId, categoryId) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw createError(404, "Kategori tidak ditemukan");
  }

  if (category.isDefault) {
    throw createError(403, "Kategori default tidak bisa dihapus");
  }

  if (category.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke kategori ini");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return category;
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
