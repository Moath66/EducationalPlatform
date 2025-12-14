import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "../../styles/ClassSessions.css";

import {
  createSession,
  deleteSession,
  fetchSessions,
  updateSession,
} from "../../../api/sessionsApi";

import { fetchCourses } from "../../../api/coursesApi";

const STATUS_LABEL = {
  scheduled: "مجدولة",
  live: "مباشر",
  ended: "منتهية",
  cancelled: "ملغاة",
};

const STATUS_BADGE = {
  scheduled: "badge badge--scheduled",
  live: "badge badge--live",
  ended: "badge badge--ended",
  cancelled: "badge badge--cancelled",
};

function toLocalInputValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

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
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export default function ClassSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeId, setActiveId] = useState(null);

  // dropdown data
  const [courses, setCourses] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  // form (✅ لا يوجد teacherId هنا)
  const [form, setForm] = useState({
    title: "",
    courseId: "",
    startAt: "",
    durationMinutes: 60,
    meetUrl: "",
    status: "scheduled",
    notes: "",
  });

  async function loadSessions() {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchSessions({
        q: q.trim(),
        status: status === "all" ? "" : status,
        limit: 50,
        sort: "-startAt",
      });

      const list = Array.isArray(data) ? data : data.sessions || [];
      setSessions(list);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const today = sessions.filter(
      (s) => new Date(s.startAt).toDateString() === todayStr
    ).length;
    const upcoming = sessions.filter(
      (s) => new Date(s.startAt) > now && s.status !== "cancelled"
    ).length;
    const ended = sessions.filter((s) => s.status === "ended").length;
    const noMeet = sessions.filter((s) => !(s.meetUrl || "").trim()).length;
    return { today, upcoming, ended, noMeet };
  }, [sessions]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return sessions;

    return sessions.filter((s) => {
      const title = (s.title || "").toLowerCase();
      const courseName = (
        s.courseId?.name ||
        s.courseId?.title ||
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

  async function loadMeta() {
    setLoadingMeta(true);
    setErr("");
    try {
      const cData = await fetchCourses();
      setCourses(normalizeList(cData));
    } catch (e) {
      setErr(e.message || "فشل تحميل الكورسات");
    } finally {
      setLoadingMeta(false);
    }
  }

  async function openCreate() {
    setMode("create");
    setActiveId(null);
    setForm({
      title: "",
      courseId: "",
      startAt: "",
      durationMinutes: 60,
      meetUrl: "",
      status: "scheduled",
      notes: "",
    });
    setOpen(true);
    await loadMeta();
  }

  async function openEdit(session) {
    setMode("edit");
    setActiveId(session._id || session.id);

    setForm({
      title: session.title || "",
      courseId: session.courseId?._id || session.courseId || "",
      startAt: session.startAt ? toLocalInputValue(session.startAt) : "",
      durationMinutes: session.durationMinutes || 60,
      meetUrl: session.meetUrl || "",
      status: session.status || "scheduled",
      notes: session.notes || "",
    });

    setOpen(true);
    await loadMeta();
  }

  function closeModal() {
    setOpen(false);
  }

  function onChangeCourse(courseId) {
    setForm((p) => ({ ...p, courseId }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("اكتب اسم الجلسة.");
    if (!form.courseId) return setErr("اختر كورس.");
    if (!form.startAt) return setErr("حدد التاريخ والوقت.");

    // ✅ لا نرسل teacherId — السيرفر يجلبه من courseId
    const payload = {
      title: form.title.trim(),
      courseId: form.courseId,
      startAt: new Date(form.startAt).toISOString(),
      durationMinutes: Number(form.durationMinutes) || 60,
      meetUrl: (form.meetUrl || "").trim(),
      status: form.status,
      notes: (form.notes || "").trim(),
    };

    try {
      if (mode === "create") await createSession(payload);
      else await updateSession(activeId, payload);

      setOpen(false);
      await loadSessions();
    } catch (e2) {
      setErr(e2.message || "فشل حفظ الجلسة");
    }
  }

  async function onDelete(session) {
    const id = session._id || session.id;
    const ok = confirm("هل أنت متأكد من حذف الجلسة؟");
    if (!ok) return;

    try {
      await deleteSession(id);
      await loadSessions();
    } catch (e) {
      setErr(e.message || "فشل حذف الجلسة");
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }

  return (
    <AdminLayout>
      <div className="cs-wrap" dir="rtl">
        <div className="cs-header">
          <div>
            <h2 className="cs-title">إدارة جلسات الفصول</h2>
            <p className="cs-subtitle">
              اختر الكورس فقط — المعلم يتم ربطه تلقائيًا من الكورس.
            </p>
          </div>

          <div className="cs-actions">
            <button
              className="btn btn--ghost"
              onClick={loadSessions}
              disabled={loading}
            >
              تحديث
            </button>
            <button className="btn btn--primary" onClick={openCreate}>
              + إضافة جلسة
            </button>
          </div>
        </div>

        <div className="cs-stats">
          <div className="stat">
            <div className="stat__label">جلسات اليوم</div>
            <div className="stat__value">{stats.today}</div>
          </div>
          <div className="stat">
            <div className="stat__label">القادمة</div>
            <div className="stat__value">{stats.upcoming}</div>
          </div>
          <div className="stat">
            <div className="stat__label">منتهية</div>
            <div className="stat__value">{stats.ended}</div>
          </div>
          <div className="stat">
            <div className="stat__label">بدون Meet</div>
            <div className="stat__value">{stats.noMeet}</div>
          </div>
        </div>

        <div className="cs-filters">
          <div className="field">
            <label>بحث</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث باسم الجلسة/الكورس/المعلم..."
            />
          </div>

          <div className="field">
            <label>الحالة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">الكل</option>
              <option value="scheduled">مجدولة</option>
              <option value="live">مباشر</option>
              <option value="ended">منتهية</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>

          <div className="field field--grow">
            <label>&nbsp;</label>
            <button
              className="btn btn--secondary"
              onClick={loadSessions}
              disabled={loading}
            >
              تطبيق / تحديث النتائج
            </button>
          </div>
        </div>

        {err ? <div className="cs-alert">{err}</div> : null}

        <div className="cs-card">
          <div className="cs-card__head">
            <div className="cs-card__title">قائمة الجلسات</div>
            <div className="cs-card__meta">
              {loading ? "جاري التحميل..." : `عدد النتائج: ${filtered.length}`}
            </div>
          </div>

          <div className="cs-tableWrap">
            <table className="cs-table">
              <thead>
                <tr>
                  <th>الجلسة</th>
                  <th>الكورس</th>
                  <th>المعلم</th>
                  <th>التاريخ/الوقت</th>
                  <th>الحالة</th>
                  <th>Meet</th>
                  <th>إجراءات</th>
                </tr>
              </thead>

              <tbody>
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="cs-empty">
                      لا توجد جلسات حالياً.
                    </td>
                  </tr>
                ) : null}

                {filtered.map((s) => {
                  const id = s._id || s.id;
                  const courseName =
                    s.courseId?.name || s.courseId?.title || "—";
                  const teacherName =
                    s.teacherId?.name ||
                    s.teacherId?.fullName ||
                    s.teacherId?.email ||
                    "—";

                  return (
                    <tr key={id}>
                      <td>
                        <div className="cellTitle">{s.title}</div>
                        <div className="cellSub">
                          المدة: {s.durationMinutes} دقيقة
                        </div>
                      </td>
                      <td>{courseName}</td>
                      <td>{teacherName}</td>
                      <td>
                        <div className="cellTitle">{formatAr(s.startAt)}</div>
                      </td>
                      <td>
                        <span className={STATUS_BADGE[s.status] || "badge"}>
                          {STATUS_LABEL[s.status] || s.status}
                        </span>
                      </td>
                      <td>
                        {s.meetUrl ? (
                          <div className="meetCell">
                            <button
                              className="btn btn--tiny"
                              onClick={() => copy(s.meetUrl)}
                            >
                              نسخ
                            </button>
                            <a
                              className="link"
                              href={s.meetUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              فتح
                            </a>
                          </div>
                        ) : (
                          <span className="muted">—</span>
                        )}
                      </td>
                      <td>
                        <div className="rowActions">
                          <button
                            className="btn btn--tiny"
                            onClick={() => openEdit(s)}
                          >
                            تعديل
                          </button>
                          <button
                            className="btn btn--tiny btn--danger"
                            onClick={() => onDelete(s)}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {open ? (
          <div className="cs-modalOverlay" onMouseDown={closeModal}>
            <div className="cs-modal" onMouseDown={(e) => e.stopPropagation()}>
              <div className="cs-modal__head">
                <div>
                  <div className="cs-modal__title">
                    {mode === "create" ? "إضافة جلسة" : "تعديل جلسة"}
                  </div>
                  <div className="cs-modal__sub">
                    {loadingMeta
                      ? "جاري تحميل الكورسات..."
                      : "اختر الكورس فقط — المعلم يجي تلقائيًا."}
                  </div>
                </div>
                <button className="iconBtn" onClick={closeModal}>
                  ✕
                </button>
              </div>

              <form className="cs-form" onSubmit={onSubmit}>
                <div className="grid">
                  <div className="field">
                    <label>اسم الجلسة</label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                      placeholder="مثال: مراجعة الوحدة 2"
                    />
                  </div>

                  <div className="field">
                    <label>الحالة</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, status: e.target.value }))
                      }
                    >
                      <option value="scheduled">مجدولة</option>
                      <option value="live">مباشر</option>
                      <option value="ended">منتهية</option>
                      <option value="cancelled">ملغاة</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>الكورس</label>
                    <select
                      value={form.courseId}
                      onChange={(e) => onChangeCourse(e.target.value)}
                      disabled={loadingMeta}
                    >
                      <option value="">اختر كورس...</option>
                      {courses.map((c) => {
                        const id = c._id || c.id;
                        const name = c.name || c.title || c.code || "Course";
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="field">
                    <label>التاريخ والوقت</label>
                    <input
                      type="datetime-local"
                      value={form.startAt}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, startAt: e.target.value }))
                      }
                    />
                  </div>

                  <div className="field">
                    <label>المدة (دقيقة)</label>
                    <input
                      type="number"
                      min={10}
                      max={600}
                      value={form.durationMinutes}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          durationMinutes: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="field field--full">
                    <label>رابط Google Meet</label>
                    <input
                      value={form.meetUrl}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, meetUrl: e.target.value }))
                      }
                      placeholder="https://meet.google.com/..."
                    />
                  </div>

                  <div className="field field--full">
                    <label>ملاحظات (اختياري)</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, notes: e.target.value }))
                      }
                      placeholder="أي ملاحظات تخص الجلسة..."
                    />
                  </div>
                </div>

                <div className="cs-form__actions">
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={closeModal}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={loadingMeta}
                  >
                    {mode === "create" ? "حفظ الجلسة" : "تحديث الجلسة"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
