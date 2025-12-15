// backend/routes/assignmentRoutes.js
const router = require("express").Router();

const {
  createAssignment,
  getTeacherAssignments,
  updateAssignment,
  deleteAssignment,
  getStudentAssignments,
} = require("../controllers/assignmentController");

const {
  protect,
  teacherOnly,
  studentOnly,
} = require("../middleware/authMiddleware");

// ✅ Teacher
router.post("/", protect, teacherOnly, createAssignment);
router.get("/teacher", protect, teacherOnly, getTeacherAssignments);
router.put("/:id", protect, teacherOnly, updateAssignment);
router.delete("/:id", protect, teacherOnly, deleteAssignment);

// ✅ Student
router.get("/student", protect, studentOnly, getStudentAssignments);

module.exports = router;
