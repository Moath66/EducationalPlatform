// backend/routes/submissionRoutes.js
const router = require("express").Router();

const {
  submitAssignment,
  getMySubmissions,
  getSubmissionsForAssignment,
  gradeSubmission,
} = require("../controllers/submissionController");

const {
  protect,
  teacherOnly,
  studentOnly,
} = require("../middleware/authMiddleware");

// ✅ Student: submit/update + my submissions
router.post("/", protect, studentOnly, submitAssignment);
router.get("/my", protect, studentOnly, getMySubmissions);

// ✅ Teacher: list submissions for assignment + grade a submission
router.get(
  "/assignment/:assignmentId",
  protect,
  teacherOnly,
  getSubmissionsForAssignment
);
router.put("/:id/grade", protect, teacherOnly, gradeSubmission);

module.exports = router;
