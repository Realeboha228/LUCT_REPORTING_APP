const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // your MySQL connection
require("dotenv").config();

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role, student_id } = req.body;

  if (!role) return res.status(400).json({ message: "Role is required" });

  try {
    if (role === "student") {
      if (!name || !student_id)
        return res.status(400).json({ message: "Student name and ID required" });

      await db.query(
        "INSERT INTO users (name, student_id, role) VALUES (?, ?, ?)",
        [name, student_id, "student"]
      );
      return res.json({ message: "Student registered successfully" });
    } else {
      if (!name || !email || !password)
        return res.status(400).json({ message: "Name, email, and password required" });

      const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, role]
      );
      return res.json({ message: `${role} registered successfully` });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { role } = req.body;

  try {
    if (role === "student") {
      const { name, student_id } = req.body;
      if (!name || !student_id) return res.status(400).json({ message: "Name and Student ID required" });

      const [rows] = await db.query(
        "SELECT * FROM users WHERE name = ? AND student_id = ? AND role = 'student'",
        [name, student_id]
      );

      if (rows.length === 0) return res.status(400).json({ message: "Invalid student credentials" });

      const user = rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

      return res.json({ message: "Login successful", token, user });
    } else {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password required" });

      const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
      if (rows.length === 0) return res.status(400).json({ message: "User not found" });

      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

      return res.json({ message: "Login successful", token, user });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
// LOGIN
app.post("/api/login", async (req, res) => {
  const { role } = req.body;

  try {
    if (!role) return res.status(400).json({ message: "Role is required" });

    if (role === "student") {
      const { name, student_id } = req.body;
      if (!name || !student_id)
        return res.status(400).json({ message: "Student name and ID required" });

      const [rows] = await db.query(
        "SELECT * FROM users WHERE name = ? AND student_id = ? AND role = 'student'",
        [name, student_id]
      );

      if (rows.length === 0)
        return res.status(400).json({ message: "Invalid student credentials" });

      const user = rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({ message: "Login successful", token, user });

    } else {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const [rows] = await db.query(
        "SELECT * FROM users WHERE email = ? AND role = ?",
        [email, role]
      );

      if (rows.length === 0)
        return res.status(400).json({ message: "User not found" });

      const user = rows[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

      return res.json({ message: "Login successful", token, user });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});
