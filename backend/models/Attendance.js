// backend/models/Attendance.js
const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // نخزن courseId كـ denormalization (يسهّل تقارير)
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      default: "absent",
      index: true,
    },

    note: { type: String, trim: true, default: "" },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    markedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ✅ يمنع تكرار حضور نفس الطالب لنفس الجلسة
attendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
