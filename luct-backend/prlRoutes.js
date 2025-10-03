// Get courses under PRL
app.get("/api/prl/courses/:prlId", async (req, res) => {
  const prlId = req.params.prlId;

  try {
    const [rows] = await db.query(
      `SELECT courses.code, courses.name, users.name as lecturer 
       FROM courses 
       JOIN users ON courses.lecturer_id = users.id 
       WHERE courses.prl_id = ?`,
      [prlId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get reports under PRL
app.get("/api/prl/reports/:prlId", async (req, res) => {
  const prlId = req.params.prlId;

  try {
    const [rows] = await db.query(
      `SELECT r.*, u.name as lecturer_name, c.name as course_name, c.code as course_code
       FROM reports r
       JOIN users u ON r.lecturer_id = u.id
       JOIN courses c ON r.course_id = c.id
       WHERE r.prl_id = ?`,
      [prlId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit feedback
app.post("/api/prl/feedback", async (req, res) => {
  const { prl_id, report_id, feedback } = req.body;

  try {
    await db.query(
      "INSERT INTO feedback (prl_id, report_id, feedback) VALUES (?, ?, ?)",
      [prl_id, report_id, feedback]
    );
    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
