// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";
const SALT_ROUNDS = 10;

// Helper: standard server error
function sendServerError(res, err) {
  console.error(err);
  return res.status(500).json({ message: "Server error", error: err.message });
}

// ========================
// REGISTER
// ========================
router.post("/register", async (req, res) => {
  const { 
    role, 
    first_name,
    last_name,
    username,
    email, 
    password,
    password_confirm,
    student_number,
    primary_stream_id,
    streams // array of stream IDs for lecturers
  } = req.body;

  try {
    // Validation
    if (!role) return res.status(400).json({ message: "Role is required" });
    if (!first_name || !last_name) {
      return res.status(400).json({ message: "First name and last name are required" });
    }
    if (!username) return res.status(400).json({ message: "Username is required" });
    if (!password || !password_confirm) {
      return res.status(400).json({ message: "Password is required" });
    }
    if (password !== password_confirm) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // -------- STUDENT REGISTRATION --------
    if (role === "student") {
      if (!student_number || !primary_stream_id) {
        return res.status(400).json({ 
          message: "Student number and stream are required" 
        });
      }

      // Check if username exists
      const userExists = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username.toLowerCase()]
      );
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Check if student number exists
      const studentExists = await db.query(
        "SELECT * FROM users WHERE student_id = $1",
        [student_number]
      );
      if (studentExists.rows.length > 0) {
        return res.status(400).json({ message: "Student number already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Register student
      await db.query(
        `INSERT INTO users (first_name, last_name, username, student_id, role, primary_stream_id, password) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [first_name, last_name, username.toLowerCase(), student_number, "student", primary_stream_id, hashedPassword]
      );

      return res.json({ message: "Student registered successfully" });
    }

    // -------- LECTURER/PRL/PL REGISTRATION --------
    if (role === "lecturer" || role === "PRL" || role === "PL") {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if username exists
      const userExists = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username.toLowerCase()]
      );
      if (userExists.rows.length > 0) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Check if email already exists
      const emailExists = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email.toLowerCase()]
      );
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Register user
      const userResult = await db.query(
        `INSERT INTO users (first_name, last_name, username, email, password, role, primary_stream_id) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [first_name, last_name, username.toLowerCase(), email.toLowerCase(), hashedPassword, role, primary_stream_id || null]
      );

      const userId = userResult.rows[0].id;

      // Add to lecturer_streams (handle multiple streams for lecturers)
      if ((role === "lecturer" || role === "PRL") && streams && Array.isArray(streams) && streams.length > 0) {
        for (const streamId of streams) {
          await db.query(
            `INSERT INTO lecturer_streams (lecturer_id, stream_id) 
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [userId, streamId]
          );
        }
      } else if (primary_stream_id) {
        // Add primary stream if no streams provided
        await db.query(
          `INSERT INTO lecturer_streams (lecturer_id, stream_id) 
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, primary_stream_id]
        );
      }

      return res.json({ message: `${role} registered successfully` });
    }

  } catch (err) {
    return sendServerError(res, err);
  }
});

// ========================
// LOGIN
// ========================
router.post("/login", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Find user by username
    const result = await db.query(
      "SELECT * FROM users WHERE LOWER(username) = $1 AND LOWER(role) = $2",
      [username.toLowerCase(), role.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid username or role" });
    }

    const user = result.rows[0];

    // Compare password with hash
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user data (exclude password)
    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      email: user.email,
      role: user.role,
      primary_stream_id: user.primary_stream_id
    };

    return res.json({ 
      message: "Login successful", 
      token, 
      user: userData 
    });

  } catch (err) {
    return sendServerError(res, err);
  }
});

// ========================
// GET ALL STREAMS (for registration dropdowns)
// ========================
router.get("/streams", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, stream_name, stream_code FROM streams ORDER BY stream_code"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;