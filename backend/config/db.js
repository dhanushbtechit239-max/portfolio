require("dotenv").config();
const mysql = require("mysql2");

// Create a connection POOL (async, efficient, handles reconnects)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portfolio",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ MySQL Connected successfully!");
    connection.release();
  }
});

// Export promise-based pool for async/await usage
module.exports = pool.promise();