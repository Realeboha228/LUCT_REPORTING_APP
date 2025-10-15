// routes/plRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticatePL } = require("../middleware/authMiddleware");

// ------------------------
// GET ALL MODULES (ALL STREAMS) - FIXED
// ------------------------
router.get("/courses", authenticatePL, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*, 
              COALESCE(u.first_name || ' ' || u.last_name, 'Not Assigned') as lecturer_name, 
              s.stream_name, 
              s.stream_code
       FROM modules m
       LEFT JOIN users u ON m.lecturer_id = u.id
       JOIN streams s ON m.stream_id = s.id
       ORDER BY s.stream_code, m.module_code`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/pl/courses:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// ADD NEW COURSE/MODULE - FIXED
// ------------------------
router.post("/courses", authenticatePL, async (req, res) => {
  try {
    const { module_name, module_code, class_name, lecturer_id, stream_id } = req.body;

    if (!module_name || !module_code || !stream_id) {
      return res.status(400).json({ message: "Module name, code, and stream are required" });
    }

    // Check if module code already exists
    const existing = await db.query(
      "SELECT * FROM modules WHERE module_code = $1",
      [module_code]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Module code already exists" });
    }

    await db.query(
      `INSERT INTO modules (module_name, module_code, class_name, lecturer_id, stream_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [module_name, module_code, class_name, lecturer_id || null, stream_id]
    );

    // If lecturer assigned, add to lecturer_streams if not already there
    if (lecturer_id) {
      await db.query(
        `INSERT INTO lecturer_streams (lecturer_id, stream_id) 
         VALUES ($1, $2) 
         ON CONFLICT DO NOTHING`,
        [lecturer_id, stream_id]
      );
    }

    res.json({ message: "Course added successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/pl/courses POST:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// ASSIGN LECTURER TO COURSE - FIXED
// ------------------------
router.put("/courses/:courseId/assign-lecturer", authenticatePL, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { lecturer_id } = req.body;

    if (!lecturer_id) {
      return res.status(400).json({ message: "Lecturer ID is required" });
    }

    // Get module's stream
    const moduleResult = await db.query(
      "SELECT stream_id FROM modules WHERE id = $1",
      [courseId]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ message: "Module not found" });
    }

    const streamId = moduleResult.rows[0].stream_id;

    // Update module with lecturer
    await db.query(
      "UPDATE modules SET lecturer_id = $1 WHERE id = $2",
      [lecturer_id, courseId]
    );

    // Add lecturer to stream if not already there
    await db.query(
      `INSERT INTO lecturer_streams (lecturer_id, stream_id) 
       VALUES ($1, $2) 
       ON CONFLICT DO NOTHING`,
      [lecturer_id, streamId]
    );

    res.json({ message: "Lecturer assigned successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/pl/courses/assign-lecturer:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL REPORTS FROM ALL STREAMS - FIXED
// ------------------------
router.get("/reports", authenticatePL, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              m.module_name, 
              m.module_code, 
              COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as lecturer_name, 
              s.stream_name, 
              s.stream_code,
              COALESCE(prl.first_name || ' ' || prl.last_name, 'No PRL') as prl_name
       FROM reports r
       JOIN modules m ON r.module_id = m.id
       JOIN streams s ON m.stream_id = s.id
       JOIN users u ON r.lecturer_id = u.id
       LEFT JOIN users prl ON r.prl_id = prl.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/pl/reports:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// ADD PL FEEDBACK TO REPORT - FIXED
// ------------------------
router.put("/reports/:reportId/feedback", authenticatePL, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { pl_feedback } = req.body;

    if (!pl_feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    await db.query(
      `UPDATE reports 
       SET pl_feedback = $1, status = 'approved'
       WHERE id = $2`,
      [pl_feedback, reportId]
    );

    res.json({ message: "Feedback added successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/pl/reports/feedback:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL LECTURERS - FIXED
// ------------------------
router.get("/lecturers", authenticatePL, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, 
              u.first_name, 
              u.last_name, 
              u.email, 
              u.primary_stream_id, 
              s.stream_name
       FROM users u
       LEFT JOIN streams s ON u.primary_stream_id = s.id
       WHERE u.role = 'lecturer'
       ORDER BY u.first_name, u.last_name`
    );
    
    console.log("✅ Lecturers fetched:", result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/pl/lecturers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL PRLs - FIXED
// ------------------------
router.get("/prls", authenticatePL, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, 
              u.first_name, 
              u.last_name, 
              u.email, 
              u.primary_stream_id, 
              s.stream_name, 
              s.stream_code
       FROM users u
       LEFT JOIN streams s ON u.primary_stream_id = s.id
       WHERE u.role = 'PRL'
       ORDER BY s.stream_code`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/pl/prls:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL STREAMS
// ------------------------
router.get("/streams", authenticatePL, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM streams ORDER BY stream_code"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/pl/streams:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET DASHBOARD STATS - FIXED
// ------------------------
router.get("/dashboard", authenticatePL, async (req, res) => {
  try {
    // Get counts for dashboard
    const streamsResult = await db.query("SELECT COUNT(*) FROM streams");
    const modulesResult = await db.query("SELECT COUNT(*) FROM modules");
    const lecturersResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'lecturer'");
    const prlsResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'PRL'");
    const studentsResult = await db.query("SELECT COUNT(*) FROM users WHERE role = 'student'");
    const reportsResult = await db.query("SELECT COUNT(*) FROM reports");
    const pendingReportsResult = await db.query("SELECT COUNT(*) FROM reports WHERE status = 'pending'");

    res.json({
      streams: parseInt(streamsResult.rows[0].count),
      modules: parseInt(modulesResult.rows[0].count),
      courses: parseInt(modulesResult.rows[0].count), // Alias for backward compatibility
      lecturers: parseInt(lecturersResult.rows[0].count),
      prls: parseInt(prlsResult.rows[0].count),
      students: parseInt(studentsResult.rows[0].count),
      total_reports: parseInt(reportsResult.rows[0].count),
      pending_reports: parseInt(pendingReportsResult.rows[0].count)
    });
  } catch (err) {
    console.error("❌ ERROR in /api/pl/dashboard:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET ALL RATINGS ACROSS STREAMS (NEW - FOR VIEWING ONLY)
// ------------------------
router.get("/all-ratings", authenticatePL, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, 
              COALESCE(rater.first_name || ' ' || rater.last_name, 'Unknown') as rater_name,
              COALESCE(ratee.first_name || ' ' || ratee.last_name, 'Unknown') as ratee_name,
              rater.role as rater_role,
              ratee.role as ratee_role
       FROM ratings r
       LEFT JOIN users rater ON r.rater_id = rater.id
       LEFT JOIN users ratee ON r.ratee_id = ratee.id
       ORDER BY r.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/pl/all-ratings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// RATE A PRL (Optional - kept for compatibility)
// ------------------------
router.post("/rate-prl", authenticatePL, async (req, res) => {
  try {
    const { prl_id, score, comments } = req.body;
    const pl_id = req.user.id;

    if (!prl_id || !score) {
      return res.status(400).json({ message: "PRL ID and score are required" });
    }

    await db.query(
      `INSERT INTO ratings (rater_id, ratee_id, rating_type, score, comments)
       VALUES ($1, $2, $3, $4, $5)`,
      [pl_id, prl_id, 'pl_to_prl', score, comments]
    );

    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/pl/rate-prl:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;