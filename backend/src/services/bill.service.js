const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

/**
 * Get all bills for a user in a specific month and year
 * Optional filter: status (UNPAID, PAID, OVERDUE)
 */
const getBills = async (userId, { month, year, status } = {}) => {
  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);

  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw createError(400, "Bulan tidak valid");
  }
  if (isNaN(parsedYear) || parsedYear < 2000) {
    throw createError(400, "Tahun tidak valid");
  }

  // Fetch all bills for that month & year in order to calculate correct status and summary metrics.
  // Dynamic status filtering is applied in-memory.
  const dbBills = await prisma.bill.findMany({
    where: {
      userId,
      month: parsedMonth,
      year: parsedYear,
    },
    include: {
      wallet: true,
      category: true,
      recurring: true,
    },
  });

  const today = new Date();

  // Process dynamic OVERDUE status and convert Decimals to Numbers
  let processedBills = dbBills.map(bill => {
    let currentStatus = bill.status;
    if (bill.status === "UNPAID" && new Date(bill.dueDate) < today) {
      currentStatus = "OVERDUE";
    }

    return {
      ...bill,
      status: currentStatus,
      amount: Number(bill.amount),
      paidAmount: bill.paidAmount !== null ? Number(bill.paidAmount) : null,
      wallet: bill.wallet ? {
        ...bill.wallet,
        balance: Number(bill.wallet.balance),
        initialBalance: Number(bill.wallet.initialBalance),
      } : null,
      recurring: bill.recurring ? {
        ...bill.recurring,
        amount: Number(bill.recurring.amount),
      } : null,
    };
  });

  // Calculate summary metrics on all processed bills for the month (before filtering)
  let totalUnpaid = 0;
  let totalPaid = 0;
  let countUnpaid = 0;
  let countPaid = 0;
  let countOverdue = 0;

  processedBills.forEach(bill => {
    if (bill.status === "PAID") {
      totalPaid += bill.amount;
      countPaid += 1;
    } else {
      totalUnpaid += bill.amount;
      countUnpaid += 1;
      if (bill.status === "OVERDUE") {
        countOverdue += 1;
      }
    }
  });

  // Apply status filter if provided
  if (status) {
    processedBills = processedBills.filter(bill => bill.status === status);
  }

  // Sort: OVERDUE first -> UNPAID by dueDate -> PAID last
  const statusOrder = { OVERDUE: 0, UNPAID: 1, PAID: 2 };
  processedBills.sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  return {
    bills: processedBills,
    summary: {
      totalUnpaid: Number(totalUnpaid.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      countUnpaid,
      countPaid,
      countOverdue,
    },
  };
};

/**
 * Get a single bill by ID
 */
const getBillById = async (userId, id) => {
  const bill = await prisma.bill.findUnique({
    where: { id },
    include: {
      wallet: true,
      category: true,
      recurring: true,
    },
  });

  if (!bill) {
    throw createError(404, "Tagihan tidak ditemukan");
  }
  if (bill.userId !== userId) {
    throw createError(403, "Akses ditolak");
  }

  const today = new Date();
  let currentStatus = bill.status;
  if (bill.status === "UNPAID" && new Date(bill.dueDate) < today) {
    currentStatus = "OVERDUE";
  }

  return {
    ...bill,
    status: currentStatus,
    amount: Number(bill.amount),
    paidAmount: bill.paidAmount !== null ? Number(bill.paidAmount) : null,
    wallet: bill.wallet ? {
      ...bill.wallet,
      balance: Number(bill.wallet.balance),
      initialBalance: Number(bill.wallet.initialBalance),
    } : null,
    recurring: bill.recurring ? {
      ...bill.recurring,
      amount: Number(bill.recurring.amount),
    } : null,
  };
};

/**
 * Create a new bill manually or via recurring source
 */
