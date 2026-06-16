const prisma = require("../config/prisma");
const { createError } = require("../utils/response");
const { calculateNextRunDate } = require("../utils/recurring");
const dayjs = require("dayjs");

/**
 * Get all recurring transactions for a user.
 * Optional filter: month & year (for calendar view matching nextRunDate).
 */
const getRecurrings = async (userId, { month, year } = {}) => {
  const where = { userId };

  if (month && year) {
    const startDate = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const endDate = dayjs(`${year}-${month}-01`).endOf("month").toDate();
    where.nextRunDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  const recurrings = await prisma.recurring.findMany({
    where,
    include: {
      wallet: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate monthly commitment for the month:
  // total amount of all ACTIVE expensing recurrings in that month
  let monthlyCommitment = 0;
  recurrings.forEach((r) => {
    if (r.status === "ACTIVE" && r.type === "EXPENSE") {
      monthlyCommitment += Number(r.amount);
    }
  });

  // Get overall active count for the user
  const activeCount = await prisma.recurring.count({
    where: { userId, status: "ACTIVE" },
  });

  const mapped = recurrings.map((r) => ({
    ...r,
    amount: Number(r.amount),
  }));

  return {
    recurrings: mapped,
    activeCount,
    monthlyCommitment,
  };
};

/**
 * Get a single recurring transaction by ID with ownership check.
 */
const getRecurringById = async (userId, id) => {
  const recurring = await prisma.recurring.findUnique({
    where: { id },
    include: {
      wallet: true,
      category: true,
    },
  });

  if (!recurring) throw createError(404, "Transaksi berulang tidak ditemukan");
  if (recurring.userId !== userId) throw createError(403, "Akses ditolak");

  return {
    ...recurring,
    amount: Number(recurring.amount),
  };
};

/**
 * Create a new recurring transaction template.
 */
const createRecurring = async (userId, data) => {
  const { title, amount, type, frequency, startDate, endDate, iconUrl, walletId, categoryId } = data;

  if (!title || !title.trim()) {
    throw createError(400, "Judul wajib diisi");
  }
  if (!amount || Number(amount) <= 0) {
    throw createError(400, "Jumlah nominal harus lebih besar dari 0");
  }
  if (!startDate) {
    throw createError(400, "Tanggal mulai wajib ditentukan");
  }

  // Validate walletId if provided
  if (walletId) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw createError(404, "Wallet tidak ditemukan");
    if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");
  }

  const parsedStart = new Date(startDate);
  const parsedEnd = endDate ? new Date(endDate) : null;

  const recurring = await prisma.recurring.create({
    data: {
      userId,
      title: title.trim(),
      amount: Number(amount),
      type,
      frequency: frequency || "MONTHLY",
      startDate: parsedStart,
      endDate: parsedEnd,
      nextRunDate: parsedStart, // initially set nextRunDate to startDate
      iconUrl: iconUrl || null,
      walletId: walletId || null,
      categoryId: categoryId || null,
      status: "ACTIVE",
    },
  });

  return {
    ...recurring,
    amount: Number(recurring.amount),
  };
};

/**
 * Update recurring transaction template.
 * If startDate or frequency changes, recalculate nextRunDate.
 */
const updateRecurring = async (userId, id, data) => {
  const existing = await prisma.recurring.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Transaksi berulang tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.amount !== undefined) updateData.amount = Number(data.amount);
  if (data.type !== undefined) updateData.type = data.type;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.iconUrl !== undefined) updateData.iconUrl = data.iconUrl || null;
  if (data.walletId !== undefined) {
    if (data.walletId) {
      const wallet = await prisma.wallet.findUnique({ where: { id: data.walletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");
    }
    updateData.walletId = data.walletId || null;
  }
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;
  if (data.status !== undefined) updateData.status = data.status;

  // Recalculate nextRunDate if startDate or frequency changes
  if (data.startDate !== undefined || data.frequency !== undefined) {
    const finalStart = data.startDate !== undefined ? new Date(data.startDate) : existing.startDate;
    // Set nextRunDate back to the new startDate
    updateData.nextRunDate = finalStart;
  }

  const updatedRecurring = await prisma.recurring.update({
    where: { id },
    data: updateData,
  });

  // Sync bill yang terhubung jika startDate berubah
  if (data.startDate !== undefined) {
    const linkedBill = await prisma.bill.findFirst({
      where: {
        recurringId: id,
        status: { not: "PAID" }
      },
      orderBy: { dueDate: "asc" }
    });

    if (linkedBill) {
      // Ambil tanggal dari startDate yang baru
      const newStartDate = new Date(data.startDate);
      const billDueDate = new Date(linkedBill.dueDate);
      
      // Update hanya tanggal dalam bulan yang sama
      // pertahankan bulan dan tahun dari bill lama
      const newDueDate = new Date(
        billDueDate.getFullYear(),
        billDueDate.getMonth(),
        newStartDate.getDate() // ambil tanggal dari startDate baru
      );

      await prisma.bill.update({
        where: { id: linkedBill.id },
        data: { dueDate: newDueDate }
      });
    }
  }

  return {
    ...updatedRecurring,
    amount: Number(updatedRecurring.amount),
  };
};

/**
 * Toggle recurring status between ACTIVE and INACTIVE.
 */
const toggleStatus = async (userId, id) => {
  const existing = await prisma.recurring.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Transaksi berulang tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  const newStatus = existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

  const recurring = await prisma.recurring.update({
    where: { id },
    data: { status: newStatus },
  });

  return {
    ...recurring,
    amount: Number(recurring.amount),
  };
};

/**
 * Execute a recurring transaction manually.
 * Creates a general Transaction ledger entry, updates wallet balance atomically, and updates nextRunDate.
 */
const executeRecurring = async (userId, id, isAuto = false) => {
  return prisma.$transaction(async (tx) => {
    const recurring = await tx.recurring.findUnique({ where: { id } });
    if (!recurring) throw createError(404, "Transaksi berulang tidak ditemukan");
    if (recurring.userId !== userId) throw createError(403, "Akses ditolak");
    if (recurring.status !== "ACTIVE") {
      throw createError(400, "Transaksi berulang sedang dinonaktifkan");
    }

    const parsedAmount = Number(recurring.amount);

    // Update wallet balance if walletId is present
    if (recurring.walletId) {
      const wallet = await tx.wallet.findUnique({ where: { id: recurring.walletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");

      // Check balance if type is EXPENSE and NOT auto-executed
      if (!isAuto && recurring.type === "EXPENSE" && Number(wallet.balance) < parsedAmount) {
        throw createError(400, "Saldo dompet tidak mencukupi");
      }

      const increment = recurring.type === "INCOME" ? parsedAmount : -parsedAmount;
      await tx.wallet.update({
        where: { id: recurring.walletId },
        data: { balance: { increment } },
      });
    }

    // Ambil kategori "Lainnya" sebagai fallback
    let categoryId = recurring.categoryId;

    if (!categoryId) {
      const defaultCategory = await tx.category.findFirst({
        where: {
          type: recurring.type,
          name: { contains: "Lainnya", mode: "insensitive" }
        }
      });
      // Jika tidak ada "Lainnya", gunakan kategori pertama yang ada
      if (!defaultCategory) {
        const firstCategory = await tx.category.findFirst({
          where: { 
            type: recurring.type 
          }
        });
        categoryId = firstCategory?.id || null;
      } else {
        categoryId = defaultCategory.id;
      }
    }

    // Create a Transaction record
    await tx.transaction.create({
      data: {
        userId,
        amount: parsedAmount,
        type: recurring.type,
        description: recurring.title,
        date: new Date(),
        walletId: recurring.walletId,
        categoryId, // ← gunakan yang sudah di-resolve
      },
    });

    // Calculate next run date
    const nextDate = calculateNextRunDate(recurring.nextRunDate, recurring.frequency);
    let newStatus = recurring.status;

    // Check if nextDate exceeds endDate (if defined)
    if (recurring.endDate && nextDate > new Date(recurring.endDate)) {
      newStatus = "INACTIVE";
    }

    const updatedRecurring = await tx.recurring.update({
      where: { id },
      data: {
        nextRunDate: nextDate,
        status: newStatus,
      },
    });

    const now = new Date();

    // Cari bill yang terhubung ke recurring ini
    // yang belum PAID, tanpa filter bulan/tahun
    // karena bill mungkin dibuat untuk bulan berbeda
    const linkedBill = await tx.bill.findFirst({
      where: {
        recurringId: id,
        status: { not: "PAID" }
      },
      orderBy: { dueDate: "asc" } // ambil yang paling dekat dulu
    });

    // Jika ada, mark sebagai PAID
    if (linkedBill) {
      await tx.bill.update({
        where: { id: linkedBill.id },
        data: {
          status: "PAID",
          paidAt: now,
          paidAmount: linkedBill.amount
        }
      });
    }

    return {
      ...updatedRecurring,
      amount: Number(updatedRecurring.amount),
    };
  });
};

/**
 * Delete a recurring transaction.
 */
const deleteRecurring = async (userId, id) => {
  const existing = await prisma.recurring.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Transaksi berulang tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  return prisma.recurring.delete({ where: { id } });
};

/**
 * Auto-execute active due recurring transactions for a user.
 */
const autoExecuteDueRecurrings = async (userId) => {
  const now = new Date();
  const dueRecurrings = await prisma.recurring.findMany({
    where: {
      userId,
      status: "ACTIVE",
      nextRunDate: {
        lte: now,
      },
    },
  });

  if (dueRecurrings.length === 0) return;

  for (const recurring of dueRecurrings) {
    try {
      await executeRecurring(userId, recurring.id, true);
      console.log(`[AutoRecurring] Automatically executed due recurring transaction: "${recurring.title}" for user ${userId}`);
    } catch (err) {
      console.error(`[AutoRecurring] Error executing due recurring "${recurring.title}" for user ${userId}:`, err.message);
    }
  }
};

/**
 * Auto-execute active due recurring transactions for ALL users (global background check).
 */
const autoExecuteAllDueRecurrings = async () => {
  const now = new Date();
  const dueRecurrings = await prisma.recurring.findMany({
    where: {
      status: "ACTIVE",
      nextRunDate: {
        lte: now,
      },
    },
  });

  if (dueRecurrings.length === 0) return;

  for (const recurring of dueRecurrings) {
    try {
      await executeRecurring(recurring.userId, recurring.id, true);
      console.log(`[AutoRecurring] Automatically executed due recurring transaction: "${recurring.title}" for user ${recurring.userId}`);
    } catch (err) {
      console.error(`[AutoRecurring] Error executing due recurring "${recurring.title}" for user ${recurring.userId}:`, err.message);
    }
  }
};

module.exports = {
  getRecurrings,
  getRecurringById,
  createRecurring,
  updateRecurring,
  toggleStatus,
  executeRecurring,
  deleteRecurring,
  autoExecuteDueRecurrings,
  autoExecuteAllDueRecurrings,
};
