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
  image_url  VARCHAR(500)  DEFAULT '',
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

-- ── Seed: Pre-populate your 5 existing projects ─────────────
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
);

SELECT '✅ Database setup complete!' AS status;
SELECT CONCAT('Projects seeded: ', COUNT(*)) AS info FROM projects;
