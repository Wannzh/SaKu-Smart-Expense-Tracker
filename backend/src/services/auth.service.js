const prisma = require("../config/prisma");
const argon2 = require("argon2");
const { generateToken } = require("../utils/token");
const { createError } = require("../utils/response");

/**
 * Select fields untuk user response (tanpa password)
 */
const userSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
};

/**
 * Register user baru
 *
 * @param {{ name: string, email: string, password: string }} data
 * @returns {Promise<{ user: object, token: string }>}
 */
const register = async ({ name, email, password }) => {
  // Cek email duplikat
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw createError(409, "Email sudah terdaftar");
  }

  // Hash password dengan argon2
  const hashedPassword = await argon2.hash(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: userSelect,
  });

  // Generate JWT
  const token = generateToken(user.id);

  return { user, token };
};

/**
 * Login user
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: object, token: string }>}
 */
const login = async ({ email, password }) => {
  // Cek user exist (perlu include password untuk verifikasi)
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createError(401, "Email atau password salah");
  }

  // Verify password dengan argon2
  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw createError(401, "Email atau password salah");
  }

  // Generate JWT
  const token = generateToken(user.id);

  // Return user tanpa password
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

/**
 * Update profile user
 *
 * @param {string} userId
 * @param {{ name: string }} data
 * @returns {Promise<object>}
 */
const updateProfile = async (userId, { name, avatar }) => {
  const updateData = {};
  if (name !== undefined) {
    if (!name || !name.trim()) {
      throw createError(400, "Nama harus diisi");
    }
    updateData.name = name.trim();
  }
  if (avatar !== undefined) {
    updateData.avatar = avatar;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: userSelect,
  });

  return updatedUser;
};

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Sanitize user object (remove password)
 */
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const googleLogin = async (idToken) => {
  // Verify Google token
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, picture, sub: googleId } = payload;

  if (!email) {
    throw createError(400, "Email tidak ditemukan dari akun Google");
  }

  // Cari user berdasarkan email
  let user = await prisma.user.findUnique({ where: { email } });
  const userExists = !!user;

  if (!user) {
    // Auto-register jika belum ada
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split("@")[0],
        password: "", // kosong karena OAuth
        avatar: picture || null,
      },
    });
  } else {
    // Update avatar jika ada dari Google
    if (picture && !user.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: picture },
      });
    }
  }

  // Generate JWT sama seperti login biasa
  const token = generateToken(user.id);

  return { user: sanitizeUser(user), token, isNewUser: !userExists };
};

module.exports = { register, login, updateProfile, googleLogin };
