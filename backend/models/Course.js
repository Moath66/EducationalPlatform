// backend/models/Course.js
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ✅ ربط الطلاب بالكورس
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    coverImage: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// indexes
courseSchema.index({ teacherId: 1, title: 1 });
courseSchema.index({ students: 1 }); // ✅ مفيد لو بتبحث بكورس يحتوي طالب
// اختياري لو ودك search أقوى
// courseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);
