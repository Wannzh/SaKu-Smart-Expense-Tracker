const receiptService = require("../services/receipt.service");
const { sendSuccess } = require("../utils/response");
const { createError } = require("../utils/response");

/**
 * POST /api/receipts/scan
 * Upload foto struk → OCR via Gemini Vision → return parsed data
 */
const scan = async (req, res, next) => {
  if (!req.file) {
    throw createError(400, "File gambar struk wajib diupload");
  }

  const { rawText, parsedData } = await receiptService.scanReceipt(
    req.file.buffer,
    req.file.mimetype
  );

  sendSuccess(res, 200, "Struk berhasil di-scan", { rawText, parsedData });
};

/**
 * POST /api/receipts/confirm
 * User konfirmasi hasil OCR → create transaction + save receipt
 */
const confirm = async (req, res, next) => {
  const { amount, type, description, date, categoryId, rawText, parsedData } = req.body;

  const transaction = await receiptService.confirmReceipt(req.user.id, {
    amount,
    type,
    description,
    date,
    categoryId,
    rawText,
    parsedData,
  });

  sendSuccess(res, 201, "Transaksi dari struk berhasil disimpan", { transaction });
};

module.exports = { scan, confirm };
