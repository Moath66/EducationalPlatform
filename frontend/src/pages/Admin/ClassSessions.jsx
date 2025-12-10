import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import "./ClassSessions.css";
import {
  createSession,
  deleteSession,
  fetchSessions,
  updateSession,
} from "../../api/sessionsApi";

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
  // يحول Date/ISO إلى صيغة مناسبة لـ input datetime-local
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
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

export default function ClassSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  // modal state
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeId, setActiveId] = useState(null);

  // form state
  const [form, setForm] = useState({
    title: "",
    courseId: "",
    teacherId: "",
    startAt: "",
    durationMinutes: 60,
    meetUrl: "",
    status: "scheduled",
    notes: "",
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const data = await fetchSessions({
        q: q.trim(),
        status: status === "all" ? "" : status,
        limit: 50,
        sort: "-startAt",
      });
      setSessions(data.sessions || []);
    } catch (e) {
      setErr(e.message || "فشل تحميل الجلسات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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

  function openCreate() {
    setMode("create");
    setActiveId(null);
    setForm({
      title: "",
      courseId: "",
      teacherId: "",
      startAt: "",
      durationMinutes: 60,
      meetUrl: "",
      status: "scheduled",
      notes: "",
    });
    setOpen(true);
  }

  function openEdit(session) {
    setMode("edit");
    setActiveId(session._id || session.id);
    setForm({
      title: session.title || "",
      courseId: session.courseId?._id || session.courseId || "",
      teacherId: session.teacherId?._id || session.teacherId || "",
      startAt: session.startAt ? toLocalInputValue(session.startAt) : "",
      durationMinutes: session.durationMinutes || 60,
      meetUrl: session.meetUrl || "",
      status: session.status || "scheduled",
      notes: session.notes || "",
    });
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // validation بسيط
    if (!form.title.trim()) return setErr("اكتب اسم الجلسة.");
    if (!form.courseId.trim()) return setErr("اختر/اكتب courseId (حالياً ID).");
    if (!form.teacherId.trim())
      return setErr("اختر/اكتب teacherId (حالياً ID).");
    if (!form.startAt) return setErr("حدد التاريخ والوقت.");
    if (!form.durationMinutes || Number(form.durationMinutes) < 10)
      return setErr("المدة غير صحيحة.");

    const payload = {
      title: form.title.trim(),
      courseId: form.courseId.trim(),
      teacherId: form.teacherId.trim(),
      startAt: new Date(form.startAt).toISOString(),
      durationMinutes: Number(form.durationMinutes),
      meetUrl: form.meetUrl.trim(),
      status: form.status,
      notes: form.notes.trim(),
    };

    try {
      if (mode === "create") {
        await createSession(payload);
      } else {
        await updateSession(activeId, payload);
      }
      setOpen(false);
      await load();
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
      await load();
    } catch (e) {
      setErr(e.message || "فشل حذف الجلسة");
    }
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback بسيط
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  return (
    <AdminLayout>
      <div className="cs-wrap" dir="rtl">
        <div className="cs-header">
          <div>
            <h2 className="cs-title">إدارة جلسات الفصول</h2>
            <p className="cs-subtitle">
              أنشئ الجلسات، حدّث الروابط، وتابع الحالة بسهولة.
            </p>
          </div>

          <div className="cs-actions">
            <button
              className="btn btn--ghost"
              onClick={load}
              disabled={loading}
            >
              تحديث
            </button>
            <button className="btn btn--primary" onClick={openCreate}>
              + إضافة جلسة
            </button>
          </div>
        </div>

        {/* Stats */}
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

        {/* Filters */}
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
              onClick={load}
              disabled={loading}
            >
              تطبيق / تحديث النتائج
            </button>
          </div>
        </div>

        {err ? <div className="cs-alert">{err}</div> : null}

        {/* Table */}
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
                    s.courseId?.name || s.courseId?.title || s.courseId || "—";
                  const teacherName =
                    s.teacherId?.name ||
                    s.teacherId?.fullName ||
                    s.teacherId?.email ||
                    s.teacherId ||
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
                    املأ البيانات الأساسية للجلسة.
                  </div>
                </div>
                <button
                  className="iconBtn"
                  onClick={closeModal}
                  aria-label="close"
                >
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
                    <label>courseId (حالياً ID)</label>
                    <input
                      value={form.courseId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, courseId: e.target.value }))
                      }
                      placeholder="ضع Course ID"
                    />
                  </div>

                  <div className="field">
                    <label>teacherId (حالياً ID)</label>
                    <input
                      value={form.teacherId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, teacherId: e.target.value }))
                      }
                      placeholder="ضع Teacher ID"
                    />
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
                  <button type="submit" className="btn btn--primary">
                    {mode === "create" ? "حفظ الجلسة" : "تحديث الجلسة"}
                  </button>
                </div>

                <div className="cs-hint">
                  ملاحظة: حالياً courseId و teacherId تُكتب كـ ID. بعد قليل
                  بنربطها بقائمة كورسات/معلّمين (Dropdown).
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
}
