// backend/controllers/lessonController.js
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// ✅ Teacher: Create lesson
exports.createLesson = async (req, res) => {
  try {
    const { courseId, title, content, videoUrl } = req.body;

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

    // ✅ only course teacher (or admin via middleware) can create
    const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwnerTeacher) {
      return res.status(403).json({
        message: "غير مصرح: هذا الكورس ليس تابع لك",
        payload: null,
      });
    }

    const lesson = await Lesson.create({
      courseId,
      title: String(title).trim(),
      content: content || "",
      videoUrl: videoUrl || "",
    });

    return res.status(201).json({ message: "تم إنشاء الدرس", payload: lesson });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: Get my lessons (by courseId optional)
exports.getTeacherLessons = async (req, res) => {
  try {
    const { courseId } = req.query;

    let courseFilter = {};
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

      courseFilter.courseId = courseId;
    } else {
      // لو ما انرسل courseId: هات كل الكورسات التابعة للمعلم
      const myCourses = await Course.find({
        teacherId: req.user._id,
      }).select("_id");

      courseFilter.courseId = { $in: myCourses.map((c) => c._id) };
    }

    const lessons = await Lesson.find(courseFilter)
      .sort({ createdAt: -1 })
      .populate("courseId", "title");

    return res.json({ message: "نجاح", payload: lessons });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, videoUrl, courseId } = req.body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res
        .status(404)
        .json({ message: "الدرس غير موجود", payload: null });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: "الكورس غير موجود", payload: null });
    }

    const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwnerTeacher) {
      return res.status(403).json({
        message: "غير مصرح: هذا الدرس ليس تابع لك",
        payload: null,
      });
    }

    // منع تغيير courseId لتجنب نقل الدرس لكورس آخر بالغلط
    if (courseId && String(courseId) !== String(lesson.courseId)) {
      return res.status(400).json({
        message: "لا يمكن تغيير courseId للدرس",
        payload: null,
      });
    }

    if (title !== undefined) lesson.title = String(title).trim();
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;

    await lesson.save();
    return res.json({ message: "تم تحديث الدرس", payload: lesson });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Teacher: Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res
        .status(404)
        .json({ message: "الدرس غير موجود", payload: null });
    }

    const course = await Course.findById(lesson.courseId);
    if (!course) {
      return res
        .status(404)
        .json({ message: "الكورس غير موجود", payload: null });
    }

    const isOwnerTeacher = String(course.teacherId) === String(req.user._id);
    if (req.user.role !== "admin" && !isOwnerTeacher) {
      return res.status(403).json({
        message: "غير مصرح: هذا الدرس ليس تابع لك",
        payload: null,
      });
    }

    await Lesson.deleteOne({ _id: id });
    return res.json({ message: "تم حذف الدرس", payload: true });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};

// ✅ Student: Get lessons for my enrolled courses (optionally by courseId)
exports.getStudentLessons = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (courseId) {
      const course = await Course.findById(courseId).select("students title");
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

      const lessons = await Lesson.find({ courseId })
        .sort({ createdAt: -1 })
        .populate("courseId", "title");

      return res.json({ message: "نجاح", payload: lessons });
    }

    // بدون courseId: هات دروس كل كورسات الطالب
    const myCourses = await Course.find({ students: req.user._id }).select(
      "_id"
    );
    const lessons = await Lesson.find({
      courseId: { $in: myCourses.map((c) => c._id) },
    })
      .sort({ createdAt: -1 })
      .populate("courseId", "title");

    return res.json({ message: "نجاح", payload: lessons });
  } catch (err) {
    return res.status(500).json({ message: "خطأ بالسيرفر", payload: null });
  }
};
