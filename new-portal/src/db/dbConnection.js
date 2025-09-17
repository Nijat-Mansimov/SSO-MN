// db/dbConnection.js
// const mysql = require('mysql2/promise');\\

import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: 'localhost',     // change if not local
  user: 'root',          // your MySQL username
  password: '654731Cyber!', // your MySQL password
  database: 'portal',     // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
