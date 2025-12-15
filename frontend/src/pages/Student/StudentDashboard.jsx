// frontend/src/pages/Student/StudentDashboard.jsx
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

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const myCourseIds = useMemo(() => {
    return myCourses
      .map((c) => c?._id || c?.id)
      .filter(Boolean)
      .map(String);
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

      // ✅ يدعم Course.students IDs أو Objects
      const mine = all.filter((c) => {
        const students = c.students || [];
        return students.some((s) => {
          const id = s?._id || s;
          return String(id) === String(user._id);
        });
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
        return myCourseIds.includes(String(cid));
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
    await loadUpcomingSessions();
  }

  useEffect(() => {
    if (user) loadMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (user) loadUpcomingSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, myCourseIds.length]);

  const nextThree = useMemo(() => sessions.slice(0, 3), [sessions]);

  return (
    <div className="p-4 md:p-6 min-h-screen bg-gray-100 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div className="bg-white border rounded-2xl p-4 md:p-5 w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            أهلاً، {user?.name || "الطالب"} 👋
          </h1>
          <p className="text-slate-500 text-sm">
            لوحة التحكم الخاصة بك — كورساتك، جلساتك، وواجباتك.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            onClick={refreshAll}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm disabled:opacity-60"
            disabled={loadingCourses || loadingSessions}
          >
            {loadingCourses || loadingSessions ? "جاري..." : "تحديث"}
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl mb-5 text-sm">
          {err}
        </div>
      ) : null}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">كورساتي</p>
          <p className="text-3xl font-bold text-teal-600">
            {loadingCourses ? "..." : myCourseIds.length}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            محسوبة من Course.students (حقيقية).
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">الجلسات القادمة</p>
          <p className="text-3xl font-bold text-indigo-600">
            {loadingSessions ? "..." : sessions.length}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            جلسات Scheduled من الآن للكورسات الخاصة بك.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-sm border">
          <p className="text-gray-500 text-sm">الحضور</p>
          <p className="text-sm text-slate-500 mt-2">
            افتح صفحة الحضور للاطلاع على سجلك.
          </p>
        </div>
      </div>

      {/* Quick Actions (Grid + نفس ستايل زر جلساتي) */}
      <div className="bg-white border rounded-2xl p-4 md:p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            إجراءات سريعة
          </h2>
          <span className="text-xs text-gray-500">اختصر طريقك</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ActionBtn
            title="🎓 جلساتي"
            subtitle="عرض الجلسات القادمة"
            onClick={() => (window.location.href = "/student/sessions")}
            className="bg-teal-600 hover:bg-teal-700"
          />

          <ActionBtn
            title="📝 الواجبات"
            subtitle="عرض الواجبات + رفع الحل"
            onClick={() => (window.location.href = "/student/assignments")}
            className="bg-emerald-600 hover:bg-emerald-700"
          />

          <ActionBtn
            title="📅 عرض الحضور"
            subtitle="سجل حضورك"
            onClick={() => (window.location.href = "/student/attendance")}
            className="bg-indigo-600 hover:bg-indigo-700"
          />

          <ActionBtn
            title="🗓️ الجدول الدراسي"
            subtitle="عرض جدولك"
            onClick={() => (window.location.href = "/student/schedule")}
            className="bg-slate-800 hover:bg-slate-900"
          />

          <ActionBtn
            title="📄 الخطة الدراسية"
            subtitle="ملفات الخطة"
            onClick={() => (window.location.href = "/student/study-plans")}
            className="bg-slate-700 hover:bg-slate-800"
          />

          <ActionBtn
            title="👤 الملف الشخصي"
            subtitle="تعديل بياناتك"
            onClick={() => (window.location.href = "/student/profile")}
            className="bg-gray-900 hover:bg-black"
          />
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-700">الجلسات القادمة</h2>

          <button
            className="text-sm text-blue-700 font-semibold hover:underline"
            onClick={() => (window.location.href = "/student/sessions")}
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
                  className="p-4 border rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3"
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
                        className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 text-sm font-semibold"
                        href={meet}
                        target="_blank"
                        rel="noreferrer"
                      >
                        دخول
                      </a>
                    ) : (
                      <span className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
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
      <div className="bg-white p-5 rounded-2xl shadow-sm border">
        <h2 className="text-xl font-bold mb-3 text-gray-700">ملاحظات</h2>
        <p className="text-slate-600">
          تم تجهيز صفحات الواجبات (StudentAssignments) لعرض الواجبات ورفع الحل.
          في أي وقت تحتاج تحسين تجربة الرفع أو إضافة إشعارات، نربطها بسهولة.
        </p>
      </div>
    </div>
  );
}

function ActionBtn({ title, subtitle, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right px-5 py-4 rounded-2xl shadow hover:shadow-md transition text-white ${className}`}
      dir="rtl"
    >
      <div className="text-lg font-bold">{title}</div>
      <div className="text-sm opacity-90 mt-1">{subtitle}</div>
    </button>
  );
}
