// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const lecturerRoutes = require("./routes/lecturerRoutes");
const prlRoutes = require("./routes/prlRoutes");
const plRoutes = require("./routes/plRoutes");
const reportingRoutes = require("./routes/reportingRoutes");
const classRoutes = require("./routes/classRoutes");
const studentRoutes = require("./routes/studentRoutes");
const notificationRoutes = require("./routes/notificationRoutes"); // ✅ NEW

const app = express();

// ------------------------
// Middleware
// ------------------------
app.use(cors());
app.use(express.json());

// ------------------------
// Mount Routes
// ------------------------
app.use("/api/auth", authRoutes);
app.use("/api/lecturer", lecturerRoutes);
app.use("/api/prl", prlRoutes);
app.use("/api/pl", plRoutes);
app.use("/api/reporting", reportingRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notifications", notificationRoutes); // ✅ NEW

// ------------------------
// Health & Test Routes
// ------------------------
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    database: "PostgreSQL",
    environment: process.env.NODE_ENV || "development"
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT 1 + 1 AS result");
    res.json({ 
      message: "✅ PostgreSQL connection successful", 
      result: result.rows[0].result,
      database: process.env.DB_NAME || "luct_reporting_rea"
    });
  } catch (err) {
    console.error("❌ DB test failed:", err);
    res.status(500).json({ message: "DB test failed", error: err.message });
  }
});

// ------------------------
// 404 Handler
// ------------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ------------------------
// Error Handler
// ------------------------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ 
    message: "Internal server error", 
    error: process.env.NODE_ENV === "development" ? err.message : undefined 
  });
});

// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║  🚀 LUCT Reporting System Server                  ║
╠═══════════════════════════════════════════════════╣
║  ✅ Server running on port ${PORT}                    ║
║  📊 Database: ${process.env.DB_NAME || 'luct_reporting_rea'}            ║
║  🔗 API URL: http://localhost:${PORT}/api           ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}              ║
╠═══════════════════════════════════════════════════╣
║  📍 Available Routes:                             ║
║     POST   /api/auth/register                     ║
║     POST   /api/auth/login                        ║
║     GET    /api/lecturer/*                        ║
║     GET    /api/prl/*                             ║
║     GET    /api/pl/*                              ║
║     GET    /api/student/*                         ║
║     GET    /api/notifications/*                   ║
║     GET    /api/test-db                           ║
╚═══════════════════════════════════════════════════╝
  `);
});