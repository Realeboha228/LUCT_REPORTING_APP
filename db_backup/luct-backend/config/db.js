// db.js
const mysql = require("mysql2/promise"); // IMPORTANT: use /promise
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "2468",
  database: process.env.DB_NAME || "luct_reporting",
});

module.exports = db;
