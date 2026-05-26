const prisma = require("../config/prisma");
const { getOCRModel } = require("../config/gemini");
const { createError } = require("../utils/response");

/**
 * Prompt untuk Gemini Vision — extract data dari foto struk
 */
const OCR_PROMPT = `Kamu adalah asisten OCR untuk struk belanja.
Analisis gambar struk ini dan extract informasi berikut dalam format JSON (tanpa markdown code block):

{
  "merchant": "nama toko/merchant",
  "items": [
    { "name": "nama item", "price": 10000 }
  ],
  "total": 50000,
  "date": "2024-01-15"
}

Aturan:
- "merchant": nama toko yang tertera di struk. Jika tidak terbaca, isi "Tidak diketahui"
- "items": array dari item yang dibeli. "price" berupa angka saja tanpa simbol mata uang
- "total": total pembayaran berupa angka saja. Jika tidak terbaca, jumlahkan semua item
- "date": tanggal transaksi dalam format YYYY-MM-DD. Jika tidak terbaca, isi null
- Semua harga dalam Rupiah (tanpa simbol Rp, titik, atau koma)
- Jika gambar bukan struk/receipt, kembalikan: { "error": "Gambar bukan struk belanja" }

PENTING: Kembalikan HANYA JSON murni, tanpa backtick atau markdown.`;

/**
 * Scan struk via Gemini Vision — belum simpan ke database
 *
 * @param {Buffer} fileBuffer - File buffer dari multer memoryStorage
 * @param {string} mimeType - MIME type file (image/jpeg, image/png, etc.)
 * @returns {Promise<{ rawText: string, parsedData: object }>}
 */
const scanReceipt = async (fileBuffer, mimeType) => {
  const model = getOCRModel();

  // Konversi buffer ke base64 untuk Gemini Vision
  const base64Image = fileBuffer.toString("base64");

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType,
    },
  };

  const result = await model.generateContent([OCR_PROMPT, imagePart]);
  const response = result.response;
  const rawText = response.text();

  // Parse JSON dari response Gemini
  let parsedData;
  try {
    // Bersihkan response jika ada backtick/markdown
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    parsedData = JSON.parse(cleaned);
  } catch {
    throw createError(422, "Gagal memproses struk. Pastikan gambar jelas dan merupakan struk belanja");
  }

  // Cek jika Gemini mendeteksi bukan struk
  if (parsedData.error) {
    throw createError(400, parsedData.error);
  }

  return { rawText, parsedData };
};

/**
 * Konfirmasi hasil OCR → buat transaction + receipt secara atomic
 *
 * @param {string} userId
 * @param {object} data
 * @param {number} data.amount
 * @param {string} data.type
 * @param {string} [data.description]
 * @param {string} data.date
 * @param {string} [data.categoryId]
 * @param {string} [data.rawText]
 * @param {object} [data.parsedData]
 * @returns {Promise<object>}
 */
const confirmReceipt = async (userId, { amount, type, description, date, categoryId, rawText, parsedData }) => {
  if (!amount || amount <= 0) {
    throw createError(400, "Amount harus lebih besar dari 0");
  }

  // Atomic: create transaction + receipt dalam satu transaksi DB
  const result = await prisma.$transaction(async (tx) => {
    // 1. Buat transaksi
    const transaction = await tx.transaction.create({
      data: {
        amount,
        type: type || "EXPENSE",
        description,
        date: new Date(date),
        userId,
        categoryId: categoryId || null,
      },
      include: {
        category: true,
      },
    });

    // 2. Buat receipt terhubung ke transaksi
    const receipt = await tx.receipt.create({
      data: {
        imageUrl: "local",
        rawText: rawText || null,
        parsedData: parsedData || null,
        isVerified: true,
        transactionId: transaction.id,
      },
    });

    return { ...transaction, receipt };
  });

  return result;
};

module.exports = { scanReceipt, confirmReceipt };
