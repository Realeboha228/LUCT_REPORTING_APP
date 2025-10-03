// server.js (updated)
// Full file: adds GET /api/lecturers and improved logging for lecturer fetches

const express = require("express");
const mysql = require("mysql2/promise"); // async/await
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "2468",
  database: "luct_reporting",
});

// ------------------------
// Helper: send standard error
// ------------------------
function sendServerError(res, err) {
  console.error(err);
  return res.status(500).json({ message: "Server error" });
}

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
      if (existing.length > 0)
        return res.status(400).json({ message: "Student ID already registered" });

      await db.query("INSERT INTO users (name, student_id, role) VALUES (?, ?, ?)", [name, student_id, "student"]);
      return res.json({ message: "Student registered successfully" });

    } else {
      if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email, and password required" });

      const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (existing.length > 0)
        return res.status(400).json({ message: "Email already registered" });

      // NOTE: you are storing plain-text passwords (by request); consider hashing in production
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
    role = role.trim().toLowerCase(); // normalize role

    // --- STUDENT LOGIN ---
    if (role === "student") {
      if (!name || !student_id)
        return res.status(400).json({ message: "Student name and ID required" });

      const [rows] = await db.query(
        "SELECT * FROM users WHERE TRIM(name) = ? AND TRIM(student_id) = ? AND LOWER(role) = 'student'",
        [name.trim(), student_id.trim()]
      );

      if (rows.length === 0)
        return res.status(400).json({ message: "Invalid student credentials" });

      const user = rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({ message: "Login successful", token, user });
    }

    // --- LECTURER / PRL / PL LOGIN ---
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const [rows] = await db.query(
      "SELECT * FROM users WHERE TRIM(email) = ? AND LOWER(role) = ?",
      [email.trim(), role]
    );

    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];

    // plain-text comparison (your DB currently stores plain passwords)
    if (user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    return res.json({ message: "Login successful", token, user });
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// JWT AUTH MIDDLEWARE
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

// Middleware specifically for PL
const authenticatePL = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "PL") return res.status(403).json({ message: "Access denied" });
    next();
  });
};

// ------------------------
// NEW: Get all lecturers (any authenticated user, used to populate dropdowns)
// ------------------------
app.get("/api/lecturers", authenticate, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email FROM users WHERE role = 'lecturer' ORDER BY name");
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// LECTURER ROUTES
// ------------------------
app.get("/api/lecturer/classes", authenticate, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const [rows] = await db.query(
      `SELECT c.id, c.course_name, c.course_code, c.faculty_name, c.class_name, c.total_students
       FROM courses c
       WHERE c.lecturer_id = ?`,
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
// PL ROUTES (Program Leader)
// ------------------------
// Get all courses (PL)
app.get("/api/pl/courses", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "PL") return res.status(403).json({ message: "Forbidden" });
    const [rows] = await db.query(
      `SELECT c.id, c.course_name, c.course_code, u.name AS lecturer_name, c.total_students
       FROM courses c
       LEFT JOIN users u ON c.lecturer_id = u.id
       ORDER BY c.course_name`
    );
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// Get all lecturers (to assign to courses) -- PL only but also there's /api/lecturers for general use
app.get("/api/pl/lecturers", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "PL") return res.status(403).json({ message: "Forbidden" });
    const [rows] = await db.query("SELECT id, name, email FROM users WHERE role = 'lecturer' ORDER BY name");
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// Add new course (PL)
app.post("/api/pl/courses", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "PL") return res.status(403).json({ message: "Forbidden" });
    const { name, code, lecturer_id } = req.body;
    if (!name || !code) return res.status(400).json({ message: "Course name and code required" });

    await db.query("INSERT INTO courses (course_name, course_code, lecturer_id) VALUES (?, ?, ?)", [name, code, lecturer_id || null]);
    return res.json({ message: "Course added successfully" });
  } catch (err) {
    return sendServerError(res, err);
  }
});

// View PRL reports (PL)
app.get("/api/pl/reports", authenticatePL, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name as prl_name, c.course_name, c.course_code
       FROM reports r
       JOIN users u ON r.prl_id = u.id
       JOIN courses c ON r.course_id = c.id
       ORDER BY r.date_of_lecture DESC`
    );
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// Get classes/lectures (PL)
app.get("/api/pl/classes", authenticatePL, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name as lecturer_name
       FROM courses c
       LEFT JOIN users u ON c.lecturer_id = u.id
       ORDER BY c.course_name`
    );
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// Ratings (example)
app.get("/api/pl/ratings", authenticatePL, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM ratings");
    res.json(rows);
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// Test route
// ------------------------
app.get("/", (req, res) => res.send("LUCT Reporting API is running..."));

// ------------------------
// Start server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
