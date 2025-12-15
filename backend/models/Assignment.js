const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date },
    fileUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
