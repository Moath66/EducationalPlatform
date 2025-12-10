// backend/controllers/sessionController.js
const mongoose = require("mongoose");
const Session = require("../models/Session");

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

// POST /api/sessions
exports.createSession = async (req, res) => {
  try {
    const {
      title,
      courseId,
      teacherId,
      startAt,
      durationMinutes,
      meetUrl = "",
      status = "scheduled",
      notes = "",
    } = req.body;

    if (!title || !courseId || !teacherId || !startAt || !durationMinutes) {
      return res.status(400).json({
        message:
          "حقول ناقصة. مطلوب: title, courseId, teacherId, startAt, durationMinutes",
      });
    }

    if (!isValidObjectId(courseId) || !isValidObjectId(teacherId)) {
      return res
        .status(400)
        .json({ message: "courseId أو teacherId غير صالح." });
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
      teacherId,
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
      sort = "-startAt", // الافتراضي: الأحدث أولاً
    } = req.query;

    const filter = {};

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

    if (status && status !== "all") {
      filter.status = status;
    }

    const range = buildDateRange(from, to);
    if (range) filter.startAt = range;

    // بحث نصي: يشتغل على title/notes (text index)
    if (q && String(q).trim()) {
      filter.$text = { $search: String(q).trim() };
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
      Session.find(filter)
        .populate("courseId", "name title code") // عدّل الحقول حسب Course عندك
        .populate("teacherId", "name fullName email") // عدّل الحقول حسب User عندك
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
      .populate("courseId", "name title code")
      .populate("teacherId", "name fullName email");

    if (!doc) return res.status(404).json({ message: "الجلسة غير موجودة." });

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
      .populate("courseId", "name title code")
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
