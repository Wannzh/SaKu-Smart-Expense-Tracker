const prisma = require("../config/prisma");
const { getChatModel } = require("../config/gemini");
const { createError } = require("../utils/response");

const SYSTEM_PROMPT = `Kamu adalah SaKu AI Assistant, asisten keuangan personal pintar untuk aplikasi SaKu. Tugasmu adalah membantu user menganalisis pengeluaran, menyusun anggaran, memberikan saran menabung, dan menjawab pertanyaan seputar keuangan personal secara bijak dan akurat dalam Bahasa Indonesia.

Informasi Penting tentang Batasan & Fitur SaKu:
1. Kamu adalah model AI tekstual dan TIDAK BISA memodifikasi database secara langsung (tidak bisa mencatat transaksi, membuat dompet, menghapus data, atau menyusun anggaran di sistem secara otomatis).
2. Jika user meminta untuk mencatat/membuat transaksi (misal: "Beli kopi 30rb"), jelaskan dengan sopan bahwa kamu tidak bisa mencatatnya secara langsung, lalu pandu mereka untuk menggunakan fitur SaKu:
   - Mencatat transaksi manual: Klik tombol "+ Add Transaction" di sidebar kiri atau menu "Transaksi"
   - Mencatat transaksi otomatis: Gunakan fitur "Scan Struk" (pindai foto struk belanjaan)
3. Fitur Utama SaKu yang bisa kamu jelaskan kepada user:
   - Dashboard: Ringkasan saldo, grafik arus kas, dan aktivitas keuangan terbaru.
   - Statistik: Analisis grafik donat kategori dan grafik batang arus kas.
   - Wallet (Dompet): Tempat mengelola saldo (Tunai, Bank, E-Wallet).
   - Transaksi: Daftar catatan pemasukan dan pengeluaran.
   - Anggaran (Budget): Limit pengeluaran per kategori agar hemat.
   - Keinginan (Wishlist): Target menabung barang impian.
   - Berulang (Recurring): Transaksi otomatis terjadwal (langganan/gaji).
   - Hutang (Debts): Pencatatan pinjaman atau piutang.

Panduan Jawaban:
- Jawab dengan ringkas, ramah, dan profesional (gunakan emoji secukupnya).
- Jawab HANYA seputar topik keuangan personal dan fitur-fitur aplikasi SaKu.
- Jika user bertanya di luar topik tersebut (misal: sains, politik, gosip), arahkan kembali secara halus: "Maaf, sebagai asisten keuangan SaKu, saya hanya dapat membantu Anda dalam mengelola keuangan dan fitur-fitur SaKu."
- Format angka uang wajib menggunakan format Rupiah (Rp).`;

/**
 * Ambil semua sesi chat milik user
 *
 * @param {string} userId
 * @returns {Promise<object[]>}
 */
const getSessions = async (userId) => {
  const sessions = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { messages: true },
      },
    },
  });

  return sessions;
};

/**
 * Buat sesi chat baru
 *
 * @param {string} userId
 * @param {string} [title]
 * @returns {Promise<object>}
 */
const createSession = async (userId, title) => {
  const session = await prisma.chatSession.create({
    data: {
      title: title || null,
      userId,
    },
  });

  return session;
};

/**
 * Ambil sesi + semua pesan — pastikan milik user
 *
 * @param {string} userId
 * @param {string} sessionId
 * @returns {Promise<object>}
 */
const getSession = async (userId, sessionId) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!session) {
    throw createError(404, "Sesi chat tidak ditemukan");
  }

  if (session.userId !== userId) {
    throw createError(403, "Anda tidak memiliki akses ke sesi ini");
  }

  return session;
};

/**
 * Kirim pesan user → dapatkan reply AI → simpan keduanya
 *
 * @param {string} userId
 * @param {string} sessionId
 * @param {string} content - Pesan dari user
 * @returns {Promise<{ userMessage: object, assistantMessage: object }>}
 */
const sendMessage = async (userId, sessionId, content) => {
  // Pastikan sesi milik user
  const session = await getSession(userId, sessionId);

  // Simpan pesan USER ke DB
  const userMessage = await prisma.chatMessage.create({
    data: {
      role: "USER",
      content,
      sessionId,
    },
  });

  // Auto-set title dari pesan pertama jika belum ada
  if (!session.title && session.messages.length === 0) {
    const autoTitle = content.length > 50 ? content.substring(0, 50) + "..." : content;
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title: autoTitle },
    });
  }

  // Bangun history untuk konteks Gemini
  const history = session.messages.map((msg) => ({
    role: msg.role === "USER" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  // Kirim ke Gemini dengan history + pesan baru
  const model = getChatModel({ systemInstruction: SYSTEM_PROMPT });
  const chat = model.startChat({ history });

  const result = await chat.sendMessage(content);
  const aiReply = result.response.text();

  // Simpan reply ASSISTANT ke DB
  const assistantMessage = await prisma.chatMessage.create({
    data: {
      role: "ASSISTANT",
      content: aiReply,
      sessionId,
    },
  });

  return { userMessage, assistantMessage };
};

/**
 * Hapus sesi chat — pastikan milik user
 *
 * @param {string} userId
 * @param {string} sessionId
 * @returns {Promise<object>}
 */
const deleteSession = async (userId, sessionId) => {
  // Cek kepemilikan
  await getSession(userId, sessionId);

  // Cascade delete akan menghapus messages juga
  const deleted = await prisma.chatSession.delete({
    where: { id: sessionId },
  });

  return deleted;
};

module.exports = { getSessions, createSession, getSession, sendMessage, deleteSession };