const createBill = async (userId, data) => {
  const { title, amount, dueDate, walletId, categoryId, recurringId, notes, autoRepeat, source } = data;

  if (!title || !title.trim()) {
    throw createError(400, "Judul tagihan wajib diisi");
  }
  if (!amount || Number(amount) <= 0) {
    throw createError(400, "Jumlah nominal harus lebih besar dari 0");
  }
  if (!dueDate) {
    throw createError(400, "Tanggal jatuh tempo wajib diisi");
  }

  // Validate wallet ownership
  if (walletId) {
    const wallet = await prisma.wallet.findUnique({ where: { id: walletId } });
    if (!wallet) throw createError(404, "Wallet tidak ditemukan");
    if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");
  }

  // Validate recurring ownership if recurringId is provided
  if (source === "RECURRING" && recurringId) {
    const recurring = await prisma.recurring.findUnique({ where: { id: recurringId } });
    if (!recurring) throw createError(404, "Transaksi berulang tidak ditemukan");
    if (recurring.userId !== userId) throw createError(403, "Akses transaksi berulang ditolak");
  }

  const parsedDueDate = new Date(dueDate);
  const month = parsedDueDate.getMonth() + 1;
  const year = parsedDueDate.getFullYear();

  const bill = await prisma.bill.create({
    data: {
      userId,
      title: title.trim(),
      amount: Number(amount),
      dueDate: parsedDueDate,
      status: "UNPAID",
      source: source || "MANUAL",
      recurringId: recurringId || null,
      walletId: walletId || null,
      categoryId: categoryId || null,
      notes: notes || null,
      autoRepeat: !!autoRepeat,
      month,
      year,
    },
    include: {
      wallet: true,
      category: true,
      recurring: true,
    },
  });

  return {
    ...bill,
    amount: Number(bill.amount),
    paidAmount: bill.paidAmount !== null ? Number(bill.paidAmount) : null,
    wallet: bill.wallet ? {
      ...bill.wallet,
      balance: Number(bill.wallet.balance),
    } : null,
  };
};

/**
 * Update bill details
 */
