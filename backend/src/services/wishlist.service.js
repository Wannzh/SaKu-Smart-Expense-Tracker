const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Get all wishlists for a user with optional status and priority filters.
 * Returns both the list and a summary object.
 */
const getWishlists = async (userId, { status, priority } = {}) => {
  const where = { userId };
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const wishlists = await prisma.wishlist.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // Compute summary
  const all = await prisma.wishlist.findMany({ where: { userId } });
  const total = all.length;
  const active = all.filter((w) => w.status === "ACTIVE").length;
  const achieved = all.filter((w) => w.status === "ACHIEVED").length;

  let totalTargetPrice = 0;
  let totalSaved = 0;
  all.forEach((w) => {
    if (w.status === "ACTIVE") {
      totalTargetPrice += Number(w.targetPrice);
      totalSaved += Number(w.savedAmount);
    }
  });

  const mapped = wishlists.map((w) => ({
    ...w,
    targetPrice: Number(w.targetPrice),
    savedAmount: Number(w.savedAmount),
  }));

  return {
    wishlists: mapped,
    summary: { total, active, achieved, totalTargetPrice, totalSaved },
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
    savedAmount: Number(wishlist.savedAmount),
  };
};

/**
 * Create a new wishlist item.
 */
const createWishlist = async (userId, data) => {
  const { name, targetPrice, savedAmount, priority, imageUrl, productLink, notes, targetDate, walletId } = data;

  if (!name || !name.trim()) {
    throw createError(400, "Nama barang wajib diisi");
  }
  if (!targetPrice || Number(targetPrice) <= 0) {
    throw createError(400, "Harga target harus lebih besar dari 0");
  }

  const parsedTarget = Number(targetPrice);
  const parsedSaved = savedAmount ? Number(savedAmount) : 0;

  if (parsedSaved > 0 && !walletId) {
    throw createError(400, "Pilih dompet untuk menyimpan tabungan awal");
  }

  // Auto-achieve if saved already meets target
  let initialStatus = "ACTIVE";
  if (parsedSaved >= parsedTarget) {
    initialStatus = "ACHIEVED";
  }

  return prisma.$transaction(async (tx) => {
    if (parsedSaved > 0) {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");
      if (Number(wallet.balance) < parsedSaved) {
        throw createError(400, "Saldo dompet tidak mencukupi untuk tabungan awal");
      }

      // Deduct from wallet balance
      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: { decrement: parsedSaved },
        },
      });

      // Ensure wishlist category exists in DB
      let category = await tx.category.findUnique({ where: { id: "cat-wishlist" } });
      if (!category) {
        category = await tx.category.create({
          data: {
            id: "cat-wishlist",
            name: "Keinginan",
            icon: "Gift",
            color: "#6366F1",
            type: "EXPENSE",
            isDefault: false,
          },
        });
      }

      // Create a Transaction record
      await tx.transaction.create({
        data: {
          userId,
          amount: parsedSaved,
          type: "EXPENSE",
          description: `Tabungan Awal Keinginan: ${name.trim()}`,
          date: new Date(),
          walletId,
          categoryId: "cat-wishlist",
        },
      });
    }

    const wishlist = await tx.wishlist.create({
      data: {
        userId,
        name: name.trim(),
        targetPrice: parsedTarget,
        savedAmount: parsedSaved,
        priority: priority || "MEDIUM",
        status: initialStatus,
        imageUrl: imageUrl || null,
        productLink: productLink || null,
        notes: notes || null,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return {
      ...wishlist,
      targetPrice: Number(wishlist.targetPrice),
      savedAmount: Number(wishlist.savedAmount),
    };
  });
};

/**
 * Update a wishlist item (descriptive fields + status/priority).
 */
const updateWishlist = async (userId, id, data) => {
  const existing = await prisma.wishlist.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Keinginan tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.targetPrice !== undefined) updateData.targetPrice = Number(data.targetPrice);
  if (data.savedAmount !== undefined) updateData.savedAmount = Number(data.savedAmount);
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
  if (data.productLink !== undefined) updateData.productLink = data.productLink || null;
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.targetDate !== undefined) {
    updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
  }

  const wishlist = await prisma.wishlist.update({
    where: { id },
    data: updateData,
  });

  return {
    ...wishlist,
    targetPrice: Number(wishlist.targetPrice),
    savedAmount: Number(wishlist.savedAmount),
  };
};

/**
 * Add savings to a wishlist item.
 * If savedAmount >= targetPrice, auto-set status to ACHIEVED.
 */
const addSavings = async (userId, id, amount, walletId) => {
  const parsedAmount = Number(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    throw createError(400, "Jumlah tabungan harus lebih besar dari 0");
  }
  if (!walletId) {
    throw createError(400, "Pilih dompet untuk menambahkan tabungan");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.wishlist.findUnique({ where: { id } });
    if (!existing) throw createError(404, "Keinginan tidak ditemukan");
    if (existing.userId !== userId) throw createError(403, "Akses ditolak");
    if (existing.status !== "ACTIVE") {
      throw createError(400, "Hanya dapat menabung untuk keinginan yang masih aktif");
    }

    const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw createError(404, "Wallet tidak ditemukan");
    if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");
    if (Number(wallet.balance) < parsedAmount) {
      throw createError(400, "Saldo dompet tidak mencukupi");
    }

    // Deduct from wallet balance
    await tx.wallet.update({
      where: { id: walletId },
      data: {
        balance: { decrement: parsedAmount },
      },
    });

    // Ensure wishlist category exists in DB
    let category = await tx.category.findUnique({ where: { id: "cat-wishlist" } });
    if (!category) {
      category = await tx.category.create({
        data: {
          id: "cat-wishlist",
          name: "Keinginan",
          icon: "Gift",
          color: "#6366F1",
          type: "EXPENSE",
          isDefault: false,
        },
      });
    }

    // Create a Transaction record
    await tx.transaction.create({
      data: {
        userId,
        amount: parsedAmount,
        type: "EXPENSE",
        description: `Tabungan Keinginan: ${existing.name}`,
        date: new Date(),
        walletId,
        categoryId: "cat-wishlist",
      },
    });

    const newSaved = Number(existing.savedAmount) + parsedAmount;
    const targetPrice = Number(existing.targetPrice);
    const isAchieved = newSaved >= targetPrice;

    const wishlist = await tx.wishlist.update({
      where: { id },
      data: {
        savedAmount: newSaved,
        status: isAchieved ? "ACHIEVED" : "ACTIVE",
      },
    });

    return {
      ...wishlist,
      targetPrice: Number(wishlist.targetPrice),
      savedAmount: Number(wishlist.savedAmount),
    };
  });
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
  addSavings,
  deleteWishlist,
};
