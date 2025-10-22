import { Router } from "express";
import { body, validationResult } from "express-validator";
import Booking from "../models/Booking.js";
import { sendBookingEmail } from "../services/mailer.js";

const router = Router();

/**
 * POST /api/bookings
 * ------------------
 * Handles booking form submissions.
 *  - Validates inputs
 *  - Saves booking to MongoDB
 *  - Sends confirmation email via Zoho SMTP
 */
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        ok: false,
        errors: errors.array(),
        message: "Invalid input — please check your form fields.",
      });
    }

    const { name, email, phone, date, time, topic, message } = req.body;

    try {
      // ✅ Save booking data
      const booking = await Booking.create({
        name,
        email,
        phone,
        date,
        time,
        topic,
        message,
      });

      console.log(`✅ New booking stored in MongoDB for ${name} (${email})`);

      // ✅ Send confirmation email
 await sendBookingEmail({
  name: String(name).trim(),
  email: String(email).trim(),   // ✅ pass correct key
  phone: phone || "N/A",
  date: date || "N/A",
  time: time || "N/A",
  topic: topic || "N/A",
  message: message || "N/A",
});


      return res.status(201).json({
        ok: true,
        bookingId: booking._id,
        message:
          "Your booking has been received successfully. A confirmation email has been sent.",
      });
    } catch (err) {
      console.error("❌ Booking submission failed:", err);
      return res.status(500).json({
        ok: false,
        message: "Server error creating booking. Please try again later.",
      });
    }
  }
);

export default router;
