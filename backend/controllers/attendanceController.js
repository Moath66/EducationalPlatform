// backend/controllers/attendanceController.js
const Attendance = require("../models/Attendance");
const Session = require("../models/Session");
const Course = require("../models/Course");
const User = require("../models/User");

/**
 * GET /api/attendance/session/:sessionId
 * يرجع حضور كل الطلاب لهذه الجلسة
 * ✅ يعيد الطلاب حتى لو ما فيه سجلات حضور (افتراضي absent)
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

    // طلاب الكورس (عشان نرجع قائمة كاملة)
    const course = await Course.findById(session.courseId).select(
      "students title"
    );
    if (!course) return res.status(404).json({ message: "Course not found" });

    const students = await User.find({
      _id: { $in: course.students },
      role: "student",
    }).select("name email grade phone");

    // سجلات الحضور الموجودة
    const records = await Attendance.find({ sessionId })
      .populate("studentId", "name email grade")
      .select("studentId status markedAt markedBy note");

    // map لدمج الطلاب مع سجلاتهم
    const map = new Map(
      records.map((r) => [String(r.studentId?._id || r.studentId), r])
    );

    const merged = students.map((st) => {
      const r = map.get(String(st._id));
      return {
        studentId: {
          _id: st._id,
          name: st.name,
          email: st.email,
          grade: st.grade,
          phone: st.phone,
        },
        status: r?.status || "absent",
        note: r?.note || "",
        markedAt: r?.markedAt || null,
        markedBy: r?.markedBy || null,
      };
    });

    res.json({
      session: {
        id: session._id,
        title: session.title,
        startAt: session.startAt,
        courseId: session.courseId,
        teacherId: session.teacherId,
        courseTitle: course.title,
      },
      records: merged,
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

    // نتأكد إن الطلاب ضمن الكورس
    const course = await Course.findById(session.courseId).select("students");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const allowed = new Set((course.students || []).map((id) => String(id)));

    const ops = records
      .filter((r) => r?.studentId && allowed.has(String(r.studentId)))
      .map((r) => ({
        updateOne: {
          filter: { sessionId, studentId: r.studentId },
          update: {
            $set: {
              courseId: session.courseId,
              status: r.status === "present" ? "present" : "absent",
              note: (r.note || "").trim(),
              markedBy: req.user.id,
              markedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));

    if (ops.length === 0) {
      return res.status(400).json({
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
