const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");

router.get("/student/:id", async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.params.id })
      .populate("courseId", "name");

    const formatted = records.map((rec) => ({
      ...rec._doc,
      courseName: rec.courseId?.name || "Course",
    }));

    res.json({ attendance: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
