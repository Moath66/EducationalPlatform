const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");

// قائمة الكورسات
router.get("/", authMiddleware, courseController.getCourses);

// تفاصيل كورس
router.get("/:id", authMiddleware, courseController.getCourseById);

// طلاب كورس
router.get("/:id/students", authMiddleware, courseController.getCourseStudents);

// CRUD (اختياري للأدمن)
router.post("/", authMiddleware, courseController.createCourse);
router.put("/:id", authMiddleware, courseController.updateCourse);
router.delete("/:id", authMiddleware, courseController.deleteCourse);

// تحديث طلاب الكورس (اختياري)
router.put(
  "/:id/students",
  authMiddleware,
  courseController.updateCourseStudents
);

module.exports = router;
