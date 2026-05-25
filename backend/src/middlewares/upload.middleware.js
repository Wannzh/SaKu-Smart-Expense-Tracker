const multer = require("multer");
const { createError } = require("../utils/response");

/**
 * Multer config — simpan file di memori (buffer), bukan disk.
 * File buffer nanti dikonversi ke base64 lalu dikirim ke Gemini Vision.
 *
 * Batasan:
 * - Hanya menerima file gambar (jpeg, jpg, png, webp)
 * - Maksimal ukuran file: 5MB
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(400, "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
