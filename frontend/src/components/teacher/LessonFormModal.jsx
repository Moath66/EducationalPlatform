// frontend/src/components/teacher/LessonFormModal.jsx
import { useEffect, useState } from "react";

import { fetchCourses } from "../../../api/coursesApi";
import { createLesson, updateLesson } from "../../../api/lessonApi";

export default function LessonFormModal({
  open,
  onClose,
  onSuccess,
  initialData,
}) {
  const isEdit = Boolean(initialData?._id);

  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [courses, setCourses] = useState([]);

  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    // تعبئة وقت التعديل
    setCourseId(initialData?.courseId?._id || initialData?.courseId || "");
    setTitle(initialData?.title || "");
    setContent(initialData?.content || "");
    setVideoUrl(initialData?.videoUrl || "");
    setError("");

    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const res = await fetchCourses();
      const list = res?.courses || res?.payload || res || [];
      const arr = Array.isArray(list) ? list : [];
      setCourses(arr);
      setCourseId((prev) => prev || (arr?.[0]?._id ? String(arr[0]._id) : ""));
    } catch (e) {
      setError(e?.message || "فشل تحميل الكورسات");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!courseId) throw new Error("اختر الكورس");
      if (!title.trim()) throw new Error("عنوان الدرس مطلوب");

      const payload = {
        courseId,
        title: title.trim(),
        content,
        videoUrl: videoUrl.trim(),
      };

      if (isEdit) {
        await updateLesson(initialData._id, payload);
      } else {
        await createLesson(payload);
      }

      onSuccess?.();
    } catch (e2) {
      setError(e2?.message || "فشل الحفظ");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-lg p-4 md:p-5" dir="rtl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">
            {isEdit ? "تعديل درس" : "إضافة درس"}
          </h2>

          <button
            onClick={() => !loading && onClose?.()}
            className="text-gray-500 hover:text-gray-800"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error ? (
          <div className="mb-3 p-3 rounded bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">الكورس</div>
            {coursesLoading ? (
              <div className="text-sm text-gray-600">
                جاري تحميل الكورسات...
              </div>
            ) : (
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-white"
                disabled={loading}
              >
                <option value="">اختر كورس</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              العنوان
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="مثال: الدرس الأول"
              disabled={loading}
            />
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              المحتوى
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm min-h-[110px]"
              placeholder="شرح الدرس..."
              disabled={loading}
            />
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              رابط الفيديو (YouTube) اختياري
            </div>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              placeholder="https://youtube.com/..."
              dir="ltr"
              disabled={loading}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => !loading && onClose?.()}
              className="px-3 py-2 rounded bg-gray-100 text-gray-900 text-sm"
              disabled={loading}
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-600 text-white text-sm"
              disabled={loading}
            >
              {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديل" : "إضافة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
