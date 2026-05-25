const jwt = require("jsonwebtoken");

/**
 * Generate JWT token berisi userId
 *
 * @param {string} userId
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Verify JWT token dan kembalikan payload
 *
 * @param {string} token
 * @returns {{ userId: string }} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Set JWT ke HttpOnly cookie bernama `saku_token`
 * - httpOnly: true  → tidak bisa diakses JavaScript di browser
 * - sameSite: "lax" → proteksi CSRF dasar
 * - secure: true hanya di production (HTTPS)
 *
 * @param {import("express").Response} res
 * @param {string} token
 */
const setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("saku_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari dalam ms
  });
};

/**
 * Hapus cookie `saku_token` (untuk logout)
 *
 * @param {import("express").Response} res
 */
const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("saku_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  });
};

module.exports = { generateToken, verifyToken, setTokenCookie, clearTokenCookie };
