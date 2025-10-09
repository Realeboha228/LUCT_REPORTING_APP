const express = require("express");
const router = express.Router();
const db = require("../db");

// Get students of a class
router.get("/:classId/students", async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT u.id, u.name, u.student_id
       FROM users u
       JOIN course_students cs ON u.id = cs.student_id
       WHERE cs.course_id = ?`,
      [req.params.classId]
    );
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Add student to a class
router.post("/:classId/students", async (req, res) => {
  const { student_id } = req.body;
  try {
    const [students] = await db.query("SELECT id FROM users WHERE student_id = ?", [student_id]);
    if (students.length === 0) return res.status(400).json({ message: "Student not found" });

    const student = students[0];
    const [exists] = await db.query(
      "SELECT * FROM course_students WHERE course_id = ? AND student_id = ?",
      [req.params.classId, student.id]
    );
    if (exists.length > 0) return res.status(400).json({ message: "Student already in class" });

    await db.query("INSERT INTO course_students (course_id, student_id) VALUES (?, ?)", [req.params.classId, student.id]);
    res.json({ message: "Student added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove student from class
router.delete("/:classId/students/:studentId", async (req, res) => {
  try {
    await db.query(
      "DELETE FROM course_students WHERE course_id = ? AND student_id = ?",
      [req.params.classId, req.params.studentId]
    );
    res.json({ message: "Student removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
