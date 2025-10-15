// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { authenticate } = require("../middleware/authMiddleware");

// ========================
// GET USER'S NOTIFICATIONS
// ========================
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT n.*, 
              sender.first_name || ' ' || sender.last_name as sender_name,
              sender.student_id
       FROM notifications n
       LEFT JOIN users sender ON n.sender_id = sender.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ ERROR in GET /api/notifications:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// GET UNREAD COUNT
// ========================
router.get("/unread-count", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT COUNT(*) as unread_count
       FROM notifications
       WHERE recipient_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ unread_count: parseInt(result.rows[0].unread_count) });
  } catch (err) {
    console.error("❌ ERROR in GET /api/notifications/unread-count:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// MARK NOTIFICATION AS READ
// ========================
router.put("/:notificationId/read", authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await db.query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND recipient_id = $2`,
      [notificationId, userId]
    );

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("❌ ERROR in PUT /api/notifications/:id/read:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// MARK ALL AS READ
// ========================
router.put("/mark-all-read", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE recipient_id = $1 AND is_read = false`,
      [userId]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("❌ ERROR in PUT /api/notifications/mark-all-read:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ========================
// DELETE NOTIFICATION
// ========================
router.delete("/:notificationId", authenticate, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await db.query(
      `DELETE FROM notifications 
       WHERE id = $1 AND recipient_id = $2`,
      [notificationId, userId]
    );

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("❌ ERROR in DELETE /api/notifications/:id:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;