// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const authenticatePL = (req, res, next) => {
  authenticate(req, res, () => {
    if (req.user.role !== "PL") return res.status(403).json({ message: "Access denied" });
    next();
  });
};

module.exports = { authenticate, authenticatePL };
