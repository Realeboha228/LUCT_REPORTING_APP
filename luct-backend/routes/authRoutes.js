// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db"); // must be mysql2/promise connection

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Helper: standard server error
function sendServerError(res, err) {
  console.error(err);
  return res.status(500).json({ message: "Server error", error: err.message });
}

// ------------------------
// REGISTER
// ------------------------
router.post("/register", async (req, res) => {
  const { role, name, student_id, email, password } = req.body;

  try {
    if (!role) return res.status(400).json({ message: "Role is required" });

    if (role === "student") {
      if (!name || !student_id)
        return res.status(400).json({ message: "Student name and ID required" });

      const [existing] = await db.query(
        "SELECT * FROM users WHERE student_id = ?",
        [student_id]
      );
      if (existing.length > 0)
        return res.status(400).json({ message: "Student ID already registered" });

      await db.query(
        "INSERT INTO users (name, student_id, role) VALUES (?, ?, ?)",
        [name, student_id, "student"]
      );
      return res.json({ message: "Student registered successfully" });

    } else {
      if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email, and password required" });

      const [existing] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (existing.length > 0)
        return res.status(400).json({ message: "Email already registered" });

      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role]
      );
      return res.json({ message: `${role} registered successfully` });
    }
  } catch (err) {
    return sendServerError(res, err);
  }
});

// ------------------------
// LOGIN
// ------------------------
router.post("/login", async (req, res) => {
  try {
    let { role, email, password, name, student_id } = req.body;
    console.log("Login attempt for:", email || name);

    if (!role) return res.status(400).json({ message: "Role is required" });
    role = role.trim().toLowerCase();

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
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: "1h",
      });
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
    if (user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ message: "Login successful", token, user });
  } catch (err) {
    return sendServerError(res, err);
  }
});

module.exports = router;
