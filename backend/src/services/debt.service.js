const prisma = require("../config/prisma");
const { createError } = require("../utils/response");

const getOrCreateDebtCategory = async (tx, transactionType, action) => {
  const catId = transactionType === "INCOME" ? "cat-utang-in" : "cat-utang";
  const catName = "Utang";
  const catIcon = "HandCoins";
  const catColor = transactionType === "INCOME" ? "#10B981" : "#EF4444";

  let category = await tx.category.findUnique({ where: { id: catId } });
  if (!category) {
    category = await tx.category.create({
      data: {
        id: catId,
        name: catName,
        icon: catIcon,
        color: catColor,
        isDefault: true,
        type: transactionType,
      },
    });
  }

  let subId = "";
  let subName = "";
  if (action === "BORROW") {
    subId = "sub-utang-pinjaman-diterima";
    subName = "Pinjaman Diterima";
  } else if (action === "LEND") {
    subId = "sub-utang-pinjaman-diberikan";
    subName = "Pinjaman Diberikan";
  } else if (action === "PAY") {
    subId = "sub-utang-bayar-hutang";
    subName = "Bayar Hutang";
  } else if (action === "RECEIVE") {
    subId = "sub-utang-terima-pembayaran";
    subName = "Terima Pembayaran";
  }

  let subCategory = await tx.subCategory.findUnique({ where: { id: subId } });
  if (!subCategory) {
    subCategory = await tx.subCategory.create({
      data: {
        id: subId,
        name: subName,
        categoryId: catId,
      },
    });
  }

  return { categoryId: catId, subCategoryId: subId };
};

/**
 * Get all debts/loans for a user with optional type and status filters.
 * Automatically checks and updates status to OVERDUE if dueDate is past.
 */
const getDebts = async (userId, { type, status }) => {
  const now = new Date();

  // 1. Auto-update status to OVERDUE for active debts whose due date has passed
  const activeOverdueDebts = await prisma.debt.findMany({
    where: {
      userId,
      status: "ACTIVE",
      dueDate: { lt: now },
    },
  });

  if (activeOverdueDebts.length > 0) {
    await prisma.debt.updateMany({
      where: {
        id: { in: activeOverdueDebts.map((d) => d.id) },
      },
      data: { status: "OVERDUE" },
    });
  }

  // 2. Query debts
  const where = { userId };
  if (type) where.type = type;
  if (status) where.status = status;

  const debts = await prisma.debt.findMany({
    where,
    include: {
      wallet: {
        select: {
          id: true,
          name: true,
          type: true,
          color: true,
        },
      },
    },
    orderBy: { borrowDate: "desc" },
  });

  // 3. Map to compute remainingAmount
  return debts.map((debt) => {
    const amount = Number(debt.amount);
    const paidAmount = Number(debt.paidAmount);
    return {
      ...debt,
      amount,
      paidAmount,
      remainingAmount: Math.max(0, amount - paidAmount),
    };
  });
};

/**
 * Create a new debt or loan record.
 * Subtracts the amount from the selected wallet balance atomically.
 */
