// frontend/src/pages/Teacher/TeacherStudents.jsx
import { useEffect, useMemo, useState } from "react";
import { fetchCourses } from "../../../api/coursesApi";
import { fetchCourseStudents } from "../../../api/coursesApi";

function normalizeCourses(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.courses)) return data.courses;
  return [];
}

export default function TeacherStudents() {
  const [teacher, setTeacher] = useState(null);

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [students, setStudents] = useState([]);
  const [q, setQ] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [err, setErr] = useState("");

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    setTeacher(u);
  }, []);

  async function loadMyCourses() {
    setErr("");
    setLoadingCourses(true);
    try {
      const data = await fetchCourses();
      const all = normalizeCourses(data);

      const mine = all.filter((c) => {
        const tid = c.teacherId?._id || c.teacherId;
        return String(tid) === String(teacher?._id);
      });

      setCourses(mine);

      // auto-select first course
      const firstId = mine?.[0]?._id || mine?.[0]?.id || "";
      setSelectedCourseId((prev) => prev || firstId);
    } catch (e) {
      setErr(e.message || "فشل تحميل كورسات المعلم");
      setCourses([]);
      setSelectedCourseId("");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function loadStudents(courseId) {
    if (!courseId) {
      setStudents([]);
      return;
    }

    setErr("");
    setLoadingStudents(true);
    try {
      const data = await fetchCourseStudents(courseId); // { courseId, students: [...] }
      setStudents(Array.isArray(data.students) ? data.students : []);
    } catch (e) {
      setErr(e.message || "فشل تحميل طلاب الكورس");
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }

  useEffect(() => {
    if (teacher?._id) loadMyCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher]);

  useEffect(() => {
    if (selectedCourseId) loadStudents(selectedCourseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId]);

  const selectedCourse = useMemo(() => {
    return courses.find(
      (c) => String(c._id || c.id) === String(selectedCourseId)
    );
  }, [courses, selectedCourseId]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students;

    return students.filter((s) => {
      const name = (s.name || "").toLowerCase();
      const email = (s.email || "").toLowerCase();
      const phone = (s.phone || "").toLowerCase();
      const grade = (s.grade || "").toLowerCase();
      return (
        name.includes(needle) ||
        email.includes(needle) ||
        phone.includes(needle) ||
        grade.includes(needle)
      );
    });
  }, [students, q]);

  return (
    <div className="p-6 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">قائمة الطلاب</h1>
          <p className="text-slate-500 text-sm">
            أهلاً {teacher?.name || "المعلم"} — اختر كورس لعرض طلابه.
          </p>
        </div>

        <button
          onClick={() => teacher?._id && loadMyCourses()}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
          disabled={loadingCourses}
        >
          تحديث
        </button>
      </div>

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
          {err}
        </div>
      ) : null}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-slate-600 block mb-1">الكورس</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none"
            disabled={loadingCourses}
          >
            <option value="">اختر كورس...</option>
            {courses.map((c) => {
              const id = c._id || c.id;
              const title = c.title || c.name || "Course";
              return (
                <option key={id} value={id}>
                  {title}
                </option>
              );
            })}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-slate-600 block mb-1">بحث</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث بالاسم / البريد / الجوال / الصف..."
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
          />
        </div>

        <div className="md:col-span-3 text-sm text-slate-600">
          {loadingStudents
            ? "جاري تحميل الطلاب..."
            : selectedCourseId
            ? `الكورس: ${
                selectedCourse?.title || selectedCourse?.name || "—"
              } • عدد الطلاب: ${filtered.length}`
            : "اختر كورس لعرض الطلاب"}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">الطلاب</h2>
          <p className="text-xs text-slate-500 mt-1">
            هذه القائمة تُجلب من: GET /api/courses/:id/students
          </p>
        </div>

        <table className="w-full text-right">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">اسم الطالب</th>
              <th className="p-3">البريد</th>
              <th className="p-3">الجوال</th>
              <th className="p-3">الصف</th>
            </tr>
          </thead>

          <tbody>
            {!selectedCourseId ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  اختر كورس أولاً.
                </td>
              </tr>
            ) : loadingStudents ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-500">
                  لا يوجد طلاب في هذا الكورس.
                </td>
              </tr>
            ) : (
              filtered.map((st, idx) => (
                <tr key={st._id || st.id} className="border-b">
                  <td className="p-3">{idx + 1}</td>
                  <td className="p-3 font-semibold">{st.name || "—"}</td>
                  <td className="p-3">{st.email || "—"}</td>
                  <td className="p-3">{st.phone || "—"}</td>
                  <td className="p-3">{st.grade || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
