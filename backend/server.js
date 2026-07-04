require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "https://dhanushbtechit239-max.github.io",
      "null"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Express 5 built-in body parsers (primary)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// body-parser as fallback
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ── API Routes ───────────────────────────────────────────────────────────────
const projectRoutes = require("./routes/projects");
const contactRoutes = require("./routes/contact");
const statsRoutes = require("./routes/stats");

// API health endpoint
app.get("/api", (req, res) => {
  res.json({
    status: "✅ Server is running",
    message: "Dhanush Portfolio API",
    version: "1.0.0",
    endpoints: {
      projects: "/api/projects",
      contact: "/api/contact",
      stats: "/api/stats",
    },
  });
});

app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/stats", statsRoutes);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

// ── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📦 API endpoints:`);
  console.log(`   → http://localhost:${PORT}/api/projects`);
  console.log(`   → http://localhost:${PORT}/api/contact`);
  console.log(`   → http://localhost:${PORT}/api/stats\n`);
});