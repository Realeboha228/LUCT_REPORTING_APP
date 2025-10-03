const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '2468',
  database: 'luct_reporting'
});
db.connect(err => {
  if(err) throw err;
  console.log('MySQL Connected');
});
module.exports = db;
