// db/dbConnection.js
// const mysql = require('mysql2/promise');\\

import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: 'localhost',   
  user: 'root',          
  password: '654731Cyber!', 
  database: 'portal',     
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
