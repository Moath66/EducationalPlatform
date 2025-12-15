// backend/controllers/submissionController.js
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

// ✅ Student: submit/update assignment solution
// الفكرة: الطالب يرفع fileUrl (رابط Cloudinary) ويعمل upsert (إنشاء أو تحديث)
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;

    if (!assignmentId) {
      return res
        .status(400)
        .json({ message: "assignmentId مطلوب", payload: null });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ message: "الواجب غير موجود", payload: null });
    }

    // تأكد الطالب مسجل في كورس الواجب
    const course = await Course.findById(assignment.courseId).select(
      "students"
    );
    if (!course) {
      return res
        .status(404)
        .json({ message: "الكورس غير موجود", payload: null });
    }

    const isEnrolled = course.students?.some(
      (s) => String(s) === String(req.user._id)
    );

    if (req.user.role !== "admin" && !isEnrolled) {
      return res.status(403).json({
        message: "غير مصرح: أنت غير مسجل في هذا الكورس",
        payload: null,
      });
    }

    // (اختياري) منع التسليم بعد موعد النهاية
    // إذا تبغاه فعّل هذا الشرط:
    // if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
    //   return res.status(400).json({ message: "انتهى موعد التسليم", payload: null });
    // }

    if (!fileUrl) {
      return res
        .status(400)
        .json({ message: "fileUrl مطلوب (رابط الملف)", payload: null });
    }

    // upsert: لو موجود حدّثه، لو مو موجود انشئ جديد
    const submission = await Submission.findOneAndUpdate(
      { assignmentId, studentId: req.user._id },
      { fileUrl, grade: null }, // grade ترجع null عند تحديث الحل (اختياري)
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: "تم رفع/تحديث الحل بنجاح",
      payload: submission,
    });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Student: get my submissions (optional by assignmentId)
exports.getMySubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.query;

    const filter = { studentId: req.user._id };
    if (assignmentId) filter.assignmentId = assignmentId;

    const submissions = await Submission.find(filter)
      .sort({ createdAt: -1 })
      .populate("assignmentId", "title dueDate courseId");

    return res.json({ message: "نجاح", payload: submissions });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: get submissions for a specific assignment
exports.getSubmissionsForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ message: "الواجب غير موجود", payload: null });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: "الكورس غير موجود", payload: null });
    }

    const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwnerTeacher) {
      return res.status(403).json({
        message: "غير مصرح: هذا الواجب ليس تابع لك",
        payload: null,
      });
    }

    const submissions = await Submission.find({ assignmentId })
      .sort({ createdAt: -1 })
      .populate("studentId", "name email grade");

    return res.json({ message: "نجاح", payload: submissions });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: grade a submission (grade + optional feedback later)
exports.gradeSubmission = async (req, res) => {
  try {
    const { id } = req.params; // submissionId
    const { grade } = req.body;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ message: "grade مطلوب", payload: null });
    }

    // رقم فقط
    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade)) {
      return res
        .status(400)
        .json({ message: "grade يجب أن يكون رقم", payload: null });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res
        .status(404)
        .json({ message: "التسليم غير موجود", payload: null });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ message: "الواجب غير موجود", payload: null });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: "الكورس غير موجود", payload: null });
    }

    const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwnerTeacher) {
      return res.status(403).json({
        message: "غير مصرح: هذا التسليم ليس تابع لك",
        payload: null,
      });
    }

    submission.grade = numericGrade;
    await submission.save();

    return res.json({ message: "تم تقييم التسليم", payload: submission });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};
