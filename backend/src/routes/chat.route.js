const { Router } = require("express");
const chatController = require("../controllers/chat.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = Router();

// Semua route chat butuh autentikasi
router.use(authMiddleware);

// GET /api/chat/sessions — list semua sesi chat
router.get("/sessions", chatController.getSessions);

// POST /api/chat/sessions — buat sesi baru
router.post("/sessions", chatController.createSession);

// GET /api/chat/sessions/:id — ambil pesan dalam sesi
router.get("/sessions/:id", chatController.getSession);

// POST /api/chat/sessions/:id/message — kirim pesan → AI reply
router.post("/sessions/:id/message", chatController.sendMessage);

// DELETE /api/chat/sessions/:id — hapus sesi
router.delete("/sessions/:id", chatController.deleteSession);

module.exports = router;
