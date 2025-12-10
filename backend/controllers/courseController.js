// backend/controllers/courseController.js
const Course = require("../models/Course");
const User = require("../models/User");

/**
 * GET /api/courses
 * Admin: كل الكورسات
 * Teacher: كورساته فقط (اختياري)
 */
exports.getCourses = async (req, res) => {
  try {
    const { q, teacherId, isActive } = req.query;

    const filter = {};

    // فلترة حسب صلاحية المستخدم (اختياري لكنه مفيد)
    // لو تحب تخليها للأدمن فقط، احذف هذا الجزء
    if (req.user?.role === "teacher") {
      filter.teacherId = req.user.id;
    }

    // فلترة اختيارية من query
    if (teacherId) filter.teacherId = teacherId;
    if (isActive === "true") filter.isActive = true;
    if (isActive === "false") filter.isActive = false;

    if (q && q.trim()) {
      filter.title = { $regex: q.trim(), $options: "i" };
    }

    const courses = await Course.find(filter)
      .populate("teacherId", "name email role")
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (err) {
    console.error("getCourses error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/courses/:id
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacherId",
      "name email role"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json({ course });
  } catch (err) {
    console.error("getCourseById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/courses/:id/students
 * يرجّع طلاب الكورس (مهم للحضور)
 */
exports.getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select(
      "students title"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });

    // (اختياري) صلاحيات: المعلم يشوف طلاب كورسه فقط
    if (req.user?.role === "teacher") {
      const owns = await Course.exists({
        _id: course._id,
        teacherId: req.user.id,
      });
      if (!owns) return res.status(403).json({ message: "Not allowed" });
    }

    const students = await User.find({
      _id: { $in: course.students },
      role: "student",
    }).select("name email phone grade role");

    res.json({ courseId: course._id, title: course.title, students });
  } catch (err) {
    console.error("getCourseStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/courses
 * إنشاء كورس (Admin فقط عادة)
 */
exports.createCourse = async (req, res) => {
  try {
    const { title, description, teacherId, coverImage, students } = req.body;

    if (!title?.trim())
      return res.status(400).json({ message: "title is required" });
    if (!teacherId)
      return res.status(400).json({ message: "teacherId is required" });

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "teacherId is invalid" });
    }

    const course = await Course.create({
      title: title.trim(),
      description: (description || "").trim(),
      teacherId,
      coverImage: coverImage || "",
      students: Array.isArray(students) ? students : [],
    });

    res.status(201).json({ message: "Course created", course });
  } catch (err) {
    console.error("createCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/courses/:id
 * تحديث كورس
 */
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, teacherId, coverImage, isActive } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // (اختياري) صلاحيات المعلم
    if (
      req.user?.role === "teacher" &&
      String(course.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (title !== undefined) course.title = title.trim();
    if (description !== undefined)
      course.description = (description || "").trim();
    if (coverImage !== undefined) course.coverImage = coverImage || "";
    if (isActive !== undefined) course.isActive = !!isActive;

    if (teacherId !== undefined) {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== "teacher") {
        return res.status(400).json({ message: "teacherId is invalid" });
      }
      course.teacherId = teacherId;
    }

    await course.save();
    res.json({ message: "Course updated", course });
  } catch (err) {
    console.error("updateCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/courses/:id
 */
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await course.deleteOne();
    res.json({ message: "Course deleted" });
  } catch (err) {
    console.error("deleteCourse error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/courses/:id/students
 * body: { studentIds: ["...","..."] }  -> استبدال القائمة
 * أو body: { add: ["..."], remove: ["..."] }
 */
exports.updateCourseStudents = async (req, res) => {
  try {
    const { studentIds, add, remove } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (
      req.user?.role === "teacher" &&
      String(course.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (Array.isArray(studentIds)) {
      course.students = studentIds;
    } else {
      if (Array.isArray(add)) {
        const set = new Set(course.students.map(String));
        add.forEach((id) => set.add(String(id)));
        course.students = Array.from(set);
      }
      if (Array.isArray(remove)) {
        const rm = new Set(remove.map(String));
        course.students = course.students.filter((id) => !rm.has(String(id)));
      }
    }

    await course.save();
    res.json({
      message: "Course students updated",
      courseId: course._id,
      students: course.students,
    });
  } catch (err) {
    console.error("updateCourseStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
