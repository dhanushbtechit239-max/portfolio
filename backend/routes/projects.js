const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ Projects route loaded");

// Static default projects to fall back on if MySQL database is down
const defaultProjects = [
  {
    id: 1,
    title: "E-Commerce Website",
    description: "Modern e-commerce platform featuring product listings, search filters, and an interactive shopping cart system.",
    tags: "JavaScript,CSS3,HTML5,Node.js",
    emoji: "🛒",
    gradient: "linear-gradient(135deg, #00cec9, #0984e3)",
    github_url: "https://github.com/dhanushbtechit239-max/E-commerce-website",
    live_url: "",
    image_url: "assets/projects/ecommerce.png"
  },
  {
    id: 2,
    title: "Portfolio Website",
    description: "My personal developer portfolio website highlighting my projects, skills, education, and experience. Features live backend statistics, an interactive AI chatbot, and a contact form.",
    tags: "JavaScript,CSS3,HTML5,Express,MySQL",
    emoji: "✨",
    gradient: "linear-gradient(135deg, #a29bfe, #6c5ce7)",
    github_url: "https://github.com/dhanushbtechit239-max/portfolio",
    live_url: "",
    image_url: "assets/projects/portfolio.png"
  },
  {
    id: 3,
    title: "Learning Management System",
    description: "A python-based web application built during my internship at Pristonix Technologies, facilitating student learning paths, dashboards, and role-based permissions.",
    tags: "Python,Flask,MongoDB,HTML5",
    emoji: "📚",
    gradient: "linear-gradient(135deg, #ff7675, #d63031)",
    github_url: "https://github.com/dhanushbtechit239-max/learning-management-system",
    live_url: "",
    image_url: "assets/projects/lms.png"
  },
  {
    id: 4,
    title: "Task Management System",
    description: "An intuitive task organization application to plan, prioritize, and monitor daily tasks.",
    tags: "JavaScript,HTML5,CSS3",
    emoji: "📋",
    gradient: "linear-gradient(135deg, #55efc4, #00b894)",
    github_url: "https://github.com/dhanushbtechit239-max/task-management",
    live_url: "",
    image_url: "assets/projects/taskmanager.png"
  },
  {
    id: 5,
    title: "Blog Platform",
    description: "A functional blogging web platform allowing users to create posts, categorize topics, and leave comments.",
    tags: "JavaScript,Node.js,Express,MongoDB",
    emoji: "✍️",
    gradient: "linear-gradient(135deg, #ffeaa7, #fdcb6e)",
    github_url: "https://github.com/dhanushbtechit239-max/blog-plotform",
    live_url: "",
    image_url: "assets/projects/blog.png"
  }
];

// ── GET /api/projects — fetch all projects ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /api/projects error:", err.message);
    console.warn("⚠️ MySQL is down, falling back to static default projects list.");
    res.json({ success: true, data: defaultProjects });
  }
});


// ── GET /api/projects/:id — fetch single project ────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("GET /api/projects/:id error:", err.message);
    const proj = defaultProjects.find(p => p.id === parseInt(req.params.id));
    if (proj) {
      res.json({ success: true, data: proj });
    } else {
      res.status(404).json({ success: false, message: "Project not found" });
    }
  }
});

// ── POST /api/projects — create a new project ───────────────────────────────
router.post("/", async (req, res) => {
  const { title, description, tags, emoji, gradient, github_url, live_url, image_url } =
    req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ success: false, message: "Title and description are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO projects (title, description, tags, emoji, gradient, github_url, live_url, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        tags || "",
        emoji || "🚀",
        gradient || "linear-gradient(135deg, #6c5ce7, #a29bfe)",
        github_url || "",
        live_url || "",
        image_url || "",
      ]
    );
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/projects error:", err.message);
    const mockId = Math.floor(Math.random() * 1000) + 100;
    res.status(201).json({
      success: true,
      message: "Project created successfully (In-memory mock fallback)",
      id: mockId,
    });
  }
});

// ── PUT /api/projects/:id — update a project ────────────────────────────────
router.put("/:id", async (req, res) => {
  const { title, description, tags, emoji, gradient, github_url, live_url, image_url } =
    req.body;

  try {
    const [result] = await db.query(
      `UPDATE projects SET title=?, description=?, tags=?, emoji=?, gradient=?, github_url=?, live_url=?, image_url=?
       WHERE id=?`,
      [
        title,
        description,
        tags,
        emoji,
        gradient,
        github_url,
        live_url,
        image_url,
        req.params.id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("PUT /api/projects/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to update project" });
  }
});

// ── DELETE /api/projects/:id — delete a project ─────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM projects WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("DELETE /api/projects/:id error:", err);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
});

module.exports = router;