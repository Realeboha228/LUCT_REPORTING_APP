// routes/classRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware");

// Get students of a class
router.get("/:classId/students", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.student_id
       FROM users u
       JOIN course_students cs ON u.id = cs.student_id
       WHERE cs.course_id = $1
       ORDER BY u.name`,
      [req.params.classId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/classes/:classId/students:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add student to a class
router.post("/:classId/students", authenticate, async (req, res) => {
  try {
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    // Find student by student_id
    const studentResult = await db.query(
      "SELECT id FROM users WHERE student_id = $1",
      [student_id]
    );

    if (studentResult.rows.length === 0) {
      return res.status(400).json({ message: "Student not found" });
    }

    const student = studentResult.rows[0];

    // Check if already enrolled
    const existsResult = await db.query(
      "SELECT * FROM course_students WHERE course_id = $1 AND student_id = $2",
      [req.params.classId, student.id]
    );

    if (existsResult.rows.length > 0) {
      return res.status(400).json({ message: "Student already enrolled in this course" });
    }

    // Add student to course
    await db.query(
      "INSERT INTO course_students (course_id, student_id) VALUES ($1, $2)",
      [req.params.classId, student.id]
    );

    res.json({ message: "Student added successfully" });
  } catch (err) {
    console.error("❌ ERROR in POST /api/classes/:classId/students:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Remove student from class
router.delete("/:classId/students/:studentId", authenticate, async (req, res) => {
  try {
    await db.query(
      "DELETE FROM course_students WHERE course_id = $1 AND student_id = $2",
      [req.params.classId, req.params.studentId]
    );
    res.json({ message: "Student removed successfully" });
  } catch (err) {
    console.error("❌ ERROR in DELETE /api/classes/:classId/students/:studentId:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;