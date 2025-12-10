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

    durationMinutes: { type: Number, default: 60, min: 10, max: 600 },

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

sessionSchema.index({ title: "text", notes: "text" });
sessionSchema.index({ teacherId: 1, startAt: 1 });
sessionSchema.index({ courseId: 1, startAt: 1 });

module.exports = mongoose.model("Session", sessionSchema);
