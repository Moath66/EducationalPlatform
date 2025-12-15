// frontend/src/pages/Teacher/TeacherSessions.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchSessions } from "../../../api/sessionsApi";

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

export default function TeacherSessions() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(savedUser);
  }, []);

  async function load(u) {
    setErr("");
    setCopied("");

    if (!u?._id || u?.role !== "teacher") {
      setLoading(false);
      setSessions([]);
      setErr("لا يوجد صلاحية (Teacher) أو المستخدم غير مسجّل.");
      return;
    }

    const teacherId = u._id;

    setLoading(true);

    try {
      // 👇 هامش 12 ساعة للخلف (عشان ما تختفي جلسة بدأت قريب أو live)
      const fromDate = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();

      // ✅ خلي الفلترة من الباك (يدعم scheduled,live)
      const data = await fetchSessions({
        teacherId,
        from: fromDate,
        status: "scheduled,live",
        limit: 100,
        sort: "startAt",
      });

      const list = normalizeSessions(data);
      setSessions(list);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) load(user);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sessions;
    return sessions.filter((s) =>
      (s.title || "").toLowerCase().includes(needle)
    );
  }, [sessions, q]);

  function openAttendance(sessionId) {
    // ✅ نخليها زي ما هي (وبعدين نحدّث TeacherAttendance يقرأها تلقائياً)
    window.location.href = `/teacher/attendance?sessionId=${sessionId}`;
  }

  async function copyMeet(meet) {
    try {
      await navigator.clipboard.writeText(meet);
      setCopied("✅ تم نسخ الرابط");
      setTimeout(() => setCopied(""), 1200);
    } catch {
      setCopied("❌ لم يتم النسخ");
      setTimeout(() => setCopied(""), 1200);
    }
  }

  function toExternalUrl(url) {
    const u = (url || "").trim();
    if (!u) return "";
    // لو المستخدم كتب meet.google.com/... أو www... أو أي شيء بدون http
    if (!/^https?:\/\//i.test(u)) return `https://${u}`;
    return u;
  }

  return (
    <div className="p-6 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">جلساتي القادمة</h1>
          <p className="text-slate-500 text-sm">
            أهلاً {user?.name || "المعلم"} — هنا ستجد جلساتك (مجدولة/مباشر).
          </p>
        </div>

        <button
          onClick={() => user && load(user)}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          disabled={loading}
        >
          تحديث
        </button>
      </div>

      {copied ? (
        <div className="bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-lg mb-4">
          {copied}
        </div>
      ) : null}

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
          {err}
        </div>
      ) : null}

      <div className="bg-white p-4 rounded-xl shadow mb-5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex-1">
          <label className="text-sm text-slate-600 block mb-1">بحث</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم الجلسة..."
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
          />
        </div>

        <div className="text-sm text-slate-600">
          {loading ? "جاري التحميل..." : `عدد الجلسات: ${filtered.length}`}
        </div>
      </div>

      {!user ? (
        <div className="bg-white p-5 rounded-xl shadow text-slate-600">
          لا توجد بيانات مستخدم. الرجاء تسجيل الدخول مرة أخرى.
        </div>
      ) : null}

      <div className="space-y-3">
        {!loading && filtered.length === 0 ? (
          <div className="bg-white p-5 rounded-xl shadow text-slate-600">
            لا توجد جلسات (مجدولة/مباشر) حالياً.
          </div>
        ) : null}

        {filtered.map((s) => {
          const id = s._id || s.id;
          const courseName = s.courseId?.name || s.courseId?.title || "—";
          const meet = (s.meetUrl || "").trim();
          const statusLabel =
            s.status === "scheduled"
              ? "مجدولة"
              : s.status === "live"
              ? "مباشر"
              : s.status;
          const meetLink = toExternalUrl(meet);

          return (
            <div key={id} className="bg-white p-5 rounded-xl shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {s.title}
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">
                    {courseName} • {formatAr(s.startAt)} • {s.durationMinutes}{" "}
                    دقيقة
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    الحالة: {statusLabel}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {meet ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          window.open(
                            toExternalUrl(meet),
                            "_blank",
                            "noopener,noreferrer"
                          )
                        }
                      >
                        فتح Meet
                      </button>

                      <button
                        onClick={() => copyMeet(meet)}
                        className="px-4 py-2 bg-white border rounded-lg hover:bg-slate-50"
                      >
                        نسخ الرابط
                      </button>
                    </>
                  ) : (
                    <span className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                      لا يوجد رابط Meet
                    </span>
                  )}

                  <button
                    onClick={() => openAttendance(id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    تسجيل الحضور
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
