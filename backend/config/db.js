require("dotenv").config();
const mysql = require("mysql2");

// Create a connection POOL (async, efficient, handles reconnects)
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "portfolio",
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Auto-enable SSL for remote databases (e.g. Aiven)
if (poolConfig.host !== "localhost" && poolConfig.host !== "127.0.0.1") {
  poolConfig.ssl = {
    rejectUnauthorized: false
  };
}

const pool = mysql.createPool(poolConfig);

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