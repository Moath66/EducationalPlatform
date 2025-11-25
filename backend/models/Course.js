const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    coverImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
