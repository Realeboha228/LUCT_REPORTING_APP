// routes/reportingRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // make sure this is your promise-based DB
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

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

// ------------------------
// GET CLASSES FOR LECTURER
// ------------------------
router.get("/classes", authenticate, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const [rows] = await db.query(
      "SELECT * FROM courses WHERE lecturer_id = ?",
      [lecturerId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/classes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// SUBMIT REPORT
// ------------------------
router.post("/reports", authenticate, async (req, res) => {
  try {
    const {
      course_id,
      week_of_reporting,
      date_of_lecture,
      actual_students_present,
      venue,
      scheduled_time,
      topic_taught,
      learning_outcomes,
      recommendations
    } = req.body;

    const lecturer_id = req.user.id;

    await db.query(
      `INSERT INTO reports
      (course_id, lecturer_id, week_of_reporting, date_of_lecture, actual_students_present, venue, scheduled_time, topic_taught, learning_outcomes, recommendations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        lecturer_id,
        week_of_reporting,
        date_of_lecture,
        actual_students_present,
        venue,
        scheduled_time,
        topic_taught,
        learning_outcomes,
        recommendations
      ]
    );

    res.json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/reports POST:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET REPORTS FOR LECTURER
// ------------------------
router.get("/reports", authenticate, async (req, res) => {
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
    console.error("❌ ERROR in /api/reporting/reports GET:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// STUDENT SUBMITS RATING
// ------------------------
router.post("/ratings", authenticate, async (req, res) => {
  try {
    const { ratee_id, score, comments } = req.body;
    const rater_id = req.user.id;

    await db.query(
      `INSERT INTO ratings (rater_id, ratee_id, rating_type, score, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [rater_id, ratee_id, "student_to_lecturer", score, comments]
    );

    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/ratings POST:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET LECTURER AVERAGE RATINGS
// ------------------------
router.get("/ratings/:lecturerId", authenticate, async (req, res) => {
  try {
    const lecturerId = req.params.lecturerId;
    const [rows] = await db.query(
      `SELECT AVG(score) AS avg_rating FROM ratings WHERE ratee_id = ?`,
      [lecturerId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/ratings GET:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
