// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// Base authentication - verifies JWT token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Authenticate and check if user is a Program Leader
const authenticatePL = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "PL") {
      return res.status(403).json({ message: "Access denied. PL only." });
    }
    next();
  });
};

// Authenticate and check if user is a Principal Lecturer
const authenticatePRL = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "PRL") {
      return res.status(403).json({ message: "Access denied. PRL only." });
    }
    next();
  });
};

// Authenticate and check if user is a Lecturer
const authenticateLecturer = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "lecturer") {
      return res.status(403).json({ message: "Access denied. Lecturer only." });
    }
    next();
  });
};

// Authenticate and check if user is a Student
const authenticateStudent = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Student only." });
    }
    next();
  });
};

module.exports = {
  authenticate,
  authenticatePL,
  authenticatePRL,
  authenticateLecturer,
  authenticateStudent,
  JWT_SECRET
};