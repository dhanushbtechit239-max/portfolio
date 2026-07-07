const express = require("express");
const router = express.Router();
const db = require("../config/db");
const nodemailer = require("nodemailer");

console.log("✅ Contact route loaded");

// Configure nodemailer transporter
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS; // This should be a Gmail App Password
let transporter = null;

if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
  console.log("✅ Nodemailer configured for email notifications");
} else {
  console.warn("⚠️ Nodemailer: EMAIL_USER and EMAIL_PASS env variables are missing. Email alerts are disabled.");
}

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

  let savedToDb = true;
  let dbInsertId = null;

  try {
    const [result] = await db.query(
      `INSERT INTO contacts (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), subject?.trim() || "", message.trim()]
    );
    dbInsertId = result.insertId;
    console.log(`📬 New contact from ${name} <${email}> — ID: ${dbInsertId}`);
  } catch (err) {
    console.error("⚠️ Failed to save message to MySQL database:", err.message);
    savedToDb = false;
  }

  // Send email alert to Dhanush regardless of database success
  if (transporter) {
    // 1. Notification to Dhanush
    const adminMailOptions = {
      from: `"Portfolio Contact Form" <${emailUser}>`,
      to: emailUser, // Sends to your email (the configured sender)
      replyTo: email, // Click reply to reply directly to the visitor
      subject: `📬 Portfolio Contact: ${subject || "No Subject"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fafafa; color: #333333;">
          <h2 style="color: #6c5ce7; border-bottom: 2px solid #6c5ce7; padding-bottom: 10px; margin-top: 0;">New Message from Portfolio</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #6c5ce7;">${email}</a></p>
          <p><strong>Subject:</strong> ${subject || "N/A"}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #6c5ce7; border-radius: 4px; font-style: italic; white-space: pre-line;">
            ${message}
          </div>
          <p style="margin-top: 15px; font-size: 0.85rem; color: ${savedToDb ? '#2ed573' : '#ff4757'};">
            ${savedToDb ? `Saved to Database (ID: ${dbInsertId})` : '⚠️ Failed to save to database (Server running in fallback mode)'}
          </p>
          <p style="margin-top: 30px; font-size: 0.8rem; color: #888888; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-bottom: 0;">
            Sent from Dhanush R's Portfolio Contact form.
          </p>
        </div>
      `,
    };

    // 2. Confirmation to the Visitor
    const visitorMailOptions = {
      from: `"Dhanush R" <${emailUser}>`,
      to: email, // Sends to the visitor's entered email
      subject: `Received: ${subject || "Thank you for reaching out!"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #fafafa; color: #333333;">
          <h2 style="color: #6c5ce7; border-bottom: 2px solid #6c5ce7; padding-bottom: 10px; margin-top: 0;">Message Received!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for reaching out and visiting my website! I have received your message and will get back to you as soon as possible.</p>
          <p>Here is a summary of the details you sent:</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border-left: 4px solid #6c5ce7; border-radius: 4px; font-style: italic; white-space: pre-line;">
            <strong>Subject:</strong> ${subject || "N/A"}
            <strong>Message:</strong>
            ${message}
          </div>
          <br>
          <p>Best regards,</p>
          <p><strong>Dhanush R</strong></p>
          <p style="margin-top: 30px; font-size: 0.8rem; color: #888888; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-bottom: 0;">
            This is an automated confirmation of receipt.
          </p>
        </div>
      `,
    };

    // Send both mails asynchronously
    transporter.sendMail(adminMailOptions).catch((mailErr) => {
      console.error("❌ Admin notification email failed to send:", mailErr.message);
    });

    transporter.sendMail(visitorMailOptions).catch((mailErr) => {
      console.error("❌ Visitor confirmation email failed to send:", mailErr.message);
    });
  }

  res.status(201).json({
    success: true,
    message: savedToDb 
      ? "Message received! Dhanush will get back to you soon. 🚀"
      : "Message received! Dhanush will get back to you soon. 🚀 (Fallback mode)",
  });
});

// ── GET /api/contact — list all messages (for admin use) ───────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error("GET /api/contact error:", err.message);
    res.json({ success: true, data: [], total: 0, message: "Database offline, returned empty list." });
  }
});

module.exports = router;
