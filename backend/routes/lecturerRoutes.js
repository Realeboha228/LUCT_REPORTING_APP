// routes/lecturerRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticateLecturer } = require("../middleware/authMiddleware");

// ------------------------
// GET LECTURER'S MODULES
// ------------------------
router.get("/classes", authenticateLecturer, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const result = await db.query(
      `SELECT m.*, s.stream_name, s.stream_code 
       FROM modules m
       JOIN streams s ON m.stream_id = s.id
       WHERE m.lecturer_id = $1
       ORDER BY m.module_code`,
      [lecturerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/classes:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET LECTURER'S ASSIGNED STREAMS
// ------------------------
router.get("/streams", authenticateLecturer, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const result = await db.query(
      `SELECT s.* 
       FROM streams s
       JOIN lecturer_streams ls ON s.id = ls.stream_id
       WHERE ls.lecturer_id = $1
       ORDER BY s.stream_code`,
      [lecturerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/streams:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET MODULES BY STREAM (for report form)
// ------------------------
router.get("/streams/:streamId/modules", authenticateLecturer, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const streamId = req.params.streamId;
    
    const result = await db.query(
      `SELECT m.*
       FROM modules m
       WHERE m.stream_id = $1 AND m.lecturer_id = $2
       ORDER BY m.module_code`,
      [streamId, lecturerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/streams/:streamId/modules:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET LECTURER'S REPORTS
// ------------------------
router.get("/reports", authenticateLecturer, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    const result = await db.query(
      `SELECT r.*, m.module_name, m.module_code, s.stream_name, s.stream_code
       FROM reports r
       JOIN modules m ON r.module_id = m.id
       JOIN streams s ON m.stream_id = s.id
       WHERE r.lecturer_id = $1
       ORDER BY r.created_at DESC`,
      [lecturerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/reports:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// SUBMIT A REPORT TO PRL
// ------------------------
router.post("/reports", authenticateLecturer, async (req, res) => {
  try {
    const {
      stream_id,
      module_id,
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

    if (!stream_id || !module_id) {
      return res.status(400).json({ message: "Stream and module are required" });
    }

    // Get the PRL for this stream
    const prlResult = await db.query(
      "SELECT id FROM users WHERE role = 'PRL' AND primary_stream_id = $1",
      [stream_id]
    );

    let prl_id = null;
    if (prlResult.rows.length > 0) {
      prl_id = prlResult.rows[0].id;
    }

    // Insert report
    const reportResult = await db.query(
      `INSERT INTO reports
      (module_id, lecturer_id, week_of_reporting, date_of_lecture, actual_students_present, 
       venue, scheduled_time, topic_taught, learning_outcomes, recommendations, prl_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        module_id,
        lecturer_id,
        week_of_reporting,
        date_of_lecture,
        actual_students_present,
        venue,
        scheduled_time,
        topic_taught,
        learning_outcomes,
        recommendations,
        prl_id,
        'pending'
      ]
    );

    const reportId = reportResult.rows[0].id;

    // Get lecturer and module info for notification
    const lecturerInfo = await db.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [lecturer_id]
    );

    const moduleInfo = await db.query(
      `SELECT module_code, module_name FROM modules WHERE id = $1`,
      [module_id]
    );

    const lecturerName = `${lecturerInfo.rows[0].first_name} ${lecturerInfo.rows[0].last_name}`;
    const moduleName = `${moduleInfo.rows[0].module_code} - ${moduleInfo.rows[0].module_name}`;

    // Create notification for PRL
    if (prl_id) {
      await db.query(
        `INSERT INTO notifications (recipient_id, sender_id, notification_type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          prl_id,
          lecturer_id,
          'report',
          'New Lecturer Report',
          `${lecturerName} submitted a report for ${moduleName} - Week ${week_of_reporting}`,
          reportId
        ]
      );
    }

    res.json({ message: "Report submitted successfully to your PRL" });
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/reports POST:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET STUDENTS IN LECTURER'S MODULE
// ------------------------
router.get("/modules/:moduleId/students", authenticateLecturer, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.first_name, u.last_name, u.student_id
       FROM users u
       JOIN module_students ms ON u.id = ms.student_id
       WHERE ms.module_id = $1
       ORDER BY u.first_name, u.last_name`,
      [req.params.moduleId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/modules/:moduleId/students:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET MONITORING DATA (Student Attendance)
// ------------------------
router.get("/monitoring", authenticateLecturer, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    
    const result = await db.query(
      `SELECT a.*, 
              m.module_code, 
              m.module_name,
              u.first_name || ' ' || u.last_name as student_name,
              u.student_id
       FROM attendance a
       JOIN modules m ON a.module_id = m.id
       JOIN users u ON a.student_id = u.id
       WHERE a.lecturer_id = $1
       ORDER BY a.lecture_date DESC, m.module_code`,
      [lecturerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/monitoring:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET LECTURER'S PRLs (for rating)
// ------------------------
router.get("/prls", authenticateLecturer, async (req, res) => {
  try {
    const lecturerId = req.user.id;
    
    // Get all streams the lecturer teaches in
    const streamsResult = await db.query(
      `SELECT DISTINCT s.id, s.stream_name, s.stream_code
       FROM streams s
       JOIN lecturer_streams ls ON s.id = ls.stream_id
       WHERE ls.lecturer_id = $1
       ORDER BY s.stream_code`,
      [lecturerId]
    );

    // Get PRLs for those streams
    const streamIds = streamsResult.rows.map(s => s.id);
    
    if (streamIds.length === 0) {
      return res.json([]);
    }

    const prlsResult = await db.query(
      `SELECT u.id, 
              u.first_name || ' ' || u.last_name as prl_name,
              u.email,
              s.stream_name,
              s.stream_code
       FROM users u
       JOIN streams s ON u.primary_stream_id = s.id
       WHERE u.role = 'PRL' AND u.primary_stream_id = ANY($1)
       ORDER BY s.stream_code`,
      [streamIds]
    );

    res.json(prlsResult.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/prls:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// RATE A PRL (Lecturer to PRL)
// ------------------------
router.post("/rate-prl", authenticateLecturer, async (req, res) => {
  try {
    const { prl_id, score, comments } = req.body;
    const lecturer_id = req.user.id;

    if (!prl_id || !score) {
      return res.status(400).json({ message: "PRL ID and score are required" });
    }

    // Insert rating
    const ratingResult = await db.query(
      `INSERT INTO ratings (rater_id, ratee_id, rating_type, score, comments)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [lecturer_id, prl_id, 'lecturer_to_prl', score, comments]
    );

    const ratingId = ratingResult.rows[0].id;

    // Get lecturer info
    const lecturerInfo = await db.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [lecturer_id]
    );

    // Get PRL info
    const prlInfo = await db.query(
      `SELECT first_name, last_name, primary_stream_id FROM users WHERE id = $1`,
      [prl_id]
    );

    const lecturerName = `${lecturerInfo.rows[0].first_name} ${lecturerInfo.rows[0].last_name}`;
    const prlName = `${prlInfo.rows[0].first_name} ${prlInfo.rows[0].last_name}`;
    const streamId = prlInfo.rows[0].primary_stream_id;

    // Get PL (Program Leader) to notify
    const plResult = await db.query(
      `SELECT id FROM users WHERE role = 'PL'`
    );

    if (plResult.rows.length > 0) {
      const plId = plResult.rows[0].id;

      // Create notification for PL
      await db.query(
        `INSERT INTO notifications (recipient_id, sender_id, notification_type, title, message, related_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          plId,
          lecturer_id,
          'rating',
          'New PRL Rating',
          `${lecturerName} rated PRL ${prlName} - Score: ${score}/5`,
          ratingId
        ]
      );
    }

    res.json({ message: "Rating submitted successfully to Program Leader" });
  } catch (err) {
    console.error("❌ ERROR in /api/lecturer/rate-prl:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;