const createDebt = async (userId, { type, personName, amount, notes, borrowDate, dueDate, walletId }) => {
  if (!personName || !personName.trim()) {
    throw createError(400, "Nama orang wajib diisi");
  }
  if (!amount || Number(amount) <= 0) {
    throw createError(400, "Nominal harus lebih besar dari 0");
  }
  if (!borrowDate) {
    throw createError(400, "Tanggal pinjam wajib diisi");
  }

  const parseAmount = Number(amount);
  const borrowDateTime = new Date(borrowDate);
  const dueDateTime = dueDate ? new Date(dueDate) : null;

  // Tentukan status awal (jika due date sudah terlewat sejak awal)
  let initialStatus = "ACTIVE";
  if (dueDateTime && dueDateTime < new Date()) {
    initialStatus = "OVERDUE";
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create debt record
    const debt = await tx.debt.create({
      data: {
        type,
        status: initialStatus,
        personName,
        amount: parseAmount,
        notes: notes || null,
        borrowDate: borrowDateTime,
        dueDate: dueDateTime,
        walletId: walletId || null,
        userId,
      },
      include: { wallet: true },
    });

    // 2. Update wallet balance:
    // Jika type === "DEBT" (user berhutang, terima uang) → INCREMENT
    // Jika type === "LOAN" (user meminjamkan, keluarkan uang) → DECREMENT
    if (walletId) {
      const wallet = await tx.wallet.findUnique({ where: { id: walletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");

      const walletIncrement = type === "DEBT"
        ? parseAmount   // DEBT: saldo bertambah
        : -parseAmount; // LOAN: saldo berkurang

      await tx.wallet.update({
        where: { id: walletId },
        data: {
          balance: { increment: walletIncrement },
        },
      });

      // 2b. Create transaction record
      const transactionType = type === "DEBT" ? "INCOME" : "EXPENSE";
      const transactionDesc = type === "DEBT"
        ? `Pinjam dari ${personName} [Ref: ${debt.id}]`
        : `Pinjamkan ke ${personName} [Ref: ${debt.id}]`;

      const action = type === "DEBT" ? "BORROW" : "LEND";
      const { categoryId, subCategoryId } = await getOrCreateDebtCategory(tx, transactionType, action);

      await tx.transaction.create({
        data: {
          amount: parseAmount,
          type: transactionType,
          description: transactionDesc,
          date: borrowDateTime,
          userId,
          walletId,
          categoryId,
          subCategoryId,
        },
      });
    }

    return debt;
  });
};

/**
 * Update debt info (only descriptive/non-financial parameters like notes, date metadata)
 */
const updateDebt = async (userId, debtId, { personName, notes, borrowDate, dueDate }) => {
  const existing = await prisma.debt.findUnique({ where: { id: debtId } });
  if (!existing) throw createError(404, "Data utang/piutang tidak ditemukan");
  if (existing.userId !== userId) throw createError(403, "Akses ditolak");

  const updateData = {};
  if (personName !== undefined) updateData.personName = personName;
  if (notes !== undefined) updateData.notes = notes;
  if (borrowDate !== undefined) updateData.borrowDate = new Date(borrowDate);
  
  if (dueDate !== undefined) {
    updateData.dueDate = dueDate ? new Date(dueDate) : null;
    // Auto-update status if the due date is changed
    if (existing.status !== "PAID") {
      const now = new Date();
      if (dueDate && new Date(dueDate) < now) {
        updateData.status = "OVERDUE";
      } else {
        updateData.status = "ACTIVE";
      }
    }
  }

  const debt = await prisma.debt.update({
    where: { id: debtId },
    data: updateData,
    include: { wallet: true },
  });

  return debt;
};

/**
 * Record a payment/installment on a debt or loan.
 * Updates the debt status to PAID if fully paid.
 * Adds the payment amount to the selected wallet balance atomically.
 */
const payDebt = async (userId, debtId, { paidAmount, walletId }) => {
  const paymentAmount = Number(paidAmount);
  if (!paymentAmount || paymentAmount <= 0) {
    throw createError(400, "Nominal pelunasan harus lebih besar dari 0");
  }

  return prisma.$transaction(async (tx) => {
    const existing = await tx.debt.findUnique({ where: { id: debtId } });
    if (!existing) throw createError(404, "Data utang/piutang tidak ditemukan");
    if (existing.userId !== userId) throw createError(403, "Akses ditolak");
    if (existing.status === "PAID") throw createError(400, "Utang/piutang sudah lunas");

    const amount = Number(existing.amount);
    const currentPaid = Number(existing.paidAmount);
    const newPaid = currentPaid + paymentAmount;

    if (newPaid > amount) {
      throw createError(400, `Nominal melebihi sisa utang/piutang (Sisa: Rp ${amount - currentPaid})`);
    }

    const isFullyPaid = newPaid >= amount;

    // 1. Update debt record
    const debt = await tx.debt.update({
      where: { id: debtId },
      data: {
        paidAmount: newPaid,
        paymentsCount: { increment: 1 },
        status: isFullyPaid ? "PAID" : existing.status,
        paidDate: isFullyPaid ? new Date() : null,
      },
      include: { wallet: true },
    });

    // 2. Update wallet balance:
    // Jika type === "DEBT" (user bayar hutang, keluarkan uang) → DECREMENT
    // Jika type === "LOAN" (user terima uang kembali) → INCREMENT
    const activeWalletId = walletId || existing.walletId;
    if (activeWalletId) {
      const wallet = await tx.wallet.findUnique({ where: { id: activeWalletId } });
      if (!wallet) throw createError(404, "Wallet tidak ditemukan");
      if (wallet.userId !== userId) throw createError(403, "Akses wallet ditolak");

      const walletIncrement = existing.type === "DEBT"
        ? -paymentAmount  // DEBT: saldo berkurang saat bayar
        : paymentAmount;  // LOAN: saldo bertambah saat terima

      await tx.wallet.update({
        where: { id: activeWalletId },
        data: {
          balance: { increment: walletIncrement },
        },
      });

      // 2b. Create payment transaction record
      const transactionType = existing.type === "DEBT" ? "EXPENSE" : "INCOME";
      const transactionDesc = existing.type === "DEBT"
        ? `Bayar hutang ke ${existing.personName} [Ref: ${debtId}]`
        : `Terima pembayaran dari ${existing.personName} [Ref: ${debtId}]`;

      const action = existing.type === "DEBT" ? "PAY" : "RECEIVE";
      const { categoryId, subCategoryId } = await getOrCreateDebtCategory(tx, transactionType, action);

      await tx.transaction.create({
        data: {
          amount: paymentAmount,
          type: transactionType,
          description: transactionDesc,
          date: new Date(),
          userId,
          walletId: activeWalletId,
          categoryId,
          subCategoryId,
        },
      });
    }

    return debt;
  });
};

/**
 * Delete a debt or loan record.
 * Reverses the remaining net wallet balance updates atomically.
 */
const deleteDebt = async (userId, debtId) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.debt.findUnique({ where: { id: debtId } });
    if (!existing) throw createError(404, "Data utang/piutang tidak ditemukan");
    if (existing.userId !== userId) throw createError(403, "Akses ditolak");

    // Reverse wallet balance:
    // DEBT saat create → INCREMENT, jadi reverse → DECREMENT
    // LOAN saat create → DECREMENT, jadi reverse → INCREMENT
    if (existing.walletId) {
      const wallet = await tx.wallet.findUnique({ where: { id: existing.walletId } });
      if (wallet) {
        const remainingUnpaid = Number(existing.amount) - Number(existing.paidAmount);
        const reverseIncrement = existing.type === "DEBT"
          ? -remainingUnpaid  // reverse DEBT: mengurangi sisa saldo dari wallet
          : remainingUnpaid;  // reverse LOAN: mengembalikan sisa saldo ke wallet

        if (reverseIncrement !== 0) {
          await tx.wallet.update({
            where: { id: existing.walletId },
            data: {
              balance: { increment: reverseIncrement },
            },
          });
        }
      }
    }

    // Delete associated transactions
    await tx.transaction.deleteMany({
      where: {
        userId,
        description: {
          contains: `[Ref: ${debtId}]`,
        },
      },
    });

    // Delete record
    return tx.debt.delete({ where: { id: debtId } });
  });
};

module.exports = {
  getDebts,
  createDebt,
  updateDebt,
  payDebt,
  deleteDebt,
};
