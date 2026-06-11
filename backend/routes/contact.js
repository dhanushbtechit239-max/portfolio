const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ Contact route loaded");

// ── POST /api/contact — save a contact message ──────────────────────────────
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required",
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), subject?.trim() || "", message.trim()]
    );

    console.log(
      `📬 New contact from ${name} <${email}> — ID: ${result.insertId}`
    );

    res.status(201).json({
      success: true,
      message: "Message received! Dhanush will get back to you soon. 🚀",
    });
  } catch (err) {
    console.error("POST /api/contact error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to save your message. Please try again." });
  }
});

// ── GET /api/contact — list all messages (for admin use) ───────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("GET /api/contact error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

module.exports = router;
