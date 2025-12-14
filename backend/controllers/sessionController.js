// backend/controllers/sessionController.js
const mongoose = require("mongoose");
const Session = require("../models/Session");
const Course = require("../models/Course");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildDateRange(from, to) {
  const range = {};
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) range.$gte = fromDate;
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) range.$lte = toDate;
  }
  return Object.keys(range).length ? range : null;
}

/**
 * يدعم:
 * - status=scheduled
 * - status=scheduled,live
 * - status[]=scheduled&status[]=live (لو الفرونت يرسلها كـ array)
 */
function parseStatuses(status) {
  if (!status || status === "all") return [];

  // لو جاك status كـ array (مثلاً ?status=scheduled&status=live)
  if (Array.isArray(status)) {
    return status
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // لو جاك "scheduled,live"
  const str = String(status);
  return str
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// POST /api/sessions
// POST /api/sessions
exports.createSession = async (req, res) => {
  try {
    const {
      title,
      courseId,
      startAt,
      durationMinutes,
      meetUrl = "",
      status = "scheduled",
      notes = "",
    } = req.body;

    if (!title || !courseId || !startAt || !durationMinutes) {
      return res.status(400).json({
        message: "حقول ناقصة. مطلوب: title, courseId, startAt, durationMinutes",
      });
    }

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ message: "courseId غير صالح." });
    }

    // ✅ جيب teacherId من الكورس
    const course = await Course.findById(courseId).select("teacherId");
    if (!course) return res.status(404).json({ message: "الكورس غير موجود." });

    const teacherId = course.teacherId;
    if (!teacherId) {
      return res.status(400).json({ message: "الكورس بدون معلم مرتبط." });
    }

    const startDate = new Date(startAt);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ message: "startAt غير صالح." });
    }

    const dur = Number(durationMinutes);
    if (Number.isNaN(dur) || dur < 10 || dur > 600) {
      return res
        .status(400)
        .json({ message: "durationMinutes يجب أن يكون بين 10 و 600." });
    }

    const doc = await Session.create({
      title: title.trim(),
      courseId,
      teacherId, // ✅ من الكورس
      startAt: startDate,
      durationMinutes: dur,
      meetUrl: String(meetUrl || "").trim(),
      status,
      notes: String(notes || "").trim(),
      createdBy: req.user?.id || req.user?._id || null,
    });

    return res.status(201).json({ message: "تم إنشاء الجلسة.", session: doc });
  } catch (err) {
    console.error("createSession error:", err);
    return res.status(500).json({ message: "حدث خطأ في إنشاء الجلسة." });
  }
};

// GET /api/sessions?courseId&teacherId&status&from&to&q&page&limit&sort
exports.getSessions = async (req, res) => {
  try {
    const {
      courseId,
      teacherId,
      status,
      from,
      to,
      q,
      page = 1,
      limit = 20,
      sort = "-startAt",
    } = req.query;

    const filter = {};

    // ✅ Student: يشوف جلسات كورساته فقط
    if (req.user?.role === "student") {
      const myCourses = await Course.find({
        students: req.user.id || req.user._id,
      })
        .select("_id")
        .lean();

      const myCourseIds = myCourses.map((c) => c._id);

      // لو ما عنده كورسات -> رجّع فاضي
      if (myCourseIds.length === 0) {
        return res.json({
          total: 0,
          page: 1,
          limit: Number(limit) || 20,
          sessions: [],
        });
      }

      filter.courseId = { $in: myCourseIds };
    }

    // ✅ (اختياري) لو Teacher وما أرسل teacherId -> رجّع جلساته فقط
    if (req.user?.role === "teacher" && !teacherId) {
      filter.teacherId = req.user.id || req.user._id;
    }

    if (courseId) {
      if (!isValidObjectId(courseId))
        return res.status(400).json({ message: "courseId غير صالح." });
      filter.courseId = courseId;
    }

    if (teacherId) {
      if (!isValidObjectId(teacherId))
        return res.status(400).json({ message: "teacherId غير صالح." });
      filter.teacherId = teacherId;
    }

    // ✅ status متعدد
    const statuses = parseStatuses(status);
    if (statuses.length === 1) filter.status = statuses[0];
    if (statuses.length > 1) filter.status = { $in: statuses };

    const range = buildDateRange(from, to);
    if (range) filter.startAt = range;

    // ✅ بحث: لو عندك text index يشتغل، لو ما عندك نخليه regex fallback
    if (q && String(q).trim()) {
      const needle = String(q).trim();
      // text search (أفضل لو عندك index)
      filter.$or = [
        { title: { $regex: needle, $options: "i" } },
        { notes: { $regex: needle, $options: "i" } },
      ];
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Session.find(filter)
        .populate("courseId", "title name code")
        .populate("teacherId", "name fullName email")
        .sort(sort)
        .skip(skip)
        .limit(safeLimit),
      Session.countDocuments(filter),
    ]);

    return res.json({
      total,
      page: safePage,
      limit: safeLimit,
      sessions: items,
    });
  } catch (err) {
    console.error("getSessions error:", err);
    return res.status(500).json({ message: "حدث خطأ في جلب الجلسات." });
  }
};

