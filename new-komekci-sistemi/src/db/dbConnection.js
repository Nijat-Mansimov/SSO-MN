// db/dbConnection.js
// const mysql = require('mysql2/promise');\\

import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: 'localhost',     // change if not local
  user: 'portaluser',          // your MySQL username
  password: 'Cyber2025!', // your MySQL password
  database: 'ticketing_app',     // your database name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
