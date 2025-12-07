// backend/models/StudyFile.js
const mongoose = require("mongoose");

const studyFileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ["plan", "schedule"], required: true },
    grade: { type: String, default: null },

    fileUrl: { type: String, required: true },
    downloadUrl: { type: String, default: "" }, // ✅ جديد
    publicId: { type: String, required: true },

    fileName: { type: String },
    fileType: { type: String },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyFile", studyFileSchema);
