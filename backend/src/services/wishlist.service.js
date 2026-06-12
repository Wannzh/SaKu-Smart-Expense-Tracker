const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Get all wishlists for a user with optional status filter.
 * Returns both the list and a summary object.
 */
const getWishlists = async (userId, { status } = {}) => {
  const where = { userId };
  if (status) where.status = status;

  const wishlists = await prisma.wishlist.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Compute summary
  const all = await prisma.wishlist.findMany({ where: { userId } });
  const totalItems = all.length;
  const activeCount = all.filter((w) => w.status === "ACTIVE").length;
  const achievedCount = all.filter((w) => w.status === "ACHIEVED").length;

  let totalValue = 0;
  all.forEach((w) => {
    if (w.status === "ACTIVE") {
      totalValue += Number(w.targetPrice);
    }
  });

  const mapped = wishlists.map((w) => ({
    ...w,
    targetPrice: Number(w.targetPrice),
  }));

  return {
    wishlists: mapped,
    summary: { totalItems, activeCount, achievedCount, totalValue },
  };
};

/**
 * Get a single wishlist by ID with ownership check.
 */
const getWishlistById = async (userId, id) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { id } });
  if (!wishlist) throw createError(404, "Keinginan tidak ditemukan");
  if (wishlist.userId !== userId) throw createError(403, "Akses ditolak");

  return {
    ...wishlist,
    targetPrice: Number(wishlist.targetPrice),
  };
};

/**
 * Create a new wishlist item.
 */
const createWishlist = async (userId, data) => {
  const { name, targetPrice, imageUrl, productLink, notes, targetDate } = data;

  if (!name || !name.trim()) {
    throw createError(400, "Nama barang wajib diisi");
  }
  if (!targetPrice || Number(targetPrice) <= 0) {
    throw createError(400, "Harga target harus lebih besar dari 0");
  }

  const parsedTarget = Number(targetPrice);

  const wishlist = await prisma.wishlist.create({
    data: {
      userId,
      name: name.trim(),
      targetPrice: parsedTarget,
      status: "ACTIVE",
      imageUrl: imageUrl || null,
      productLink: productLink || null,
      notes: notes || null,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  return {
    ...wishlist,
    targetPrice: Number(wishlist.targetPrice),
  };
};

/**
 * Update a wishlist item.
 */
const updateWishlist = async (userId, id, data) => {
  const existing = await prisma.wishlist.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Keinginan tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  const { status, ...allowedData } = data;

  const updateData = {};
  if (allowedData.name !== undefined) updateData.name = allowedData.name.trim();
  if (allowedData.targetPrice !== undefined) updateData.targetPrice = Number(allowedData.targetPrice);
  if (allowedData.imageUrl !== undefined) updateData.imageUrl = allowedData.imageUrl || null;
  if (allowedData.productLink !== undefined) updateData.productLink = allowedData.productLink || null;
  if (allowedData.notes !== undefined) updateData.notes = allowedData.notes || null;
  if (allowedData.targetDate !== undefined) {
    updateData.targetDate = allowedData.targetDate ? new Date(allowedData.targetDate) : null;
  }

  const wishlist = await prisma.wishlist.update({
    where: { id },
    data: updateData,
  });

  return {
    ...wishlist,
    targetPrice: Number(wishlist.targetPrice),
  };
};

/**
 * Mark a wishlist item as achieved.
 */
const markAsAchieved = async (userId, id) => {
  const existing = await prisma.wishlist.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Keinginan tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");
  if (existing.status !== "ACTIVE") {
    throw createError(400, "Hanya keinginan aktif yang bisa dibeli");
  }

  const wishlist = await prisma.wishlist.update({
    where: { id },
    data: { status: "ACHIEVED" },
  });

  return {
    ...wishlist,
    targetPrice: Number(wishlist.targetPrice),
  };
};

/**
 * Delete a wishlist item.
 */
const deleteWishlist = async (userId, id) => {
  const existing = await prisma.wishlist.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Keinginan tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  return prisma.wishlist.delete({ where: { id } });
};

module.exports = {
  getWishlists,
  getWishlistById,
  createWishlist,
  updateWishlist,
  markAsAchieved,
  deleteWishlist,
};
