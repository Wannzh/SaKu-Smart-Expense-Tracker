require("dotenv").config();
// Trigger reload for Prisma client regeneration updates: 2026-06-11T20:02:00

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

  // Start background runner for auto-transactions
  try {
    const { autoExecuteAllDueRecurrings } = require("./services/recurring.service");
    // Run immediately on start
    autoExecuteAllDueRecurrings().catch(err => console.error("[AutoRecurring Startup Error]:", err.message));
    // Run every 1 hour
    setInterval(() => {
      autoExecuteAllDueRecurrings().catch(err => console.error("[AutoRecurring Interval Error]:", err.message));
    }, 1000 * 60 * 60);
    console.log("⏰ Background runner for Auto Transactions initialized.");
  } catch (err) {
    console.error("[AutoRecurring Init Error]:", err.message);
  }
});

module.exports = app;
