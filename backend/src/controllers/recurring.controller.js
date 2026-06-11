const recurringService = require("../services/recurring.service");
const { sendSuccess } = require("../utils/response");
const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * Helper to clean empty string / null string representations from FormData body.
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
 * GET /api/recurrings
 */
const getRecurrings = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const result = await recurringService.getRecurrings(req.user.id, {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });
    sendSuccess(res, 200, "Daftar transaksi berulang berhasil diambil", result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/recurrings/:id
 */
const getRecurringById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurring = await recurringService.getRecurringById(req.user.id, id);
    sendSuccess(res, 200, "Detail transaksi berulang berhasil diambil", { recurring });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recurrings
 */
const createRecurring = async (req, res, next) => {
  try {
    let uploadedImageUrl = null;
    if (req.file) {
      uploadedImageUrl = await uploadToCloudinary(req.file.buffer, "recurring");
    }

    const cleanedData = parseBody(req.body);
    if (uploadedImageUrl) {
      cleanedData.iconUrl = uploadedImageUrl;
    }

    const recurring = await recurringService.createRecurring(req.user.id, cleanedData);
    sendSuccess(res, 201, "Transaksi berulang berhasil ditambahkan", { recurring });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/recurrings/:id
 */
const updateRecurring = async (req, res, next) => {
  try {
    const { id } = req.params;
    let uploadedImageUrl = undefined;
    if (req.file) {
      uploadedImageUrl = await uploadToCloudinary(req.file.buffer, "recurring");
    }

    const cleanedData = parseBody(req.body);
    if (uploadedImageUrl !== undefined) {
      cleanedData.iconUrl = uploadedImageUrl;
    }

    const recurring = await recurringService.updateRecurring(req.user.id, id, cleanedData);
    sendSuccess(res, 200, "Transaksi berulang berhasil diperbarui", { recurring });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/recurrings/:id/toggle
 */
const toggleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurring = await recurringService.toggleStatus(req.user.id, id);
    sendSuccess(res, 200, "Status transaksi berulang berhasil diubah", { recurring });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/recurrings/:id/execute
 */
const executeRecurring = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurring = await recurringService.executeRecurring(req.user.id, id);
    sendSuccess(res, 200, "Transaksi berulang berhasil dijalankan", { recurring });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/recurrings/:id
 */
const deleteRecurring = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurring = await recurringService.deleteRecurring(req.user.id, id);
    sendSuccess(res, 200, "Transaksi berulang berhasil dihapus", { recurring });
  } catch (error) {
    next(error);
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
};
