const express = require("express");
const router = express.Router();
const db = require("../config/db");

console.log("✅ Stats route loaded");

// ── GET /api/stats — live portfolio statistics ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [[projectCount]] = await db.query(
      "SELECT COUNT(*) AS count FROM projects"
    );
    const [[contactCount]] = await db.query(
      "SELECT COUNT(*) AS count FROM contacts"
    );

    res.json({
      success: true,
      data: {
        projects: projectCount.count,
        messages: contactCount.count,
        // Static values — update these as your career grows
        yearsExperience: 3,
        happyClients: 10,
      },
    });
  } catch (err) {
    console.error("GET /api/stats error:", err);
    // Graceful fallback
    res.json({
      success: true,
      data: {
        projects: 15,
        messages: 0,
        yearsExperience: 3,
        happyClients: 10,
      },
    });
  }
});

module.exports = router;
