import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Makes dotenv loads from the correct folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

console.log(" Loaded ENV from:", path.join(__dirname, ".env"));
console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS ? "LOADED" : "MISSING");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bookingsRouter from "./src/routes/bookings.js";
// --- Initialize App ---


const app = express();

// --- CORS Configuration ---
const defaultOrigins = [
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5500",
  "http://localhost:5501",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

const extra = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = [...new Set([...defaultOrigins, ...extra])];

app.use(
  cors({
    origin(origin, callback) {
      // allow non-browser clients (curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(` Blocked CORS request from: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
  })
);

app.use(express.json());

// --- Routes ---
app.get("/api/health", (req, res) =>
  res.json({ ok: true, status: "healthy" })
);
app.use("/api/bookings", bookingsRouter);

// --- MongoDB Connection ---
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.set("strictQuery", true);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  });

// --- Fallback for unhandled routes ---
app.use((req, res) => {
  res.status(404).json({ ok: false, message: "Route not found" });
});
