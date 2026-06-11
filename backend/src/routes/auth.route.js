const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = Router();

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/logout
router.post("/logout", authController.logout);

// GET /api/auth/me (protected)
router.get("/me", authMiddleware, authController.getMe);

// PUT /api/auth/profile (protected)
router.put("/profile", authMiddleware, upload.single("avatar"), authController.updateProfile);

module.exports = router;
