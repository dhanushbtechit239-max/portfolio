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
        projects: projectCount.count || 5,
        messages: contactCount.count || 0,
        // Static values matching Dhanush's actual accomplishments
        yearsExperience: 1, // 1 Internship at Pristonix Technologies
        happyClients: 2,    // 2 NPTEL Certifications
      },
    });
  } catch (err) {
    console.error("GET /api/stats error:", err.message);
    // Graceful fallback when database is offline
    res.json({
      success: true,
      data: {
        projects: 5,
        messages: 0,
        yearsExperience: 1, // 1 Internship
        happyClients: 2,    // 2 NPTEL Certifications
      },
    });
  }
});

module.exports = router;
