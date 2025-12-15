// frontend/src/pages/Teacher/TeacherDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchSessions } from "../../../api/sessionsApi";
import { fetchCourses } from "../../../api/coursesApi";
import { fetchTeacherAssignments } from "../../../api/assignmentApi";

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

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.courses)) return data.courses;
  if (Array.isArray(data.sessions)) return data.sessions;
  return [];
}

function ApiChip({ label, status }) {
  const state = status?.state || "idle";

  const ui = (() => {
    if (state === "loading")
      return {
        text: "جاري...",
        cls: "bg-amber-50 border-amber-200 text-amber-800",
        dot: "bg-amber-500",
      };
    if (state === "ok")
      return {
        text: "متصل",
        cls: "bg-emerald-50 border-emerald-200 text-emerald-800",
        dot: "bg-emerald-500",
      };
    if (state === "error")
      return {
        text: "فشل",
        cls: "bg-red-50 border-red-200 text-red-800",
        dot: "bg-red-500",
      };
    return {
      text: "—",
      cls: "bg-gray-50 border-gray-200 text-gray-700",
      dot: "bg-gray-400",
    };
  })();

  return (
    <div
      className={`border rounded-xl px-3 py-2 flex items-center justify-between ${ui.cls}`}
      dir="rtl"
    >
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${ui.dot}`} />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <span className="text-xs">{ui.text}</span>
    </div>
  );
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");

  const [apiStatus, setApiStatus] = useState({
    courses: { state: "idle", note: "" }, // idle | loading | ok | error
    sessions: { state: "idle", note: "" },
    assignments: { state: "idle", note: "" },
  });

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setTeacher(savedUser);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  async function loadData() {
    setErr("");
    setCopied("");
    setLoading(true);

    // ✅ set all to loading
    setApiStatus({
      courses: { state: "loading", note: "" },
      sessions: { state: "loading", note: "" },
      assignments: { state: "loading", note: "" },
    });

    try {
      if (!teacher?._id) {
        setCourses([]);
        setSessions([]);
        setAssignments([]);
        setApiStatus({
          courses: { state: "error", note: "لا يوجد مستخدم" },
          sessions: { state: "error", note: "لا يوجد مستخدم" },
          assignments: { state: "error", note: "لا يوجد مستخدم" },
        });
        return;
      }

      const nowIso = new Date().toISOString();

      // ✅ نفصل النداءات عشان نحدد حالة كل API لوحده
      const coursesP = fetchCourses()
        .then((res) => {
          setApiStatus((p) => ({ ...p, courses: { state: "ok", note: "" } }));
          return res;
        })
        .catch((e) => {
          setApiStatus((p) => ({
            ...p,
            courses: { state: "error", note: e?.message || "فشل" },
          }));
          return null;
        });

      const sessionsP = fetchSessions({
        teacherId: teacher._id,
        from: nowIso,
        status: "scheduled",
        sort: "startAt",
        limit: 200,
      })
        .then((res) => {
          setApiStatus((p) => ({ ...p, sessions: { state: "ok", note: "" } }));
          return res;
        })
        .catch((e) => {
          setApiStatus((p) => ({
            ...p,
            sessions: { state: "error", note: e?.message || "فشل" },
          }));
          return null;
        });

      const assignmentsP = fetchTeacherAssignments()
        .then((res) => {
          setApiStatus((p) => ({
            ...p,
            assignments: { state: "ok", note: "" },
          }));
          return res;
        })
        .catch((e) => {
          setApiStatus((p) => ({
            ...p,
            assignments: { state: "error", note: e?.message || "فشل" },
          }));
          return null;
        });

      const [coursesRes, sessionsRes, assignmentsRes] = await Promise.all([
        coursesP,
        sessionsP,
        assignmentsP,
      ]);

      // ✅ Courses
      const allCourses = normalizeList(coursesRes);
      const myCourses = allCourses.filter((c) => {
        const tid = c.teacherId?._id || c.teacherId;
        return String(tid) === String(teacher._id);
      });
      setCourses(myCourses);

      // ✅ Sessions
      const allSessions = Array.isArray(sessionsRes)
        ? sessionsRes
        : sessionsRes?.sessions || [];
      setSessions(allSessions);

      // ✅ Assignments
      setAssignments(assignmentsRes?.payload || []);
    } catch (e) {
      setErr(e.message || "فشل تحميل بيانات لوحة المعلم");
      setCourses([]);
      setSessions([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (teacher) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();

    const sessionsToday = sessions.filter(
      (s) => new Date(s.startAt).toDateString() === todayStr
    ).length;

    // ✅ مجموع الطلاب في كورسات المعلم (Unique) - يدعم ID أو Object
    const studentSet = new Set();
    courses.forEach((c) => {
      (c.students || []).forEach((s) => {
        const id = s?._id || s;
        if (id) studentSet.add(String(id));
      });
    });

    return {
      coursesCount: courses.length,
      sessionsToday,
      studentsCount: studentSet.size,
      upcomingCount: sessions.length,
      assignmentsCount: assignments.length,
    };
  }, [courses, sessions, assignments]);

  const nextSessions = useMemo(() => sessions.slice(0, 3), [sessions]);

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("✅ تم نسخ الرابط");
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("❌ لم يتم النسخ");
      setTimeout(() => setCopied(""), 1500);
    }
  }

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold">
            أهلاً، {teacher?.name || "المعلم"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ملخص سريع لكورساتك وجلساتك وواجباتك.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap justify-end">
          <button
            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-slate-50"
            onClick={loadData}
            disabled={loading}
          >
            تحديث
          </button>

          <button
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
            onClick={() => (window.location.href = "/teacher/profile")}
          >
            👤 الملف الشخصي
          </button>

          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
            onClick={logout}
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {err ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm">
          {err}
        </div>
      ) : null}

      {copied ? (
        <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl p-3 mb-4 text-sm">
          {copied}
        </div>
      ) : null}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">عدد كورساتي</p>
          <p className="text-3xl font-bold text-teal-600">
            {loading ? "..." : stats.coursesCount}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">جلسات اليوم</p>
          <p className="text-3xl font-bold text-indigo-600">
            {loading ? "..." : stats.sessionsToday}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">طلاب مسجلين (في كورساتك)</p>
          <p className="text-3xl font-bold text-emerald-600">
            {loading ? "..." : stats.studentsCount}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">الجلسات القادمة</p>
          <p className="text-3xl font-bold text-orange-500">
            {loading ? "..." : stats.upcomingCount}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">الواجبات</p>
          <p className="text-3xl font-bold text-slate-700">
            {loading ? "..." : stats.assignmentsCount}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Sessions */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الجلسات</h2>
          <p className="text-gray-600 text-sm">
            إدارة الجلسات المباشرة، الوقت، التاريخ، والرابط.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/sessions")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الجلسات
            </button>
            <button
              onClick={() => (window.location.href = "/teacher/attendance")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              📅 تسجيل الحضور
            </button>
          </div>
        </div>

        {/* Lessons */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الدروس</h2>
          <p className="text-gray-600 text-sm">إضافة الدروس وروابط YouTube.</p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/lessons")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الدروس
            </button>
          </div>
        </div>

        {/* Assignments & Students */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الواجبات والطلاب</h2>
          <p className="text-gray-600 text-sm">
            إنشاء واجبات، متابعة التسليمات، واستعراض الطلاب.
          </p>
          <div className="flex gap-3 justify-end flex-wrap">
            <button
              onClick={() => (window.location.href = "/teacher/assignments")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الواجبات
            </button>

            <button
              onClick={() => (window.location.href = "/teacher/submissions")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              📨 تسليمات الطلاب
            </button>

            <button
              onClick={() => (window.location.href = "/teacher/students")}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm"
            >
              قائمة الطلاب
            </button>
          </div>
        </div>

        {/* Schedule & Plans */}
        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الجدول / الخطة</h2>
          <p className="text-gray-600 text-sm">
            عرض الجداول والخطط الدراسية المرفوعة من الإدارة.
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/schedule")}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm"
            >
              📅 عرض الجدول
            </button>

            <button
              onClick={() => (window.location.href = "/teacher/study-files")}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
            >
              📘 عرض الخطة
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">
            الجلسات القادمة 🎥
          </h2>

          <button
            className="text-sm text-blue-700 font-semibold hover:underline"
            onClick={() => (window.location.href = "/teacher/sessions")}
          >
            عرض الكل
          </button>
        </div>

        {loading ? (
          <div className="text-slate-500">جاري التحميل...</div>
        ) : nextSessions.length === 0 ? (
          <div className="text-slate-600">لا توجد جلسات قادمة حالياً.</div>
        ) : (
          <div className="space-y-3">
            {nextSessions.map((s) => {
              const id = s._id || s.id;
              const courseTitle = s.courseId?.title || s.courseId?.name || "—";
              const meet = (s.meetUrl || "").trim();

              return (
                <div
                  key={id}
                  className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold">{s.title}</p>
                    <p className="text-gray-500 text-sm">
                      {courseTitle} • {formatAr(s.startAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end flex-wrap">
                    {meet ? (
                      <button
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                        onClick={() => copy(meet)}
                      >
                        نسخ رابط الجلسة
                      </button>
                    ) : (
                      <span className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        لا يوجد رابط
                      </span>
                    )}

                    <button
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      onClick={() =>
                        (window.location.href = "/teacher/attendance")
                      }
                    >
                      تسجيل الحضور
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ API Health Bar */}
      <div className="mt-6 flex justify-center">
        <div className="bg-white border rounded-2xl shadow-sm px-4 py-3 w-full max-w-3xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="text-sm font-semibold text-gray-800">
                حالة الربط بالـ API
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                يعرض حالة الخدمات لحظيًا (تحميل / نجاح / فشل).
              </div>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-gray-900 text-white text-xs disabled:opacity-60"
            >
              {loading ? "جاري الفحص..." : "إعادة فحص"}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ApiChip label="Courses" status={apiStatus.courses} />
            <ApiChip label="Sessions" status={apiStatus.sessions} />
            <ApiChip label="Assignments" status={apiStatus.assignments} />
          </div>

          {["courses", "sessions", "assignments"].some(
            (k) => apiStatus[k]?.state === "error"
          ) ? (
            <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl p-2">
              يوجد خطأ في خدمة واحدة أو أكثر.{" "}
              {apiStatus.courses?.state === "error"
                ? `Courses: ${apiStatus.courses.note}. `
                : ""}
              {apiStatus.sessions?.state === "error"
                ? `Sessions: ${apiStatus.sessions.note}. `
                : ""}
              {apiStatus.assignments?.state === "error"
                ? `Assignments: ${apiStatus.assignments.note}. `
                : ""}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
