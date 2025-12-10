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

export default function TeacherSessions() {
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(savedUser);
  }, []);

  async function load(u) {
    if (!u?._id && !u?.id) return;
    setLoading(true);
    setErr("");

    try {
      const teacherId = u._id || u.id;
      const nowIso = new Date().toISOString();

      const data = await fetchSessions({
        teacherId,
        from: nowIso,
        status: "scheduled",
        limit: 50,
        sort: "startAt",
      });

      setSessions(data.sessions || []);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات");
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
    window.location.href = `/teacher/attendance?sessionId=${sessionId}`;
  }

  return (
    <div className="p-6 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">جلساتي القادمة</h1>
          <p className="text-slate-500 text-sm">
            أهلاً {user?.name || "المعلم"} — هنا ستجد جلساتك المجدولة القادمة.
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
          {loading
            ? "جاري التحميل..."
            : `عدد الجلسات القادمة: ${filtered.length}`}
        </div>
      </div>

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
          {err}
        </div>
      ) : null}

      <div className="space-y-3">
        {!loading && filtered.length === 0 ? (
          <div className="bg-white p-5 rounded-xl shadow text-slate-600">
            لا توجد جلسات قادمة حالياً.
          </div>
        ) : null}

        {filtered.map((s) => {
          const id = s._id || s.id;
          const courseName = s.courseId?.name || s.courseId?.title || "—";
          const meet = (s.meetUrl || "").trim();

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
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                  {meet ? (
                    <>
                      <a
                        href={meet}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                      >
                        فتح Meet
                      </a>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(meet);
                          } catch {}
                        }}
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
