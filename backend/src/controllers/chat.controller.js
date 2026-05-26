const chatService = require("../services/chat.service");
const { sendSuccess } = require("../utils/response");

/**
 * GET /api/chat/sessions
 */
const getSessions = async (req, res, next) => {
  const sessions = await chatService.getSessions(req.user.id);
  sendSuccess(res, 200, "Daftar sesi chat berhasil diambil", { sessions });
};

/**
 * POST /api/chat/sessions
 */
const createSession = async (req, res, next) => {
  const { title } = req.body;
  const session = await chatService.createSession(req.user.id, title);
  sendSuccess(res, 201, "Sesi chat berhasil dibuat", { session });
};

/**
 * GET /api/chat/sessions/:id
 */
const getSession = async (req, res, next) => {
  const session = await chatService.getSession(req.user.id, req.params.id);
  sendSuccess(res, 200, "Detail sesi chat berhasil diambil", { session });
};

/**
 * POST /api/chat/sessions/:id/message
 */
const sendMessage = async (req, res, next) => {
  const { content } = req.body;
  const result = await chatService.sendMessage(req.user.id, req.params.id, content);
  sendSuccess(res, 201, "Pesan berhasil dikirim", result);
};

/**
 * DELETE /api/chat/sessions/:id
 */
const deleteSession = async (req, res, next) => {
  const session = await chatService.deleteSession(req.user.id, req.params.id);
  sendSuccess(res, 200, "Sesi chat berhasil dihapus", { session });
};

module.exports = { getSessions, createSession, getSession, sendMessage, deleteSession };
