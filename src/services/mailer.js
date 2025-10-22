import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "[HIDDEN]" : "MISSING");

// --- Create SMTP Transport ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.zohocloud.ca",
  port: parseInt(process.env.SMTP_PORT || "465", 10),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

// --- Verify connection on startup ---
transporter.verify((err) => {
  if (err) console.error("❌ SMTP verification failed:", err.message);
  else console.log("✅ SMTP server verified and ready");
});

// --- Email Function ---
export async function sendBookingEmail(booking) {
  const { name, email, phone, date, time, topic, message } = booking;

  const fromName = process.env.FROM_NAME || "TimTom Health Care";
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
  const adminEmail = process.env.ADMIN_EMAIL || fromEmail;

  // --- Email Template (without logo) ---
  const html = `
  <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:40px;">
    <div style="max-width:600px;margin:auto;background:#fff;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.08);overflow:hidden;">
      <div style="background:#375973;color:#fff;padding:20px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">Booking Confirmation</h1>
      </div>
      <div style="padding:30px;">
        <p>Dear <strong>${name}</strong>,</p>
        <p>Thank you for reaching out to <strong>TimTom Health Care</strong>.</p>
        <p>We’ve received your booking request. One of our team members will contact you shortly to confirm your appointment details by phone.</p>

        <h3 style="color:#375973;margin-top:25px;">Booking Details</h3>
        <table style="width:100%;border-collapse:collapse;margin:10px 0;">
          <tr><td><strong>Name:</strong></td><td>${name}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${email || "N/A"}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${phone || "N/A"}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${date || "N/A"}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${time || "N/A"}</td></tr>
          <tr><td><strong>Service:</strong></td><td>${topic || "N/A"}</td></tr>
          <tr><td><strong>Message:</strong></td><td>${message || "N/A"}</td></tr>
        </table>

        <p style="margin-top:20px;">We look forward to speaking with you soon!</p>
      </div>

      <div style="background:#f1f5f9;text-align:center;padding:12px;font-size:12px;color:#6b7280;">
        &copy; ${new Date().getFullYear()} TimTom Health Care. All rights reserved.
      </div>
    </div>
  </div>`;

  // --- Email Options ---
  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: [email, adminEmail],
    subject: "Your Booking Has Been Received — TimTom Health Care",
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email} (and copied to admin)`);
    console.log("Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
}
