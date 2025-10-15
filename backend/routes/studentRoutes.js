// routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware");

// ------------------------
// GET STUDENT'S ENROLLED MODULES
// ------------------------
router.get("/modules", authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Get all modules the student is enrolled in
    const result = await db.query(
      `SELECT m.id, m.module_code, m.module_name, m.lecturer_id, m.class_name,
              COALESCE(u.first_name || ' ' || u.last_name, u.name, 'Not Assigned') as lecturer_name
       FROM modules m
       JOIN module_students ms ON m.id = ms.module_id
       LEFT JOIN users u ON m.lecturer_id = u.id
       WHERE ms.student_id = $1
       ORDER BY m.module_code`,
      [studentId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/student/modules:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET LECTURERS IN STUDENT'S STREAM
// ------------------------
router.get("/stream-lecturers", authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    console.log("🔍 Fetching lecturers for student ID:", studentId);
    
    // Get student's stream
    const studentResult = await db.query(
      "SELECT primary_stream_id FROM users WHERE id = $1",
      [studentId]
    );

    console.log("📊 Student result:", studentResult.rows);

    if (studentResult.rows.length === 0) {
      return res.status(400).json({ message: "Student not found" });
    }

    const streamId = studentResult.rows[0].primary_stream_id;

    if (!streamId) {
      return res.status(400).json({ message: "Student not assigned to a stream" });
    }

    console.log("🎓 Student's stream ID:", streamId);

    // Get all lecturers teaching in this stream with their modules
    const result = await db.query(
      `SELECT 
              u.id,
              COALESCE(u.first_name || ' ' || u.last_name, u.name, 'Unknown Lecturer') as lecturer_name,
              u.email,
              m.module_code,
              m.module_name
       FROM users u
       JOIN modules m ON u.id = m.lecturer_id
       WHERE m.stream_id = $1 AND u.role = 'lecturer'
       ORDER BY COALESCE(u.first_name || ' ' || u.last_name, u.name)`,
      [streamId]
    );

    console.log("✅ Found lecturers:", result.rows.length);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/student/stream-lecturers:", err);
    console.error("❌ Error details:", err.message);
    console.error("❌ Stack trace:", err.stack);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// MARK ATTENDANCE
// ------------------------
router.post("/attendance", authenticate, async (req, res) => {
  try {
    const { module_id, lecturer_id, lecture_date, status } = req.body;
    const student_id = req.user.id;

    if (!module_id || !lecture_date) {
      return res.status(400).json({ message: "Module ID and lecture date are required" });
    }

    // Check if attendance already marked for this date
    const existingAttendance = await db.query(
      `SELECT * FROM attendance 
       WHERE student_id = $1 AND module_id = $2 AND lecture_date = $3`,
      [student_id, module_id, lecture_date]
    );

    if (existingAttendance.rows.length > 0) {
      return res.status(400).json({ message: "Attendance already marked for this date" });
    }

    // Insert attendance record
    await db.query(
      `INSERT INTO attendance (student_id, module_id, lecturer_id, lecture_date, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [student_id, module_id, lecturer_id, lecture_date, status || 'present']
    );

    // Get student and module info for notification
    const studentInfo = await db.query(
      `SELECT first_name, last_name, student_id FROM users WHERE id = $1`,
      [student_id]
    );
    
    const moduleInfo = await db.query(
      `SELECT module_code, module_name FROM modules WHERE id = $1`,
      [module_id]
    );

    const studentName = `${studentInfo.rows[0].first_name} ${studentInfo.rows[0].last_name}`;
    const studentNumber = studentInfo.rows[0].student_id;
    const moduleName = `${moduleInfo.rows[0].module_code} - ${moduleInfo.rows[0].module_name}`;

    // Create notification for the lecturer
    if (lecturer_id) {
      await db.query(
        `INSERT INTO notifications (recipient_id, sender_id, notification_type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          lecturer_id,
          student_id,
          'attendance',
          'New Attendance Marked',
          `${studentName} (${studentNumber}) marked attendance for ${moduleName} on ${lecture_date}`,
          module_id
        ]
      );
    }

    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/student/attendance:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET STUDENT'S ATTENDANCE HISTORY
// ------------------------
router.get("/attendance", authenticate, async (req, res) => {
  try {
    const student_id = req.user.id;
    
    const result = await db.query(
      `SELECT a.*, m.module_code, m.module_name,
              COALESCE(u.first_name || ' ' || u.last_name, u.name, 'Unknown') as lecturer_name
       FROM attendance a
       JOIN modules m ON a.module_id = m.id
       LEFT JOIN users u ON a.lecturer_id = u.id
       WHERE a.student_id = $1
       ORDER BY a.lecture_date DESC`,
      [student_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/student/attendance GET:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// SUBMIT COMPLAINT
// ------------------------
router.post("/complaints", authenticate, async (req, res) => {
  try {
    const { module_id, lecturer_id, complaint_type, description } = req.body;
    const student_id = req.user.id;

    if (!module_id || !complaint_type || !description) {
      return res.status(400).json({ 
        message: "Module, complaint type, and description are required" 
      });
    }

    // Insert complaint
    const complaintResult = await db.query(
      `INSERT INTO complaints (student_id, module_id, lecturer_id, complaint_type, description, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [student_id, module_id, lecturer_id, complaint_type, description, 'pending']
    );

    const complaintId = complaintResult.rows[0].id;

    // Get student info
    const studentInfo = await db.query(
      `SELECT first_name, last_name, student_id, primary_stream_id FROM users WHERE id = $1`,
      [student_id]
    );

    const studentName = `${studentInfo.rows[0].first_name} ${studentInfo.rows[0].last_name}`;
    const studentNumber = studentInfo.rows[0].student_id;
    const streamId = studentInfo.rows[0].primary_stream_id;

    // Get module info
    const moduleInfo = await db.query(
      `SELECT module_code, module_name FROM modules WHERE id = $1`,
      [module_id]
    );

    const moduleName = `${moduleInfo.rows[0].module_code} - ${moduleInfo.rows[0].module_name}`;

    // Get PRL of this stream
    if (streamId) {
      const prlResult = await db.query(
        `SELECT id FROM users WHERE role = 'PRL' AND primary_stream_id = $1`,
        [streamId]
      );

      if (prlResult.rows.length > 0) {
        const prlId = prlResult.rows[0].id;

        // Create notification for PRL
        await db.query(
          `INSERT INTO notifications (recipient_id, sender_id, notification_type, title, message, related_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            prlId,
            student_id,
            'complaint',
            'New Lecturer Complaint',
            `${studentName} (${studentNumber}) submitted a complaint about ${moduleName} - Type: ${complaint_type}`,
            complaintId
          ]
        );
      }
    }

    res.json({ message: "Complaint submitted successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/student/complaints:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET STUDENT'S COMPLAINTS HISTORY
// ------------------------
router.get("/complaints", authenticate, async (req, res) => {
  try {
    const student_id = req.user.id;
    
    const result = await db.query(
      `SELECT c.*, m.module_code, m.module_name,
              COALESCE(u.first_name || ' ' || u.last_name, u.name, 'Unknown') as lecturer_name
       FROM complaints c
       JOIN modules m ON c.module_id = m.id
       LEFT JOIN users u ON c.lecturer_id = u.id
       WHERE c.student_id = $1
       ORDER BY c.created_at DESC`,
      [student_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/student/complaints GET:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;