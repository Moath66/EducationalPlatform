// backend/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

// حضور جلسة
router.get(
  "/session/:sessionId",
  protect,
  attendanceController.getAttendanceBySession
);

router.post(
  "/session/:sessionId",
  protect,
  attendanceController.saveAttendanceForSession
);

// حضور الطالب نفسه
router.get("/student/me", protect, attendanceController.getMyAttendance);

module.exports = router;
