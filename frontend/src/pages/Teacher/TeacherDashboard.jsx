// frontend/src/pages/Teacher/TeacherDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchSessions } from "../../../api/sessionsApi";
import { fetchCourses } from "../../../api/coursesApi";

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

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");

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

    try {
      if (!teacher?._id) {
        setCourses([]);
        setSessions([]);
        return;
      }

      const now = new Date();
      const nowIso = now.toISOString();

      const [coursesRes, sessionsRes] = await Promise.all([
        fetchCourses(),
        fetchSessions({
          teacherId: teacher._id, // احتياط لو الباك ما يفلتر تلقائيًا
          from: nowIso,
          status: "scheduled",
          sort: "startAt",
          limit: 200,
        }),
      ]);

      const allCourses = normalizeList(coursesRes);
      const myCourses = allCourses.filter((c) => {
        const tid = c.teacherId?._id || c.teacherId;
        return String(tid) === String(teacher._id);
      });

      const allSessions = Array.isArray(sessionsRes)
        ? sessionsRes
        : sessionsRes.sessions || [];

      setCourses(myCourses);
      setSessions(allSessions);
    } catch (e) {
      setErr(e.message || "فشل تحميل بيانات لوحة المعلم");
      setCourses([]);
      setSessions([]);
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

    // مجموع الطلاب في كورسات المعلم (Unique)
    const studentSet = new Set();
    courses.forEach((c) => {
      (c.students || []).forEach((sid) => studentSet.add(String(sid)));
    });

    return {
      coursesCount: courses.length,
      sessionsToday,
      studentsCount: studentSet.size,
      upcomingCount: sessions.length,
    };
  }, [courses, sessions]);

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
            ملخص سريع لكورساتك وجلساتك القادمة.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-slate-50"
            onClick={loadData}
            disabled={loading}
          >
            تحديث
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

      {/* Stats Cards (Real) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
          <p className="text-xs text-slate-400 mt-1">
            *الواجبات لاحقًا عند إضافة API
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
          <p className="text-gray-600 text-sm">
            إضافة الدروس، رفع ملفات، وروابط YouTube.
          </p>
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
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/assignments")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الواجبات
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

      {/* Upcoming Sessions (Real) */}
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
                      onClick={() => (window.location.href = "/teacher/attendance")}
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

      <p className="text-xs text-gray-400 text-center mt-4">
        *البيانات هنا مربوطة بالـ API (Courses/Sessions). الواجبات لاحقًا.
      </p>
    </div>
  );
}
