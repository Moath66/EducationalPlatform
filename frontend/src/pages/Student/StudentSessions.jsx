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

const STATUS_LABEL = {
  scheduled: "مجدولة",
  live: "مباشر",
  ended: "منتهية",
  cancelled: "ملغاة",
};

export default function StudentSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [view, setView] = useState("upcoming"); // upcoming | all
  const [status, setStatus] = useState("scheduled"); // scheduled | all | ...

  async function loadSessions() {
    setLoading(true);
    setErr("");

    try {
      const nowIso = new Date().toISOString();

      const params = {
        q: q.trim() || "",
        limit: 200,
        sort: "startAt",
      };

      // upcoming: من الآن
      if (view === "upcoming") {
        params.from = nowIso;
        params.sort = "startAt";
      } else {
        params.sort = "-startAt";
      }

      // status filter
      if (status && status !== "all") params.status = status;

      const data = await fetchSessions(params);

      const list = Array.isArray(data) ? data : data.sessions || [];
      setSessions(list);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, status]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sessions;

    return sessions.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const courseName = (
        s.courseId?.title ||
        s.courseId?.name ||
        ""
      ).toLowerCase();
      const teacherName = (
        s.teacherId?.name ||
        s.teacherId?.fullName ||
        s.teacherId?.email ||
        ""
      ).toLowerCase();

      return (
        title.includes(needle) ||
        courseName.includes(needle) ||
        teacherName.includes(needle)
      );
    });
  }, [sessions, q]);

  return (
    <div className="p-6 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold mb-1">جلساتي</h1>
          <p className="text-slate-500 text-sm">
            كل الجلسات الخاصة بك (القادمة/السابقة) حسب كورساتك.
          </p>
        </div>

        <button
          onClick={loadSessions}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          disabled={loading}
        >
          تحديث
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-slate-600 block mb-1">بحث</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم الجلسة / الكورس / المعلم..."
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1">العرض</label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="upcoming">القادمة فقط</option>
              <option value="all">الكل</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1">الحالة</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              <option value="all">الكل</option>
              <option value="scheduled">مجدولة</option>
              <option value="live">مباشر</option>
              <option value="ended">منتهية</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={loadSessions}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
            disabled={loading}
          >
            تطبيق
          </button>
        </div>
      </div>

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
          {err}
        </div>
      ) : null}

      {/* List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="font-semibold text-slate-800">قائمة الجلسات</div>
          <div className="text-sm text-slate-500">
            {loading ? "جاري التحميل..." : `عدد النتائج: ${filtered.length}`}
          </div>
        </div>

        <div className="divide-y">
          {!loading && filtered.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              لا توجد جلسات حالياً.
            </div>
          ) : null}

          {filtered.map((s) => {
            const id = s._id || s.id;
            const courseName = s.courseId?.title || s.courseId?.name || "—";
            const teacherName =
              s.teacherId?.name ||
              s.teacherId?.fullName ||
              s.teacherId?.email ||
              "—";
            const meet = (s.meetUrl || "").trim();

            return (
              <div
                key={id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-800">{s.title}</div>
                  <div className="text-slate-500 text-sm mt-1">
                    {courseName} • {teacherName} • {formatAr(s.startAt)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    الحالة: {STATUS_LABEL[s.status] || s.status} • المدة:{" "}
                    {s.durationMinutes} دقيقة
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  {meet ? (
                    <a
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      href={meet}
                      target="_blank"
                      rel="noreferrer"
                    >
                      دخول
                    </a>
                  ) : (
                    <span className="px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm">
                      لا يوجد رابط
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
