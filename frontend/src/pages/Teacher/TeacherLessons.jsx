// frontend/src/pages/Teacher/TeacherLessons.jsx
import { useEffect, useState } from "react";

import { fetchTeacherLessons, deleteLesson } from "../../../api/lessonApi";
import LessonFormModal from "../../components/teacher/LessonFormModal";

export default function TeacherLessons() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetchTeacherLessons();
      setLessons(res?.payload || []);
    } catch (e) {
      setError(e?.message || "فشل تحميل الدروس");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("هل أنت متأكد من حذف الدرس؟");
    if (!ok) return;

    setError("");
    setInfo("");
    try {
      await deleteLesson(id);
      setInfo("تم حذف الدرس بنجاح");
      await load();
    } catch (e) {
      setError(e?.message || "فشل حذف الدرس");
    }
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">إدارة الدروس</h1>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
            disabled={loading}
          >
            تحديث
          </button>

          <button
            onClick={() => {
              setEditingLesson(null);
              setOpenModal(true);
            }}
            className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
          >
            + إضافة درس
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      {info ? (
        <div className="mt-4 p-3 rounded bg-green-50 text-green-700 text-sm">
          {info}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-sm text-gray-600">جاري التحميل...</div>
      ) : lessons.length === 0 ? (
        <div className="mt-6 p-4 rounded bg-white border text-sm text-gray-700">
          لا يوجد دروس بعد.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {lessons.map((l) => (
            <div
              key={l._id}
              className="bg-white border rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{l.title}</div>

                  {l?.courseId?.title ? (
                    <div className="text-xs text-gray-500 mt-1">
                      الكورس: {l.courseId.title}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingLesson(l);
                      setOpenModal(true);
                    }}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => handleDelete(l._id)}
                    className="px-3 py-1.5 rounded bg-red-600 text-white text-xs"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {l?.content ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {l.content}
                </p>
              ) : null}

              {l?.videoUrl ? (
                <a
                  href={l.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline text-sm"
                >
                  فتح رابط الفيديو
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* ✅ Modal إضافة / تعديل */}
      <LessonFormModal
        open={openModal}
        initialData={editingLesson}
        onClose={() => {
          setOpenModal(false);
          setEditingLesson(null);
        }}
        onSuccess={() => {
          setOpenModal(false);
          setEditingLesson(null);
          load();
        }}
      />
    </div>
  );
}
