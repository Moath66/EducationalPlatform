const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

// حضور جلسة
router.get(
  "/session/:sessionId",
  authMiddleware,
  attendanceController.getAttendanceBySession
);
router.post(
  "/session/:sessionId",
  authMiddleware,
  attendanceController.saveAttendanceForSession
);

// حضور الطالب نفسه
router.get("/student/me", authMiddleware, attendanceController.getMyAttendance);

module.exports = router;
