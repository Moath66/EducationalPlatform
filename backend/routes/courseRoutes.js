// backend/routes/courseRoutes.js
const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// قائمة الكورسات
router.get("/", protect, courseController.getCourses);

// تفاصيل كورس
router.get("/:id", protect, courseController.getCourseById);

// طلاب كورس
router.get("/:id/students", protect, courseController.getCourseStudents);

// CRUD (للأدمن)
router.post("/", protect, adminOnly, courseController.createCourse);
router.put("/:id", protect, adminOnly, courseController.updateCourse);
router.delete("/:id", protect, adminOnly, courseController.deleteCourse);

// تحديث طلاب الكورس
router.put(
  "/:id/students",
  protect,
  adminOnly,
  courseController.updateCourseStudents
);

module.exports = router;
