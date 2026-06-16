const billService = require("../services/bill.service");
const { sendSuccess } = require("../utils/response");

/**
 * Helper to clean empty string / null string representations from request body.
 */
const parseBody = (body) => {
  const parsed = { ...body };
  for (const key in parsed) {
    if (parsed[key] === "null" || parsed[key] === "undefined" || parsed[key] === "") {
      parsed[key] = null;
    }
  }
  return parsed;
};

/**
 * GET /api/bills
 */
const getBills = async (req, res, next) => {
  try {
    const { month, year, status } = req.query;
    const result = await billService.getBills(req.user.id, {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      status: status || undefined,
    });
    sendSuccess(res, 200, "Daftar tagihan berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bills/:id
 */
const getBillById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await billService.getBillById(req.user.id, id);
    sendSuccess(res, 200, "Detail tagihan berhasil diambil", { bill });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bills
 */
const createBill = async (req, res, next) => {
  try {
    const cleanedData = parseBody(req.body);
    const bill = await billService.createBill(req.user.id, cleanedData);
    sendSuccess(res, 201, "Tagihan berhasil ditambahkan", { bill });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bills/:id
 */
const updateBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cleanedData = parseBody(req.body);
    const bill = await billService.updateBill(req.user.id, id, cleanedData);
    sendSuccess(res, 200, "Tagihan berhasil diperbarui", { bill });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bills/:id/pay
 */
const payBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { walletId, paidAt } = req.body;
    const bill = await billService.payBill(req.user.id, id, { walletId, paidAt });
    sendSuccess(res, 200, "Tagihan berhasil dilunasi", { bill });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/bills/:id/unpay
 */
const unpayBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await billService.unpayBill(req.user.id, id);
    sendSuccess(res, 200, "Pembayaran tagihan berhasil dibatalkan", { bill });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/bills/:id
 */
const deleteBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bill = await billService.deleteBill(req.user.id, id);
    sendSuccess(res, 200, "Tagihan berhasil dihapus", { bill });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bills/generate
 */
const generateFromRecurring = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const count = await billService.generateBillsFromRecurring(req.user.id, month, year);
    sendSuccess(res, 200, "Tagihan dari rencana berulang berhasil dibuat", { count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  updateBill,
  payBill,
  unpayBill,
  deleteBill,
  generateFromRecurring,
};
