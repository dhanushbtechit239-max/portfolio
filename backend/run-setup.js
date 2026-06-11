/**
 * run-setup.js
 * Idempotent setup: creates DB + tables if not exist, then seeds projects.
 * Safe to run multiple times.
 * Usage: node run-setup.js
 */
require("dotenv").config();
const mysql = require("mysql2");

function createConnection(database = null) {
  const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  };
  if (database) config.database = database;
  return mysql.createConnection(config).promise();
}

async function run() {
  let conn;
  try {
    // Step 1 — connect without DB
    conn = await createConnection();
    console.log("✅ Connected to MySQL server");

    // Step 2 — create database
    await conn.query(`CREATE DATABASE IF NOT EXISTS portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log("✅ Database 'portfolio' ready");

    await conn.query("USE portfolio");

    // Step 3 — create tables (with all columns)
    await conn.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        title      VARCHAR(255)  NOT NULL,
        description TEXT,
        tags       VARCHAR(500)  DEFAULT '',
        emoji      VARCHAR(10)   DEFAULT '🚀',
        gradient   VARCHAR(255)  DEFAULT 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
        github_url VARCHAR(500)  DEFAULT '',
        live_url   VARCHAR(500)  DEFAULT '',
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 4 — add missing columns if table already existed without them
    const columnsToAdd = [
      ["tags",       "VARCHAR(500)  DEFAULT '' AFTER description"],
      ["emoji",      "VARCHAR(10)   DEFAULT '🚀' AFTER tags"],
      ["gradient",   "VARCHAR(255)  DEFAULT 'linear-gradient(135deg, #6c5ce7, #a29bfe)' AFTER emoji"],
      ["github_url", "VARCHAR(500)  DEFAULT '' AFTER gradient"],
      ["live_url",   "VARCHAR(500)  DEFAULT '' AFTER github_url"],
    ];

    for (const [col, def] of columnsToAdd) {
      try {
        await conn.query(`ALTER TABLE projects ADD COLUMN ${col} ${def}`);
        console.log(`   ➕ Added column: ${col}`);
      } catch (_) {
        // Column already exists — skip silently
      }
    }

    await conn.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(255)  NOT NULL,
        email      VARCHAR(255)  NOT NULL,
        subject    VARCHAR(500)  DEFAULT '',
        message    TEXT          NOT NULL,
        created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Tables ready: projects, contacts");

    // Step 5 — check if projects table is empty before seeding
    const [[{ count }]] = await conn.query("SELECT COUNT(*) as count FROM projects");

    if (parseInt(count) === 0) {
      await conn.query(`
        INSERT INTO projects (title, description, tags, emoji, gradient, github_url, live_url) VALUES
        (
          'Election Analytics Dashboard',
          'A full-featured election management system with real-time vote tracking, OTP authentication, and live result analytics. Built with a secure backend and intuitive admin panel.',
          'React,Node.js,MySQL,Express',
          '🗳️',
          'linear-gradient(135deg, #6c5ce7, #a29bfe)',
          'https://github.com/dhanush',
          ''
        ),
        (
          'E-Commerce Platform',
          'Modern shopping experience with cart management, payment integration, product filtering, and a full admin panel for inventory management.',
          'JavaScript,CSS3,REST API,Node.js',
          '🛒',
          'linear-gradient(135deg, #00cec9, #0984e3)',
          'https://github.com/dhanush',
          ''
        ),
        (
          'Student Management System',
          'Attendance tracking, grade management, and comprehensive student analytics dashboard. Features role-based access for admins and faculty.',
          'Java,Servlets,MySQL,HTML',
          '📊',
          'linear-gradient(135deg, #fd79a8, #e84393)',
          'https://github.com/dhanush',
          ''
        )
      `);
      console.log("🌱 Seeded 3 projects");
    } else {
      console.log(`ℹ️  Projects table already has ${count} row(s), skipping seed`);
    }

    // Step 6 — verify
    const [rows] = await conn.query("SELECT id, title, emoji FROM projects");
    console.log("\n📋 Projects in database:");
    rows.forEach((r) => console.log(`   [${r.id}] ${r.emoji} ${r.title}`));

    console.log("\n🎉 Setup complete! Now run:\n   cd backend && npm run dev\n   Then open frontend/index.html in your browser.\n");

  } catch (err) {
    console.error("❌ Setup failed:", err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

run();
