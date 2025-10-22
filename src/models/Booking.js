import mongoose from "mongoose";

/**
 * Stores booking information submitted from the website contact/booking form.
 */

const BookingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    date: {
      type: String, // stored as yyyy-mm-dd (from frontend form)
      trim: true,
    },
    time: {
      type: String, // stored as HH:mm (from frontend form)
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);


BookingSchema.virtual("summary").get(function () {
  return `${this.name} - ${this.topic || "General"} (${this.date || "TBD"})`;
});

export default mongoose.model("Booking", BookingSchema);
