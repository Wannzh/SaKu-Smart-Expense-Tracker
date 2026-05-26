const prisma = require("../config/prisma");
const { getChatModel } = require("../config/gemini");
const { createError } = require("../utils/response");

/**
 * System prompt untuk AI financial assistant
 */
const SYSTEM_PROMPT = `Kamu adalah asisten keuangan personal SaKu. Bantu user analisis pengeluaran, beri saran menabung, dan jawab pertanyaan seputar keuangan personal dalam Bahasa Indonesia.

Panduan:
- Jawab dengan ringkas, ramah, dan mudah dipahami
- Gunakan emoji secukupnya untuk membuat percakapan lebih hidup
- Jika user bertanya di luar topik keuangan, arahkan kembali dengan sopan
- Berikan tips praktis yang bisa langsung diterapkan
- Format angka uang dalam Rupiah (Rp)`;

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
