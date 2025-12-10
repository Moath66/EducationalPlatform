// backend/models/Session.js
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    startAt: { type: Date, required: true, index: true },

    durationMinutes: { type: Number, required: true, min: 10, max: 600 },

    meetUrl: { type: String, trim: true, default: "" },

    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
      index: true,
    },

    notes: { type: String, trim: true, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// بحث نصي (اختياري) يساعد على search سريع في title/notes
sessionSchema.index({ title: "text", notes: "text" });

module.exports = mongoose.model("Session", sessionSchema);
