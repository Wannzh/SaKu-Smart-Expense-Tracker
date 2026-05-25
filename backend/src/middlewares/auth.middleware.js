const { verifyToken } = require("../utils/token");
const { createError } = require("../utils/response");
const prisma = require("../config/prisma");

/**
 * Auth middleware — verifikasi JWT dari HttpOnly cookie `saku_token`
 *
 * Jika valid, attach user data ke `req.user` (tanpa password).
 * Jika tidak valid / tidak ada, lempar error 401 via createError.
 */
const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.saku_token;

  if (!token) {
    throw createError(401, "Akses ditolak. Silakan login terlebih dahulu");
  }

  try {
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw createError(401, "User tidak ditemukan. Token tidak valid");
    }

    req.user = user;
    next();
  } catch (error) {
    // Jika error sudah punya statusCode (dari createError), langsung lempar
    if (error.statusCode) {
      throw error;
    }

    // JWT expired / malformed
    throw createError(401, "Token tidak valid atau sudah kadaluarsa");
  }
};

module.exports = authMiddleware;
