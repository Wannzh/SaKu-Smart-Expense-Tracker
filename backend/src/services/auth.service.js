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

module.exports = { register, login };
