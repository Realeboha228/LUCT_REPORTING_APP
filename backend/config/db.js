const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || '0883',
  database: process.env.DB_NAME || 'luct_reporting_rea',
  port: process.env.DB_PORT || 5432, // PostgreSQL default port
});

// Optional: Test the connection
db.on('connect', () => {
  console.log('PostgreSQL Connected');
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = db;