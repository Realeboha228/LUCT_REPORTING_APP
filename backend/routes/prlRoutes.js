// routes/prlRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticatePRL } = require("../middleware/authMiddleware");

// ------------------------
// GET ALL MODULES IN PRL'S STREAM
// ------------------------
router.get("/courses", authenticatePRL, async (req, res) => {
  try {
    const prlId = req.user.id;
    
    // Get PRL's stream
    const prlResult = await db.query(
      "SELECT primary_stream_id FROM users WHERE id = $1",
      [prlId]
    );

    if (prlResult.rows.length === 0 || !prlResult.rows[0].primary_stream_id) {
      return res.status(400).json({ message: "PRL not assigned to a stream" });
    }

    const streamId = prlResult.rows[0].primary_stream_id;

    // Get all modules in this stream
    const result = await db.query(
      `SELECT m.*, 
              COALESCE(u.first_name || ' ' || u.last_name, u.name) as lecturer_name, 
              s.stream_name, 
              s.stream_code
       FROM modules m
       LEFT JOIN users u ON m.lecturer_id = u.id
       JOIN streams s ON m.stream_id = s.id
       WHERE m.stream_id = $1
       ORDER BY m.module_code`,
      [streamId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/prl/courses:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL REPORTS IN PRL'S STREAM
// ------------------------
router.get("/reports", authenticatePRL, async (req, res) => {
  try {
    const prlId = req.user.id;
    
    // Get PRL's stream
    const prlResult = await db.query(
      "SELECT primary_stream_id FROM users WHERE id = $1",
      [prlId]
    );

    if (prlResult.rows.length === 0 || !prlResult.rows[0].primary_stream_id) {
      return res.status(400).json({ message: "PRL not assigned to a stream" });
    }

    const streamId = prlResult.rows[0].primary_stream_id;

    // Get all reports in this stream
    const result = await db.query(
      `SELECT r.*, 
              m.module_name, 
              m.module_code, 
              COALESCE(u.first_name || ' ' || u.last_name, u.name) as lecturer_name, 
              s.stream_name, 
              s.stream_code
       FROM reports r
       JOIN modules m ON r.module_id = m.id
       JOIN streams s ON m.stream_id = s.id
       JOIN users u ON r.lecturer_id = u.id
       WHERE m.stream_id = $1
       ORDER BY r.created_at DESC`,
      [streamId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/prl/reports:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// ADD FEEDBACK TO A REPORT
// ------------------------
router.put("/reports/:reportId/feedback", authenticatePRL, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { prl_feedback } = req.body;

    if (!prl_feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    await db.query(
      `UPDATE reports 
       SET prl_feedback = $1, status = 'reviewed_by_prl', reviewed_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [prl_feedback, reportId]
    );

    res.json({ message: "Feedback added successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/prl/reports/:reportId/feedback:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL LECTURERS IN PRL'S STREAM
// ------------------------
router.get("/lecturers", authenticatePRL, async (req, res) => {
  try {
    const prlId = req.user.id;
    
    // Get PRL's stream
    const prlResult = await db.query(
      "SELECT primary_stream_id FROM users WHERE id = $1",
      [prlId]
    );

    if (prlResult.rows.length === 0 || !prlResult.rows[0].primary_stream_id) {
      return res.status(400).json({ message: "PRL not assigned to a stream" });
    }

    const streamId = prlResult.rows[0].primary_stream_id;

    // Get all lecturers teaching in this stream
    const result = await db.query(
      `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email
       FROM users u
       JOIN lecturer_streams ls ON u.id = ls.lecturer_id
       WHERE ls.stream_id = $1 AND u.role = 'lecturer'
       ORDER BY u.first_name, u.last_name`,
      [streamId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/prl/lecturers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET PRL'S STREAM INFO
// ------------------------
router.get("/stream", authenticatePRL, async (req, res) => {
  try {
    const prlId = req.user.id;
    
    const result = await db.query(
      `SELECT s.* 
       FROM streams s
       JOIN users u ON u.primary_stream_id = s.id
       WHERE u.id = $1`,
      [prlId]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "PRL not assigned to a stream" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ ERROR in /api/prl/stream:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// RATE A LECTURER (PRL to Lecturer)
// ------------------------
router.post("/rate-lecturer", authenticatePRL, async (req, res) => {
  try {
    const { lecturer_id, score, comments } = req.body;
    const prl_id = req.user.id;

    if (!lecturer_id || !score) {
      return res.status(400).json({ message: "Lecturer ID and score are required" });
    }

    await db.query(
      `INSERT INTO ratings (rater_id, ratee_id, rating_type, score, comments)
       VALUES ($1, $2, $3, $4, $5)`,
      [prl_id, lecturer_id, 'prl_to_lecturer', score, comments]
    );

    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/prl/rate-lecturer:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;