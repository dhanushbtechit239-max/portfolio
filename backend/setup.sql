-- ============================================================
-- Portfolio Database Setup Script
-- Run this once in MySQL Workbench or terminal:
--   mysql -u root -p < setup.sql
-- ============================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS portfolio
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE portfolio;

-- ── Projects Table ──────────────────────────────────────────
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
);

-- ── Contacts Table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255)  NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  subject    VARCHAR(500)  DEFAULT '',
  message    TEXT          NOT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── Seed: Pre-populate your 3 existing projects ─────────────
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
);

SELECT '✅ Database setup complete!' AS status;
SELECT CONCAT('Projects seeded: ', COUNT(*)) AS info FROM projects;
