// frontend/src/pages/Teacher/TeacherAttendance.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchSessions } from "../../../api/sessionsApi";
import { fetchCourseStudents } from "../../../api/coursesApi";
import {
  fetchAttendanceBySession,
  saveAttendanceForSession,
} from "../../../api/attendanceApi";

function formatAr(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ar", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeSessions(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.sessions)) return data.sessions;
  return [];
}

// ✅ اقرأ sessionId من الرابط
function getQueryParam(name) {
  const sp = new URLSearchParams(window.location.search);
  return sp.get(name);
}

export default function TeacherAttendance() {
  const savedUser = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "null"),
    []
  );

  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);

  // attendanceMap: { studentId: { status, note? } }
  const [attendanceMap, setAttendanceMap] = useState({});

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function loadStudentsAndExistingAttendance(sessionObj) {
    setErr("");
    setOk("");
    setLoadingStudents(true);
    setLoadingAttendance(true);

    try {
      const courseId = sessionObj?.courseId?._id || sessionObj?.courseId;
      if (!courseId) throw new Error("هذه الجلسة غير مرتبطة بكورس");

      const [studentsRes, attendanceRes] = await Promise.allSettled([
        fetchCourseStudents(courseId),
        fetchAttendanceBySession(sessionObj._id || sessionObj.id),
      ]);

      // students
      let studentsList = [];
      if (studentsRes.status === "fulfilled") {
        const st =
          studentsRes.value?.students || studentsRes.value?.data?.students;
        studentsList = Array.isArray(st)
          ? st
          : studentsRes.value?.students || [];
        setStudents(studentsList);
      } else {
        setStudents([]);
      }

      // attendance records (لو فيه سجل سابق)
      let existing = [];
      if (attendanceRes.status === "fulfilled") {
        existing = attendanceRes.value?.records || [];
      }

      setAttendanceMap(() => {
        const map = {};

        // default absent للجميع
        (studentsList || []).forEach((s) => {
          const sid = s._id || s.id;
          if (!sid) return;
          map[sid] = { status: "absent", note: "" };
        });

        // طبّق الموجود من الباك
        existing.forEach((r) => {
          const sid = r.studentId?._id || r.studentId;
          if (!sid) return;
          map[sid] = {
            status: r.status || "absent",
            note: r.note || "",
          };
        });

        return map;
      });
    } catch (e) {
      setErr(e.message || "فشل تحميل طلاب/حضور الجلسة");
      setStudents([]);
      setAttendanceMap({});
    } finally {
      setLoadingStudents(false);
      setLoadingAttendance(false);
    }
  }

  async function onSelectSession(sessionId, listOverride = null) {
    setSelectedSessionId(sessionId);
    setStudents([]);
    setAttendanceMap({});
    setOk("");
    setErr("");

    const list = listOverride || sessions;
    const s = list.find((x) => String(x._id || x.id) === String(sessionId));

    setSelectedSession(s || null);

    if (s) {
      await loadStudentsAndExistingAttendance(s);
    }
  }

  async function loadTeacherSessions() {
    setErr("");
    setOk("");
    setLoadingSessions(true);

    if (!savedUser?._id || savedUser?.role !== "teacher") {
      setSessions([]);
      setErr("لا يوجد صلاحية (Teacher) أو المستخدم غير مسجّل");
      setLoadingSessions(false);
      return;
    }

    try {
      // ✅ هامش 12 ساعة للخلف (عشان live أو جلسة بدأت قريب)
      const fromDate = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

      // ✅ scheduled + live
      const data = await fetchSessions({
        from: fromDate,
        status: "scheduled,live",
        sort: "startAt",
        limit: 200,
        teacherId: savedUser._id,
      });

      const list = normalizeSessions(data);
      setSessions(list);

      // ✅ إذا جاي sessionId من الرابط اختاره تلقائياً
      const qsSessionId = getQueryParam("sessionId");
      if (qsSessionId) {
        await onSelectSession(qsSessionId, list);
      }
    } catch (e) {
      setErr(e.message || "فشل تحميل جلسات المعلم");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    loadTeacherSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setStatus(studentId, status) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] || {}), status },
    }));
  }

  const counts = useMemo(() => {
    const ids = students.map((s) => s._id || s.id).filter(Boolean);
    let present = 0,
      absent = 0,
      late = 0,
      excused = 0;

    ids.forEach((id) => {
      const st = attendanceMap[id]?.status || "absent";
      if (st === "present") present++;
      else if (st === "late") late++;
      else if (st === "excused") excused++;
      else absent++;
    });

    return { total: ids.length, present, absent, late, excused };
  }, [students, attendanceMap]);

  async function handleSave() {
    setErr("");
    setOk("");

    if (!selectedSessionId) {
      setErr("الرجاء اختيار جلسة أولاً");
      return;
    }

    const sessionId = selectedSession?._id || selectedSession?.id;
    if (!sessionId) {
      setErr("جلسة غير صالحة");
      return;
    }

    const records = students
      .map((s) => {
        const sid = s._id || s.id;
        if (!sid) return null;
        const status = attendanceMap[sid]?.status || "absent";
        const note = attendanceMap[sid]?.note || "";
        return { studentId: sid, status, note };
      })
      .filter(Boolean);

    if (records.length === 0) {
      setErr("لا يوجد طلاب لحفظ حضورهم");
      return;
    }

    try {
      setSaving(true);
      await saveAttendanceForSession(sessionId, records);
      setOk("✅ تم حفظ الحضور بنجاح");
    } catch (e) {
      setErr(e.message || "❌ فشل حفظ الحضور");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">تسجيل الحضور 📅</h1>
          <p className="text-sm text-slate-500 mt-1">
            اختر جلسة من جلساتك (مجدولة/مباشر) ثم سجّل حضور طلاب الكورس.
          </p>
        </div>

        <button
          onClick={loadTeacherSessions}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          disabled={loadingSessions}
        >
          تحديث
        </button>
      </div>

      {err ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm">
          {ok}
        </div>
      ) : null}

      {/* Select Session */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          اختر الجلسة:
        </label>

        <select
          className="w-full border rounded-lg p-2 text-right"
          value={selectedSessionId}
          onChange={(e) => onSelectSession(e.target.value)}
          disabled={loadingSessions}
        >
          <option value="">-- اختر الجلسة --</option>
          {sessions.map((s) => {
            const id = s._id || s.id;
            const courseTitle = s.courseId?.title || s.courseId?.name || "—";
            return (
              <option key={id} value={id}>
                {s.title} — {courseTitle} ({formatAr(s.startAt)})
              </option>
            );
          })}
        </select>

        {loadingSessions ? (
          <p className="text-xs text-slate-500 mt-2">جاري تحميل الجلسات...</p>
        ) : null}

        {!loadingSessions && sessions.length === 0 ? (
          <p className="text-xs text-slate-500 mt-2">
            لا توجد جلسات (scheduled/live) لهذا المعلم.
          </p>
        ) : null}
      </div>

      {/* Students Table */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-xl font-bold text-gray-800">
            قائمة الطلاب في الجلسة
          </h2>

          <div className="text-sm text-slate-600">
            {selectedSessionId
              ? `الإجمالي: ${counts.total} • حاضر: ${counts.present} • غائب: ${counts.absent}`
              : "اختر جلسة لعرض الطلاب"}
          </div>
        </div>

        {(loadingStudents || loadingAttendance) && selectedSessionId ? (
          <div className="py-6 text-center text-slate-500">
            جاري تحميل الطلاب/الحضور...
          </div>
        ) : null}

        {!selectedSessionId ? (
          <div className="py-6 text-center text-slate-500">
            اختر جلسة أولاً لعرض الطلاب.
          </div>
        ) : null}

        {selectedSessionId && !(loadingStudents || loadingAttendance) ? (
          <table className="w-full text-right border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 border">#</th>
                <th className="py-2 px-3 border">اسم الطالب</th>
                <th className="py-2 px-3 border">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {students.map((st, index) => {
                const sid = st._id || st.id;
                const status = attendanceMap[sid]?.status || "absent";

                return (
                  <tr key={sid} className="border-b">
                    <td className="py-2 px-3 border">{index + 1}</td>
                    <td className="py-2 px-3 border">{st.name}</td>
                    <td className="py-2 px-3 border">
                      <div className="flex gap-2 justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => setStatus(sid, "present")}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            status === "present"
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          حاضر
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(sid, "absent")}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            status === "absent"
                              ? "bg-red-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          غائب
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(sid, "late")}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            status === "late"
                              ? "bg-amber-500 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          متأخر
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(sid, "excused")}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            status === "excused"
                              ? "bg-slate-600 text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          بعذر
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {students.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    لا يوجد طلاب في هذا الكورس. (لازم إضافة الطلاب داخل
                    Course.students)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : null}

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={!selectedSessionId || saving || students.length === 0}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-60"
          >
            {saving ? "جاري الحفظ..." : "💾 حفظ الحضور"}
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        *هذه الواجهة مربوطة فعليًا بالـ API (Sessions/Courses/Attendance).
      </p>
    </div>
  );
}
