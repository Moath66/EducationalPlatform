import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";

import {
  createCourse,
  deleteCourse,
  fetchCourses,
  updateCourse,
  updateCourseStudents,
} from "../../../api/coursesApi";

import { fetchTeachers, fetchStudents } from "../../../api/usersApi";

function normalizeList(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.courses)) return data.courses;
  if (Array.isArray(data.users)) return data.users;
  if (Array.isArray(data.students)) return data.students;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [q, setQ] = useState("");
  const [active, setActive] = useState("all"); // all | true | false
  const [teacherFilter, setTeacherFilter] = useState("all");

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeId, setActiveId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    teacherId: "",
    isActive: true,
    studentIds: [],
  });

  async function loadMeta() {
    setLoadingMeta(true);
    setErr("");
    try {
      const [tData, sData] = await Promise.all([
        fetchTeachers(),
        fetchStudents(),
      ]);
      setTeachers(normalizeList(tData));
      setStudents(normalizeList(sData));
    } catch (e) {
      setErr(e?.message || "فشل تحميل المعلمين/الطلاب");
    } finally {
      setLoadingMeta(false);
    }
  }

  async function loadCourses() {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (q.trim()) params.q = q.trim();
      if (active !== "all") params.isActive = active;
      if (teacherFilter !== "all") params.teacherId = teacherFilter;

      const data = await fetchCourses(params);
      setCourses(normalizeList(data));
    } catch (e) {
      setErr(e?.message || "فشل تحميل الكورسات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMeta();
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return courses;

    return courses.filter((c) => {
      const title = (c.title || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      const teacherName = (
        c.teacherId?.name ||
        c.teacherId?.email ||
        ""
      ).toLowerCase();
      return (
        title.includes(needle) ||
        desc.includes(needle) ||
        teacherName.includes(needle)
      );
    });
  }, [courses, q]);

  function resetForm() {
    setForm({
      title: "",
      description: "",
      teacherId: "",
      isActive: true,
      studentIds: [],
    });
  }

  async function openCreate() {
    setMode("create");
    setActiveId(null);
    resetForm();
    setOpen(true);
    if (!teachers.length || !students.length) await loadMeta();
  }

  async function openEdit(course) {
    setMode("edit");
    setActiveId(course._id || course.id);

    const teacherId = course.teacherId?._id || course.teacherId || "";
    const studentIds = Array.isArray(course.students)
      ? course.students
          .map((s) => (typeof s === "string" ? s : s?._id || s?.id))
          .filter(Boolean)
      : [];

    setForm({
      title: course.title || "",
      description: course.description || "",
      teacherId,
      isActive: course.isActive !== false,
      studentIds,
    });

    setOpen(true);
    if (!teachers.length || !students.length) await loadMeta();
  }

  function closeModal() {
    setOpen(false);
  }

  function toggleStudent(id) {
    setForm((p) => {
      const set = new Set(p.studentIds);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, studentIds: Array.from(set) };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!form.title.trim()) return setErr("اكتب اسم الكورس.");
    if (!form.teacherId) return setErr("اختر معلم للكورس.");

    try {
      if (mode === "create") {
        const payload = {
          title: form.title.trim(),
          description: (form.description || "").trim(),
          teacherId: form.teacherId,
          isActive: !!form.isActive,
          students: form.studentIds, // createCourse يدعم students عندك
        };
        await createCourse(payload);
      } else {
        const payload = {
          title: form.title.trim(),
          description: (form.description || "").trim(),
          teacherId: form.teacherId,
          isActive: !!form.isActive,
        };
        await updateCourse(activeId, payload);

        // تحديث الطلاب عبر endpoint المخصص
        await updateCourseStudents(activeId, form.studentIds);
      }

      setOpen(false);
      await loadCourses();
    } catch (e2) {
      setErr(e2?.message || "فشل حفظ الكورس");
    }
  }

  async function onDelete(course) {
    const id = course._id || course.id;
    const ok = confirm("هل أنت متأكد من حذف الكورس؟");
    if (!ok) return;

    try {
      await deleteCourse(id);
      await loadCourses();
    } catch (e) {
      setErr(e?.message || "فشل حذف الكورس");
    }
  }

  async function quickToggleActive(course) {
    const id = course._id || course.id;
    try {
      await updateCourse(id, { isActive: !(course.isActive !== false) });
      await loadCourses();
    } catch (e) {
      setErr(e?.message || "فشل تحديث حالة الكورس");
    }
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              إدارة الكورسات
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              أنشئ كورس، اربط المعلم والطلاب، وفعّل/أوقف الكورس.
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={loadCourses}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
              disabled={loading}
            >
              تحديث
            </button>
            <button
              onClick={openCreate}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + إضافة كورس
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-sm text-slate-600 block mb-1">بحث</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="اسم الكورس / وصف / معلم..."
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600 block mb-1">
                الحالة
              </label>
              <select
                value={active}
                onChange={(e) => setActive(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-white"
              >
                <option value="all">الكل</option>
                <option value="true">مفعّل</option>
                <option value="false">غير مفعّل</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-600 block mb-1">
                المعلم
              </label>
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 bg-white"
                disabled={loadingMeta}
              >
                <option value="all">الكل</option>
                {teachers.map((t) => {
                  const id = t._id || t.id;
                  const name = t.name || t.email || "Teacher";
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex items-end gap-2 justify-end">
              <button
                onClick={loadCourses}
                className="w-full md:w-auto px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
                disabled={loading}
              >
                تطبيق
              </button>
            </div>
          </div>
        </div>

        {err ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
            {err}
          </div>
        ) : null}

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="font-semibold text-slate-800">قائمة الكورسات</div>
            <div className="text-sm text-slate-500">
              {loading ? "جاري التحميل..." : `عدد النتائج: ${filtered.length}`}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="p-3">الكورس</th>
                  <th className="p-3">المعلم</th>
                  <th className="p-3">الطلاب</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>

              <tbody className="text-sm">
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      لا توجد كورسات حالياً.
                    </td>
                  </tr>
                ) : null}

                {filtered.map((c) => {
                  const id = c._id || c.id;
                  const teacherName =
                    c.teacherId?.name || c.teacherId?.email || "—";
                  const studentsCount = Array.isArray(c.students)
                    ? c.students.length
                    : 0;
                  const isActive = c.isActive !== false;

                  return (
                    <tr key={id} className="border-t">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">
                          {c.title}
                        </div>
                        {c.description ? (
                          <div className="text-slate-500 mt-1">
                            {c.description}
                          </div>
                        ) : null}
                      </td>

                      <td className="p-3">{teacherName}</td>

                      <td className="p-3">{studentsCount}</td>

                      <td className="p-3">
                        <span
                          className={
                            "inline-flex items-center px-2 py-1 rounded-full text-xs border " +
                            (isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-600 border-slate-200")
                          }
                        >
                          {isActive ? "مفعّل" : "غير مفعّل"}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="flex gap-2 justify-end flex-wrap">
                          <button
                            onClick={() => openEdit(c)}
                            className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50"
                          >
                            تعديل
                          </button>

                          <button
                            onClick={() => quickToggleActive(c)}
                            className="px-3 py-2 rounded-lg border bg-white hover:bg-slate-50"
                          >
                            {isActive ? "إيقاف" : "تفعيل"}
                          </button>

                          <button
                            onClick={() => onDelete(c)}
                            className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
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
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-3 z-50"
            onMouseDown={closeModal}
          >
            <div
              className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden"
              onMouseDown={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-start justify-between px-5 py-4 border-b">
                <div>
                  <div className="text-lg font-bold text-slate-800">
                    {mode === "create" ? "إضافة كورس" : "تعديل كورس"}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    اختر المعلم، واربط الطلاب (اختياري).
                  </div>
                </div>
                <button
                  className="w-10 h-10 rounded-full border bg-white hover:bg-slate-50"
                  onClick={closeModal}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600 block mb-1">
                      اسم الكورس
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, title: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="مثال: رياضيات 101"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-slate-600 block mb-1">
                      المعلم
                    </label>
                    <select
                      value={form.teacherId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, teacherId: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2 bg-white"
                      disabled={loadingMeta}
                    >
                      <option value="">اختر معلم...</option>
                      {teachers.map((t) => {
                        const id = t._id || t.id;
                        const name = t.name || t.email || "Teacher";
                        return (
                          <option key={id} value={id}>
                            {name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-slate-600 block mb-1">
                      الوصف (اختياري)
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, description: e.target.value }))
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="وصف مختصر للكورس..."
                    />
                  </div>

                  <div className="flex items-center gap-2 md:col-span-2">
                    <input
                      id="isActive"
                      type="checkbox"
                      checked={!!form.isActive}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, isActive: e.target.checked }))
                      }
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm text-slate-700"
                    >
                      الكورس مفعّل
                    </label>
                  </div>
                </div>

                {/* Students multi-select */}
                <div className="border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-slate-800">
                      ربط الطلاب (اختياري)
                    </div>
                    <div className="text-sm text-slate-500">
                      المحدد: {form.studentIds.length}
                    </div>
                  </div>

                  {loadingMeta ? (
                    <div className="text-slate-500">جاري تحميل الطلاب...</div>
                  ) : students.length === 0 ? (
                    <div className="text-slate-600">لا يوجد طلاب حالياً.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto pr-1">
                      {students.map((st) => {
                        const id = st._id || st.id;
                        const checked = form.studentIds.includes(id);
                        return (
                          <button
                            type="button"
                            key={id}
                            onClick={() => toggleStudent(id)}
                            className={
                              "text-right border rounded-lg px-3 py-2 flex items-center justify-between hover:bg-slate-50 " +
                              (checked
                                ? "bg-emerald-50 border-emerald-200"
                                : "bg-white")
                            }
                          >
                            <span className="text-slate-800">
                              {st.name || st.email || "Student"}
                              {st.grade ? (
                                <span className="text-slate-500 text-xs">
                                  {" "}
                                  — {st.grade}
                                </span>
                              ) : null}
                            </span>
                            <span className="text-xs text-slate-500">
                              {checked ? "✓" : ""}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {err ? (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg">
                    {err}
                  </div>
                ) : null}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={loadingMeta}
                  >
                    {mode === "create" ? "حفظ الكورس" : "تحديث الكورس"}
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
