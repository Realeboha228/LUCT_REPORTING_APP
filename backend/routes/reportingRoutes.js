// routes/reportingRoutes.js
// General reporting routes (ratings, monitoring, etc.)
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware");

// ------------------------
// SUBMIT RATING
// ------------------------
router.post("/ratings", authenticate, async (req, res) => {
  try {
    const { ratee_id, score, comments, rating_type } = req.body;
    const rater_id = req.user.id;

    if (!ratee_id || !score) {
      return res.status(400).json({ message: "Ratee ID and score are required" });
    }

    // Insert rating
    const ratingResult = await db.query(
      `INSERT INTO ratings (rater_id, ratee_id, rating_type, score, comments)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [rater_id, ratee_id, rating_type || "student_to_lecturer", score, comments]
    );

    const ratingId = ratingResult.rows[0].id;

    // If this is a student rating a lecturer, notify the PRL
    if (rating_type === "student_to_lecturer" || !rating_type) {
      // Get student info
      const studentInfo = await db.query(
        `SELECT first_name, last_name, student_id, primary_stream_id FROM users WHERE id = $1`,
        [rater_id]
      );

      if (studentInfo.rows.length > 0) {
        const studentName = `${studentInfo.rows[0].first_name} ${studentInfo.rows[0].last_name}`;
        const studentNumber = studentInfo.rows[0].student_id;
        const streamId = studentInfo.rows[0].primary_stream_id;

        // Get lecturer info
        const lecturerInfo = await db.query(
          `SELECT first_name, last_name FROM users WHERE id = $1`,
          [ratee_id]
        );

        const lecturerName = lecturerInfo.rows.length > 0 
          ? `${lecturerInfo.rows[0].first_name} ${lecturerInfo.rows[0].last_name}`
          : "Unknown Lecturer";

        // Get PRL of student's stream
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
                rater_id,
                'rating',
                'New Lecturer Rating',
                `${studentName} (${studentNumber}) rated ${lecturerName} - Score: ${score}/5`,
                ratingId
              ]
            );
          }
        }
      }
    }

    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/ratings POST:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET RATINGS FOR A USER
// ------------------------
router.get("/ratings/:userId", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const result = await db.query(
      `SELECT AVG(score) AS avg_rating, COUNT(*) as total_ratings 
       FROM ratings 
       WHERE ratee_id = $1`,
      [userId]
    );
    
    const detailsResult = await db.query(
      `SELECT r.*, 
              COALESCE(u.first_name || ' ' || u.last_name, u.name) as rater_name 
       FROM ratings r
       LEFT JOIN users u ON r.rater_id = u.id
       WHERE r.ratee_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      avg_rating: result.rows[0].avg_rating || 0,
      total_ratings: parseInt(result.rows[0].total_ratings),
      ratings: detailsResult.rows
    });
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/ratings GET:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET MY RATINGS (ratings I've given)
// ------------------------
router.get("/my-ratings", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT r.*, 
              COALESCE(u.first_name || ' ' || u.last_name, u.name) as ratee_name, 
              u.role as ratee_role
       FROM ratings r
       JOIN users u ON r.ratee_id = u.id
       WHERE r.rater_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/my-ratings:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// GET REPORT BY ID
// ------------------------
router.get("/reports/:reportId", authenticate, async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const result = await db.query(
      `SELECT r.*, m.module_name, m.module_code, 
              COALESCE(u.first_name || ' ' || u.last_name, u.name) as lecturer_name, 
              s.stream_name, s.stream_code,
              COALESCE(prl.first_name || ' ' || prl.last_name, prl.name) as prl_name
       FROM reports r
       JOIN modules m ON r.module_id = m.id
       JOIN streams s ON m.stream_id = s.id
       JOIN users u ON r.lecturer_id = u.id
       LEFT JOIN users prl ON r.prl_id = prl.id
       WHERE r.id = $1`,
      [reportId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/reports/:reportId:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// MONITORING: Get Recent Activity
// ------------------------
router.get("/monitoring/recent", authenticate, async (req, res) => {
  try {
    // Get recent reports
    const reportsResult = await db.query(
      `SELECT r.id, r.created_at, r.status, 
              m.module_name, 
              COALESCE(u.first_name || ' ' || u.last_name, u.name) as lecturer_name, 
              s.stream_name
       FROM reports r
       JOIN modules m ON r.module_id = m.id
       JOIN users u ON r.lecturer_id = u.id
       JOIN streams s ON m.stream_id = s.id
       ORDER BY r.created_at DESC
       LIMIT 10`
    );

    // Get recent ratings
    const ratingsResult = await db.query(
      `SELECT r.id, r.score, r.rating_type, r.created_at,
              COALESCE(rater.first_name || ' ' || rater.last_name, rater.name) as rater_name, 
              COALESCE(ratee.first_name || ' ' || ratee.last_name, ratee.name) as ratee_name
       FROM ratings r
       JOIN users rater ON r.rater_id = rater.id
       JOIN users ratee ON r.ratee_id = ratee.id
       ORDER BY r.created_at DESC
       LIMIT 10`
    );

    res.json({
      recent_reports: reportsResult.rows,
      recent_ratings: ratingsResult.rows
    });
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/monitoring/recent:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ------------------------
// MONITORING: Get Statistics by Stream
// ------------------------
router.get("/monitoring/streams", authenticate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.stream_name, s.stream_code,
              COUNT(DISTINCT m.id) as total_modules,
              COUNT(DISTINCT m.lecturer_id) as total_lecturers,
              COUNT(DISTINCT ms.student_id) as total_students,
              COUNT(DISTINCT r.id) as total_reports
       FROM streams s
       LEFT JOIN modules m ON s.id = m.stream_id
       LEFT JOIN module_students ms ON m.id = ms.module_id
       LEFT JOIN reports r ON m.id = r.module_id
       GROUP BY s.id, s.stream_name, s.stream_code
       ORDER BY s.stream_code`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in /api/reporting/monitoring/streams:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;