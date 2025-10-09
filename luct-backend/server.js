// server.js
const reportingRoutes = require("./routes/reportingRoutes");
const classRoutes = require("./routes/classRoutes"); 
const express = require("express");
const mysql = require("mysql2/promise"); // promise-based
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/api/reporting", reportingRoutes);
app.use("/api/classes", classRoutes);
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ------------------------
// MySQL connection pool
// ------------------------
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "2468",
  database: process.env.DB_NAME || "luct_reporting",
});

// ------------------------
// Helper: send standard error
// ------------------------
function sendServerError(res, err) {
  console.error(err);
  return res.status(500).json({ message: "Server error", error: err.message });
}

// ------------------------
// Test DB connection
// ------------------------
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ message: "DB test successful", result: rows[0].result });
  } catch (err) {
    console.error("❌ DB test failed:", err);
    res.status(500).json({ message: "DB test failed", error: err.message });
  }
});

// ------------------------
// JWT Auth Middleware
// ------------------------
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authenticatePL = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "PL") return res.status(403).json({ message: "Access denied" });
    next();
  });
};

// ------------------------
// REGISTER
// ------------------------
app.post("/api/register", async (req, res) => {
  const { role, name, student_id, email, password } = req.body;
  try {
    if (!role) return res.status(400).json({ message: "Role is required" });

    if (role === "student") {
      if (!name || !student_id)
        return res.status(400).json({ message: "Student name and ID required" });

      const [existing] = await db.query("SELECT * FROM users WHERE student_id = ?", [student_id]);
      if (existing.length > 0) return res.status(400).json({ message: "Student ID already registered" });

      await db.query("INSERT INTO users (name, student_id, role) VALUES (?, ?, ?)", [name, student_id, "student"]);
      return res.json({ message: "Student registered successfully" });

    } else {
      if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email, and password required" });

      const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

      await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, password, role]);
      return res.json({ message: `${role} registered successfully` });
    }
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// LOGIN
// ------------------------
app.post("/api/login", async (req, res) => {
  let { role, email, password, name, student_id } = req.body;
  try {
    if (!role) return res.status(400).json({ message: "Role is required" });
    role = role.trim().toLowerCase();

    // Student login
    if (role === "student") {
      if (!name || !student_id)
        return res.status(400).json({ message: "Student name and ID required" });

      const [rows] = await db.query(
        "SELECT * FROM users WHERE TRIM(name) = ? AND TRIM(student_id) = ? AND LOWER(role) = 'student'",
        [name.trim(), student_id.trim()]
      );

      if (rows.length === 0) return res.status(400).json({ message: "Invalid student credentials" });

      const user = rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
      return res.json({ message: "Login successful", token, user });
    }

    // Lecturer / PL / PRL login
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE TRIM(email) = ? AND LOWER(role) = ?",
      [email.trim(), role]
    );

    if (rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];
    if (user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ message: "Login successful", token, user });
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// Lecturer Routes
// ------------------------
app.get("/api/lecturer/classes", authenticate, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM courses WHERE lecturer_id = ?",
      [lecturerId]
    );
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

app.get("/api/lecturer/reports", authenticate, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const [rows] = await db.query(
      `SELECT r.*, c.course_name, c.course_code
       FROM reports r
       JOIN courses c ON r.course_id = c.id
       WHERE r.lecturer_id = ?`,
      [lecturerId]
    );
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// PL Routes
// ------------------------
app.get("/api/pl/courses", authenticatePL, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.course_name, c.course_code, u.name AS lecturer_name
       FROM courses c
       LEFT JOIN users u ON c.lecturer_id = u.id`
    );
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
