import { useEffect, useMemo, useState } from "react";
import { fetchSessions } from "../../api/sessionsApi";

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

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(savedUser);
  }, []);

  const courseIds = useMemo(() => {
    // حاول تغطي أكثر من اسم محتمل حسب مشروعك
    const ids =
      user?.courseIds ||
      user?.courses ||
      user?.enrolledCourses ||
      user?.enrollments ||
      [];
    // لو العناصر Objects
    return (ids || [])
      .map((c) => (typeof c === "string" ? c : c?._id || c?.id))
      .filter(Boolean);
  }, [user]);

  async function loadUpcoming() {
    setLoadingSessions(true);
    setErr("");

    try {
      const nowIso = new Date().toISOString();

      // نجلب جلسات قادمة عامة (scheduled + from now) ثم نفلترها لكورسات الطالب
      // (حل سريع بدون endpoint مخصص)
      const data = await fetchSessions({
        from: nowIso,
        status: "scheduled",
        limit: 100,
        sort: "startAt",
      });

      const all = data.sessions || [];
      const filtered = courseIds.length
        ? all.filter((s) => courseIds.includes(s.courseId?._id || s.courseId))
        : [];

      setSessions(filtered);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات القادمة");
    } finally {
      setLoadingSessions(false);
    }
  }

  useEffect(() => {
    if (user) loadUpcoming();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, courseIds.length]);

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
            نظرة سريعة على جلساتك القادمة.
          </p>
        </div>

        <button
          onClick={loadUpcoming}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          disabled={loadingSessions}
        >
          تحديث
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">كورساتي</h2>
          <p className="text-3xl font-bold text-teal-600">{courseIds.length}</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">الجلسات القادمة</h2>
          <p className="text-3xl font-bold text-teal-600">
            {loadingSessions ? "..." : sessions.length}
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

        {err ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-3">
            {err}
          </div>
        ) : null}

        {!loadingSessions && courseIds.length === 0 ? (
          <div className="text-slate-600">
            لا يوجد كورسات مرتبطة بحساب الطالب داخل بيانات المستخدم. اربط كورسات
            الطالب (enrolledCourses) عشان نجيب جلساته.
          </div>
        ) : null}

        {loadingSessions ? (
          <div className="text-slate-500">جاري تحميل الجلسات...</div>
        ) : nextThree.length === 0 ? (
          <div className="text-slate-600">لا توجد جلسات قادمة حالياً.</div>
        ) : (
          <div className="space-y-3">
            {nextThree.map((s) => {
              const id = s._id || s.id;
              const courseName = s.courseId?.name || s.courseId?.title || "—";
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

      {/* بدل المهام/الإشعارات الوهمية */}
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
