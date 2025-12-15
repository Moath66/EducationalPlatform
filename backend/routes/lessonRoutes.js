// backend/routes/lessonRoutes.js
const router = require("express").Router();

const {
  createLesson,
  getTeacherLessons,
  updateLesson,
  deleteLesson,
  getStudentLessons,
} = require("../controllers/lessonController");

const {
  protect,
  teacherOnly,
  studentOnly,
} = require("../middleware/authMiddleware");

// ✅ Teacher
router.post("/", protect, teacherOnly, createLesson);
router.get("/teacher", protect, teacherOnly, getTeacherLessons);
router.put("/:id", protect, teacherOnly, updateLesson);
router.delete("/:id", protect, teacherOnly, deleteLesson);

// ✅ Student
router.get("/student", protect, studentOnly, getStudentLessons);

module.exports = router;
