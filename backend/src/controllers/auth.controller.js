const authService = require("../services/auth.service");
const { sendSuccess } = require("../utils/response");
const { setTokenCookie, clearTokenCookie } = require("../utils/token");
const { uploadToCloudinary } = require("../utils/cloudinary");

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  const { user, token } = await authService.register({ name, email, password });

  setTokenCookie(res, token);
  sendSuccess(res, 201, "Registrasi berhasil", { user });
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  const { user, token } = await authService.login({ email, password });

  setTokenCookie(res, token);
  sendSuccess(res, 200, "Login berhasil", { user });
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  clearTokenCookie(res);
  sendSuccess(res, 200, "Logout berhasil");
};

/**
 * GET /api/auth/me (protected — req.user sudah di-attach authMiddleware)
 */
const getMe = async (req, res, next) => {
  sendSuccess(res, 200, "Data user berhasil diambil", { user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    
    let avatarUrl = undefined;
    if (req.file) {
      avatarUrl = await uploadToCloudinary(req.file.buffer, "avatar");
    }

    const user = await authService.updateProfile(userId, { name, avatar: avatarUrl });
    sendSuccess(res, 200, "Profil berhasil diperbarui", { user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, updateProfile };
