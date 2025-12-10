// backend/controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const Course = require("../models/Course");

/**
 * GET /api/attendance/session/:sessionId
 * يرجع حضور كل الطلاب لهذه الجلسة
 */
exports.getAttendanceBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).select(
      "courseId teacherId startAt title"
    );
    if (!session) return res.status(404).json({ message: "Session not found" });

    // صلاحيات: المعلم فقط صاحب الجلسة أو الأدمن
    if (
      req.user?.role === "teacher" &&
      String(session.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const records = await Attendance.find({ sessionId })
      .populate("studentId", "name email grade")
      .select("studentId status markedAt markedBy note");

    res.json({
      session: {
        id: session._id,
        title: session.title,
        startAt: session.startAt,
        courseId: session.courseId,
        teacherId: session.teacherId,
      },
      records,
    });
  } catch (err) {
    console.error("getAttendanceBySession error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/attendance/session/:sessionId
 * body: { records: [ { studentId, status, note? }, ... ] }
 * يسوي upsert لكل طالب (bulk)
 */
exports.saveAttendanceForSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: "records array is required" });
    }

    const session = await Session.findById(sessionId).select(
      "courseId teacherId"
    );
    if (!session) return res.status(404).json({ message: "Session not found" });

    // صلاحيات: المعلم صاحب الجلسة أو الأدمن
    if (
      req.user?.role === "teacher" &&
      String(session.teacherId) !== String(req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // نجيب طلاب الكورس عشان نتأكد إن studentId ضمن الكورس (اختياري لكنه مهم)
    const course = await Course.findById(session.courseId).select("students");
    const allowed = new Set((course?.students || []).map((id) => String(id)));

    const ops = records
      .filter((r) => r?.studentId && allowed.has(String(r.studentId)))
      .map((r) => ({
        updateOne: {
          filter: { sessionId, studentId: r.studentId },
          update: {
            $set: {
              status: r.status || "absent",
              note: (r.note || "").trim(),
              markedBy: req.user.id,
              markedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

    if (ops.length === 0) {
      return res
        .status(400)
        .json({
          message: "No valid records to save (check students belong to course)",
        });
    }

    const result = await Attendance.bulkWrite(ops);

    res.json({
      message: "Attendance saved",
      result: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount,
      },
    });
  } catch (err) {
    console.error("saveAttendanceForSession error:", err);
    // خطأ unique index ممكن يظهر لو فيه ازدواج
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/attendance/student/me
 * الطالب يشوف حضوره (حسب التوكن)
 */
exports.getMyAttendance = async (req, res) => {
  try {
    if (req.user?.role !== "student") {
      return res.status(403).json({ message: "Students only" });
    }

    const studentId = req.user.id;

    // نجيب سجلات الحضور + معلومات الجلسة والكورس
    const records = await Attendance.find({ studentId })
      .populate({
        path: "sessionId",
        select: "title startAt courseId",
        populate: { path: "courseId", select: "title teacherId" },
      })
      .sort({ createdAt: -1 });

    res.json({ records });
  } catch (err) {
    console.error("getMyAttendance error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
