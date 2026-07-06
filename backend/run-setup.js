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
        image_url  VARCHAR(500)  DEFAULT '',
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
      ["image_url",  "VARCHAR(500)  DEFAULT '' AFTER live_url"],
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
        INSERT INTO projects (title, description, tags, emoji, gradient, github_url, live_url, image_url) VALUES
        (
          'E-Commerce Website',
          'Modern e-commerce platform featuring product listings, search filters, and an interactive shopping cart system.',
          'JavaScript,CSS3,HTML5,Node.js',
          '🛒',
          'linear-gradient(135deg, #00cec9, #0984e3)',
          'https://github.com/dhanushbtechit239-max/E-commerce-website',
          '',
          'assets/projects/ecommerce.png'
        ),
        (
          'Portfolio Website',
          'My personal developer portfolio website highlighting my projects, skills, education, and experience. Features live backend statistics, an interactive AI chatbot, and a contact form.',
          'JavaScript,CSS3,HTML5,Express,MySQL',
          '✨',
          'linear-gradient(135deg, #a29bfe, #6c5ce7)',
          'https://github.com/dhanushbtechit239-max/portfolio',
          '',
          'assets/projects/portfolio.png'
        ),
        (
          'Learning Management System',
          'A python-based web application built during my internship at Pristonix Technologies, facilitating student learning paths, dashboards, and role-based permissions.',
          'Python,Flask,MongoDB,HTML5',
          '📚',
          'linear-gradient(135deg, #ff7675, #d63031)',
          'https://github.com/dhanushbtechit239-max/learning-management-system',
          '',
          'assets/projects/lms.png'
        ),
        (
          'Task Management System',
          'An intuitive task organization application to plan, prioritize, and monitor daily tasks.',
          'JavaScript,HTML5,CSS3',
          '📋',
          'linear-gradient(135deg, #55efc4, #00b894)',
          'https://github.com/dhanushbtechit239-max/task-management',
          '',
          'assets/projects/taskmanager.png'
        ),
        (
          'Blog Platform',
          'A functional blogging web platform allowing users to create posts, categorize topics, and leave comments.',
          'JavaScript,Node.js,Express,MongoDB',
          '✍️',
          'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
          'https://github.com/dhanushbtechit239-max/blog-plotform',
          '',
          'assets/projects/blog.png'
        )
      `);
      console.log("🌱 Seeded 5 projects");
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
