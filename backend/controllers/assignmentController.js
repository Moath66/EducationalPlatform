// backend/controllers/assignmentController.js
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

// ✅ Teacher: Create assignment
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate, fileUrl } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({
        message: "courseId و title مطلوبين",
        payload: null,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: "الكورس غير موجود", payload: null });
    }

    const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwnerTeacher) {
      return res.status(403).json({
        message: "غير مصرح: هذا الكورس ليس تابع لك",
        payload: null,
      });
    }

    const assignment = await Assignment.create({
      courseId,
      title: String(title).trim(),
      description: description || "",
      dueDate: dueDate || null,
      // ✅ اختياري: لو رفعت ملف (PDF) على Cloudinary من أي مكان وخزنت الرابط هنا
      fileUrl: fileUrl || "",
    });

    return res
      .status(201)
      .json({ message: "تم إنشاء الواجب", payload: assignment });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: Get my assignments (by courseId optional)
exports.getTeacherAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;

    let filter = {};

    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res
          .status(404)
          .json({ message: "الكورس غير موجود", payload: null });
      }

      const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
      if (req.user.role !== "admin" && !isOwnerTeacher) {
        return res.status(403).json({
          message: "غير مصرح: هذا الكورس ليس تابع لك",
          payload: null,
        });
      }

      filter.courseId = courseId;
    } else {
      const myCourses = await Course.find({ teacherId: req.user._id }).select(
        "_id"
      );
      filter.courseId = { $in: myCourses.map((c) => c._id) };
    }

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .populate("courseId", "title");

    return res.json({ message: "نجاح", payload: assignments });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, fileUrl, courseId } = req.body;

    const assignment = await Assignment.findById(id);
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

    // منع تغيير courseId بالغلط
    if (courseId && String(courseId) !== String(assignment.courseId)) {
      return res.status(400).json({
        message: "لا يمكن تغيير courseId للواجب",
        payload: null,
      });
    }

    if (title !== undefined) assignment.title = String(title).trim();
    if (description !== undefined) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate || null;
    if (fileUrl !== undefined) assignment.fileUrl = fileUrl || "";

    await assignment.save();
    return res.json({ message: "تم تحديث الواجب", payload: assignment });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);
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

    await Assignment.deleteOne({ _id: id });
    return res.json({ message: "تم حذف الواجب", payload: true });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Student: Get assignments for my enrolled courses (optional by courseId)
exports.getStudentAssignments = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (courseId) {
      const course = await Course.findById(courseId).select("students");
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

      const assignments = await Assignment.find({ courseId })
        .sort({ createdAt: -1 })
        .populate("courseId", "title");

      return res.json({ message: "نجاح", payload: assignments });
    }

    // بدون courseId: كل واجبات كورسات الطالب
    const myCourses = await Course.find({ students: req.user._id }).select(
      "_id"
    );
    const assignments = await Assignment.find({
      courseId: { $in: myCourses.map((c) => c._id) },
    })
      .sort({ createdAt: -1 })
      .populate("courseId", "title");

    return res.json({ message: "نجاح", payload: assignments });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};
