/**
 * Global error handling middleware
 *
 * Menangkap semua error yang di-throw atau dikirim via next(err).
 * Express 5 otomatis catch async errors, jadi cukup throw/next(err) di controller/service.
 *
 * Response format selalu:
 * { success: false, message: "..." }
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log stack trace di development untuk debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${statusCode} — ${message}`);
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorMiddleware;
