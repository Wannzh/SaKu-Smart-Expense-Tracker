require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Global Middlewares ───────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "SaKu API is running 🚀" });
});

// ─── API Routes ───────────────────────────────────────────────
app.use("/api", routes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
