const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ Projects route loaded");

// ── GET /api/projects — fetch all projects ──────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
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
    console.error("GET /api/projects/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── POST /api/projects — create a new project ───────────────────────────────
router.post("/", async (req, res) => {
  const { title, description, tags, emoji, gradient, github_url, live_url } =
    req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ success: false, message: "Title and description are required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO projects (title, description, tags, emoji, gradient, github_url, live_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        tags || "",
        emoji || "🚀",
        gradient || "linear-gradient(135deg, #6c5ce7, #a29bfe)",
        github_url || "",
        live_url || "",
      ]
    );
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/projects error:", err);
    res.status(500).json({ success: false, message: "Failed to create project" });
  }
});

// ── PUT /api/projects/:id — update a project ────────────────────────────────
router.put("/:id", async (req, res) => {
  const { title, description, tags, emoji, gradient, github_url, live_url } =
    req.body;

  try {
    const [result] = await db.query(
      `UPDATE projects SET title=?, description=?, tags=?, emoji=?, gradient=?, github_url=?, live_url=?
       WHERE id=?`,
      [
        title,
        description,
        tags,
        emoji,
        gradient,
        github_url,
        live_url,
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