// GET /api/sessions/:id
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "id غير صالح." });

    const doc = await Session.findById(id)
      .populate("courseId", "title name code")
      .populate("teacherId", "name fullName email");

    if (!doc) return res.status(404).json({ message: "الجلسة غير موجودة." });

    // ✅ Student: يمنع الوصول لجلسة مو ضمن كورساته
    if (req.user?.role === "student") {
      const myCourses = await Course.find({
        students: req.user.id || req.user._id,
      })
        .select("_id")
        .lean();
      const mySet = new Set(myCourses.map((c) => String(c._id)));

      const cid = String(doc.courseId?._id || doc.courseId);
      if (!mySet.has(cid)) {
        return res.status(403).json({ message: "Not allowed" });
      }
    }

    return res.json({ session: doc });
  } catch (err) {
    console.error("getSessionById error:", err);
    return res.status(500).json({ message: "حدث خطأ في جلب تفاصيل الجلسة." });
  }
};

// PUT /api/sessions/:id
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "id غير صالح." });

    const payload = {};
    const allowed = [
      "title",
      "courseId",
      "teacherId",
      "startAt",
      "durationMinutes",
      "meetUrl",
      "status",
      "notes",
    ];

    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }

    if (payload.courseId && !isValidObjectId(payload.courseId))
      return res.status(400).json({ message: "courseId غير صالح." });

    if (payload.teacherId && !isValidObjectId(payload.teacherId))
      return res.status(400).json({ message: "teacherId غير صالح." });

    if (payload.startAt) {
      const d = new Date(payload.startAt);
      if (isNaN(d.getTime()))
        return res.status(400).json({ message: "startAt غير صالح." });
      payload.startAt = d;
    }

    if (payload.durationMinutes !== undefined) {
      const dur = Number(payload.durationMinutes);
      if (Number.isNaN(dur) || dur < 10 || dur > 600) {
        return res
          .status(400)
          .json({ message: "durationMinutes يجب أن يكون بين 10 و 600." });
      }
      payload.durationMinutes = dur;
    }

    if (payload.title) payload.title = String(payload.title).trim();
    if (payload.meetUrl !== undefined)
      payload.meetUrl = String(payload.meetUrl || "").trim();
    if (payload.notes !== undefined)
      payload.notes = String(payload.notes || "").trim();

    const updated = await Session.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    })
      .populate("courseId", "title name code")
      .populate("teacherId", "name fullName email");

    if (!updated)
      return res.status(404).json({ message: "الجلسة غير موجودة." });

    return res.json({ message: "تم تحديث الجلسة.", session: updated });
  } catch (err) {
    console.error("updateSession error:", err);
    return res.status(500).json({ message: "حدث خطأ في تحديث الجلسة." });
  }
};

// DELETE /api/sessions/:id
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "id غير صالح." });

    const deleted = await Session.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ message: "الجلسة غير موجودة." });

    return res.json({ message: "تم حذف الجلسة." });
  } catch (err) {
    console.error("deleteSession error:", err);
    return res.status(500).json({ message: "حدث خطأ في حذف الجلسة." });
  }
};
// ✅ GET /api/sessions/teacher
exports.getTeacherSessions = async (req, res) => {
  try {
    if (req.user?.role !== "teacher") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const myCourses = await Course.find({
      teacherId: req.user.id || req.user._id,
    }).select("_id");
    const courseIds = myCourses.map((c) => c._id);

    const sessions = await Session.find({ courseId: { $in: courseIds } })
      .populate("courseId", "title")
      .sort({ startAt: 1 });

    return res.json({ sessions });
  } catch (err) {
    console.error("getTeacherSessions error:", err);
    return res.status(500).json({ message: "حدث خطأ في جلب جلسات المعلم." });
  }
};

// ✅ GET /api/sessions/student/upcoming
exports.getStudentUpcomingSessions = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const myCourses = await Course.find({
      students: req.user.id || req.user._id,
    }).select("_id");
    const courseIds = myCourses.map((c) => c._id);

    const now = new Date();

    const sessions = await Session.find({
      courseId: { $in: courseIds },
      startAt: { $gte: now },
      status: { $in: ["scheduled", "live"] },
    })
      .populate("courseId", "title")
      .sort({ startAt: 1 });

    return res.json({ sessions });
  } catch (err) {
    console.error("getStudentUpcomingSessions error:", err);
    return res.status(500).json({ message: "حدث خطأ في جلب جلسات الطالب." });
  }
};
