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
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [err, setErr] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(savedUser);
  }, []);

  const myCourseIds = useMemo(() => {
    return myCourses.map((c) => c?._id || c?.id).filter(Boolean);
  }, [myCourses]);

  async function loadMyCourses() {
    setLoadingCourses(true);
    setErr("");
    try {
      if (!user?._id) {
        setMyCourses([]);
        return;
      }

      const data = await fetchCourses(); // { courses } أو []
      const all = normalizeList(data);

      // ✅ يعتمد على Course.students الحقيقي
      const mine = all.filter((c) => {
        const students = c.students || [];
        return students.some((sid) => String(sid) === String(user._id));
      });

      setMyCourses(mine);
    } catch (e) {
      setErr(e.message || "فشل تحميل كورسات الطالب");
      setMyCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadUpcomingSessions() {
    setLoadingSessions(true);
    setErr("");
    try {
      if (!user?._id) {
        setSessions([]);
        return;
      }

      // إذا ما عنده كورسات، ما نجيب جلسات
      if (myCourseIds.length === 0) {
        setSessions([]);
        return;
      }

      const nowIso = new Date().toISOString();

      const data = await fetchSessions({
        from: nowIso,
        status: "scheduled",
        limit: 200,
        sort: "startAt",
      });

      const allSessions = Array.isArray(data) ? data : data.sessions || [];

      const filtered = allSessions.filter((s) => {
        const cid = s.courseId?._id || s.courseId;
        return myCourseIds.includes(String(cid)) || myCourseIds.includes(cid);
      });

      setSessions(filtered);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات القادمة");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function refreshAll() {
    if (!user) return;
    await loadMyCourses();
  }

  // أول ما يجي user: حمّل كورساته
  useEffect(() => {
    if (user) loadMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // أول ما نعرف كورسات الطالب: حمّل الجلسات
  useEffect(() => {
    if (user) loadUpcomingSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, myCourseIds.length]);

  const nextThree = useMemo(() => sessions.slice(0, 3), [sessions]);

  return (
    <div className="p-6 text-right" dir="rtl">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            أهلاً، {user?.name || "الطالب"} 👋
          </h1>
          <p className="text-slate-500 text-sm">
            نظرة سريعة على كورساتك وجلساتك القادمة.
          </p>
        </div>

        <button
          onClick={async () => {
            await refreshAll();
            await loadUpcomingSessions();
          }}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          disabled={loadingCourses || loadingSessions}
        >
          تحديث
        </button>
      </div>

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
          {err}
        </div>
      ) : null}

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">كورساتي</h2>
          <p className="text-3xl font-bold text-teal-600">
            {loadingCourses ? "..." : myCourseIds.length}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            محسوبة من Course.students (حقيقية).
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">الجلسات القادمة</h2>
          <p className="text-3xl font-bold text-teal-600">
            {loadingSessions ? "..." : sessions.length}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            جلسات Scheduled من الآن للكورسات الخاصة بك.
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">الحضور</h2>
          <p className="text-sm text-slate-500 mt-2">
            افتح صفحة الحضور للاطلاع على سجلك.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-end gap-3 mb-6">
        <button
          onClick={() => (window.location.href = "/student/attendance")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-lg font-semibold"
        >
          📅 عرض الحضور
        </button>

        <button
          onClick={() => (window.location.href = "/student/schedule")}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition text-lg font-semibold"
        >
          🗓️ الجدول الدراسي
        </button>

        <button
          onClick={() => (window.location.href = "/student/study-plans")}
          className="px-6 py-3 bg-slate-700 text-white rounded-lg shadow hover:bg-slate-800 transition text-lg font-semibold"
        >
          📄 الخطة الدراسية
        </button>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-700">الجلسات القادمة</h2>
          <button
            className="text-sm text-blue-700 font-semibold hover:underline"
            onClick={() => (window.location.href = "/student/schedule")}
          >
            عرض الكل
          </button>
        </div>

        {loadingCourses || loadingSessions ? (
          <div className="text-slate-500">جاري التحميل...</div>
        ) : myCourseIds.length === 0 ? (
          <div className="text-slate-600">
            لا توجد كورسات مرتبطة بحسابك بعد. (لازم الأدمن يضيفك داخل
            Course.students)
          </div>
        ) : nextThree.length === 0 ? (
          <div className="text-slate-600">لا توجد جلسات قادمة حالياً.</div>
        ) : (
          <div className="space-y-3">
            {nextThree.map((s) => {
              const id = s._id || s.id;
              const courseName = s.courseId?.title || s.courseId?.name || "—";
              const meet = (s.meetUrl || "").trim();

              return (
                <div
                  key={id}
                  className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <p className="font-bold">{s.title}</p>
                    <p className="text-gray-500 text-sm">
                      {courseName} • {formatAr(s.startAt)}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    {meet ? (
                      <a
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                        href={meet}
                        target="_blank"
                        rel="noreferrer"
                      >
                        دخول
                      </a>
                    ) : (
                      <span className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                        لا يوجد رابط
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3 text-gray-700">ملاحظات</h2>
        <p className="text-slate-600">
          سيتم عرض المهام والإشعارات هنا عندما نربطها بواجهات API الخاصة بها
          (Assignments/Notifications).
        </p>
      </div>
    </div>
  );
}