const updateBill = async (userId, id, data) => {
  const existing = await prisma.bill.findUnique({ where: { id } });
  if (!existing) throw createError(404, "Tagihan tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  const updateData = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.amount !== undefined) updateData.amount = Number(data.amount);
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.autoRepeat !== undefined) updateData.autoRepeat = !!data.autoRepeat;
  if (data.source !== undefined) updateData.source = data.source;

  if (data.walletId !== undefined) {
    if (data.walletId) {
      const wallet = await prisma.wallet.findUnique({ where: { id: data.walletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");
    }
    updateData.walletId = data.walletId || null;
  }

  if (data.categoryId !== undefined) {
    updateData.categoryId = data.categoryId || null;
  }

  if (data.recurringId !== undefined) {
    if (data.recurringId) {
      const recurring = await prisma.recurring.findUnique({ where: { id: data.recurringId } });
      if (!recurring) throw createError(404, "Transaksi berulang tidak ditemukan");
      if (recurring.userId !== userId) throw createError(403, "Akses transaksi berulang ditolak");
    }
    updateData.recurringId = data.recurringId || null;
  }

  if (data.dueDate !== undefined) {
    const parsedDueDate = new Date(data.dueDate);
    updateData.dueDate = parsedDueDate;
    updateData.month = parsedDueDate.getMonth() + 1;
    updateData.year = parsedDueDate.getFullYear();
  }

  const bill = await prisma.bill.update({
    where: { id },
    data: updateData,
    include: {
      wallet: true,
      category: true,
      recurring: true,
    },
  });

  return {
    ...bill,
    amount: Number(bill.amount),
    paidAmount: bill.paidAmount !== null ? Number(bill.paidAmount) : null,
    wallet: bill.wallet ? {
      ...bill.wallet,
      balance: Number(bill.wallet.balance),
    } : null,
  };
};

/**
 * Pay a bill: mark PAID, decrement wallet balance, and log EXPENSE transaction
 */
const payBill = async (userId, id, { walletId, paidAt } = {}) => {
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw createError(404, "Tagihan tidak ditemukan");
  if (bill.userId !== userId) throw createError(403, "Akses ditolak");
  if (bill.status === "PAID") throw createError(400, "Tagihan sudah lunas");

  const finalPaidAt = paidAt ? new Date(paidAt) : new Date();

  return await prisma.$transaction(async (tx) => {
    // If wallet is specified or default is present on bill
    const targetWalletId = walletId || bill.walletId;

    if (targetWalletId) {
      const wallet = await tx.wallet.findUnique({ where: { id: targetWalletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");

      // Decrement wallet balance
      await tx.wallet.update({
        where: { id: targetWalletId },
        data: { balance: { decrement: Number(bill.amount) } },
      });

      // Create general ledger expense transaction
      await tx.transaction.create({
        data: {
          userId,
          type: "EXPENSE",
          amount: Number(bill.amount),
          description: `Pembayaran: ${bill.title}`,
          date: finalPaidAt,
          walletId: targetWalletId,
          categoryId: bill.categoryId,
        },
      });
    }

    // Update bill status to PAID
    const updatedBill = await tx.bill.update({
      where: { id },
      data: {
        status: "PAID",
        paidAt: finalPaidAt,
        paidAmount: bill.amount,
        walletId: targetWalletId || null,
      },
      include: {
        wallet: true,
        category: true,
        recurring: true,
      },
    });

    return {
      ...updatedBill,
      amount: Number(updatedBill.amount),
      paidAmount: Number(updatedBill.paidAmount),
      wallet: updatedBill.wallet ? {
        ...updatedBill.wallet,
        balance: Number(updatedBill.wallet.balance),
      } : null,
    };
  });
};

/**
 * Revert bill payment: status back to UNPAID, refund wallet balance
 */
const unpayBill = async (userId, id) => {
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw createError(404, "Tagihan tidak ditemukan");
  if (bill.userId !== userId) throw createError(403, "Akses ditolak");
  if (bill.status !== "PAID") throw createError(400, "Tagihan belum lunas");

  return await prisma.$transaction(async (tx) => {
    // Refund wallet balance if paid with a wallet
    if (bill.walletId && bill.paidAmount) {
      const wallet = await tx.wallet.findUnique({ where: { id: bill.walletId } });
      if (wallet && wallet.userId === userId) {
        await tx.wallet.update({
          where: { id: bill.walletId },
          data: { balance: { increment: Number(bill.paidAmount) } },
        });
      }
    }

    // Update bill status to UNPAID
    const updatedBill = await tx.bill.update({
      where: { id },
      data: {
        status: "UNPAID",
        paidAt: null,
        paidAmount: null,
      },
      include: {
        wallet: true,
        category: true,
        recurring: true,
      },
    });

    return {
      ...updatedBill,
      amount: Number(updatedBill.amount),
      paidAmount: null,
      wallet: updatedBill.wallet ? {
        ...updatedBill.wallet,
        balance: Number(updatedBill.wallet.balance),
      } : null,
    };
  });
};

/**
 * Delete a bill
 */
const deleteBill = async (userId, id) => {
  const bill = await prisma.bill.findUnique({ where: { id } });
  if (!bill) throw createError(404, "Tagihan tidak ditemukan");
  if (bill.userId !== userId) throw createError(403, "Akses ditolak");

  const deleted = await prisma.bill.delete({
    where: { id },
  });

  return {
    ...deleted,
    amount: Number(deleted.amount),
  };
};

/**
 * Generate bills for a month/year based on ACTIVE recurring transaction plans
 */
const generateBillsFromRecurring = async (userId, month, year) => {
  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);

  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
    throw createError(400, "Bulan tidak valid");
  }
  if (isNaN(parsedYear) || parsedYear < 2000) {
    throw createError(400, "Tahun tidak valid");
  }

  // Ambil bulan target sebagai range tanggal
  const monthStart = new Date(parsedYear, parsedMonth - 1, 1);
  const monthEnd = new Date(parsedYear, parsedMonth, 0, 23, 59, 59, 999);

  // Get active recurrings for user
  const recurrings = await prisma.recurring.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  let createdCount = 0;

  for (const recurring of recurrings) {
    // Cek apakah bill dari recurring ini sudah ada
    // di bulan+tahun tersebut
    const existing = await prisma.bill.findFirst({
      where: {
        userId,
        recurringId: recurring.id,
        month: parsedMonth,
        year: parsedYear,
      },
    });

    if (!existing) {
      // Gunakan startDate untuk ambil tanggal dalam bulan
      // startDate tidak berubah setelah recurring dieksekusi
      const recurringStartDate = new Date(recurring.startDate);
      const day = recurringStartDate.getDate();
      const lastDay = new Date(parsedYear, parsedMonth, 0).getDate();
      const dueDate = new Date(
        parsedYear,
        parsedMonth - 1,
        Math.min(day, lastDay)
      );

      // Cek apakah recurring sudah dieksekusi di bulan ini
      // dengan melihat apakah ada transaksi dari recurring ini
      // yang tanggalnya jatuh di bulan target
      const existingTransaction = await prisma.transaction.findFirst({
        where: {
          userId,
          description: recurring.title,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          // Jika ada walletId, cocokkan juga
          ...(recurring.walletId && { 
            walletId: recurring.walletId 
          }),
        },
      });

      // Tentukan status bill berdasarkan apakah 
      // recurring sudah dieksekusi bulan ini
      const isAlreadyExecuted = !!existingTransaction;
      const billStatus = isAlreadyExecuted ? "PAID" : "UNPAID";
      const paidAt = isAlreadyExecuted 
        ? existingTransaction.date 
        : null;
      const paidAmount = isAlreadyExecuted 
        ? recurring.amount 
        : null;

      await prisma.bill.create({
        data: {
          userId,
          title: recurring.title,
          amount: recurring.amount,
          dueDate,
          month: parsedMonth,
          year: parsedYear,
          source: "RECURRING",
          recurringId: recurring.id,
          walletId: recurring.walletId,
          categoryId: recurring.categoryId,
          autoRepeat: true,
          // Set PAID jika sudah ada transaksinya
          status: billStatus,
          paidAt,
          paidAmount,
        },
      });

      createdCount++;
    }
  }

  return createdCount;
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  updateBill,
  payBill,
  unpayBill,
  deleteBill,
  generateBillsFromRecurring,
};
