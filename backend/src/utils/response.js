/**
 * Kirim response sukses dengan format standar
 * { success: true, message: "...", data: {...} }
 *
 * @param {import("express").Response} res
 * @param {number} statusCode - HTTP status code (200, 201, dll.)
 * @param {string} message
 * @param {*} [data] - Payload opsional
 */
const sendSuccess = (res, statusCode, message, data = undefined) => {
  const payload = { success: true, message };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Buat error dengan statusCode custom lalu lempar ke next(err)
 * Error middleware akan menangkap dan memformat response-nya
 *
 * @param {number} statusCode
 * @param {string} message
 * @returns {Error}
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

module.exports = { sendSuccess, createError };
