// frontend/src/components/teacher/AssignmentFormModal.jsx
import { useEffect, useState } from "react";

import apiClient from "../../../api/apiClient";
import { fetchCourses } from "../../../api/coursesApi";
import { createAssignment, updateAssignment } from "../../../api/assignmentApi";

export default function AssignmentFormModal({
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
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(""); // input datetime-local string
  const [fileUrl, setFileUrl] = useState("");

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    // تعبئة الداتا وقت التعديل
    setCourseId(initialData?.courseId?._id || initialData?.courseId || "");
    setTitle(initialData?.title || "");
    setDescription(initialData?.description || "");
    setFileUrl(initialData?.fileUrl || "");
    setFile(null);
    setProgress(0);
    setError("");

    // dueDate -> datetime-local
    if (initialData?.dueDate) {
      const dt = new Date(initialData.dueDate);
      if (!Number.isNaN(dt.getTime())) {
        const pad = (n) => String(n).padStart(2, "0");
        const local = `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
          dt.getDate()
        )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
        setDueDate(local);
      } else {
        setDueDate("");
      }
    } else {
      setDueDate("");
    }

    // تحميل كورسات المعلم (نفترض الباك يرجع كورسات حسب role/teacher)
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      // لو عندك فلترة جاهزة بالباك للمعلم ممتاز، وإذا لا بيرجع الكل
      const res = await fetchCourses();
      const list = res?.courses || res?.payload || res || [];
      setCourses(Array.isArray(list) ? list : []);
      // لو ما فيه courseId اختر أول كورس
      setCourseId(
        (prev) => prev || (list?.[0]?._id ? String(list[0]._id) : "")
      );
    } catch (e) {
      setError(e?.message || "فشل تحميل الكورسات");
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await apiClient.post("/api/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      const url = res?.data?.fileUrl;
      if (!url) throw new Error("فشل رفع الملف");
      setFileUrl(url);
    } catch (e) {
      setError(e?.message || "فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!courseId) throw new Error("اختر الكورس");
      if (!title.trim()) throw new Error("عنوان الواجب مطلوب");

      // dueDate string -> Date
      const due = dueDate ? new Date(dueDate).toISOString() : null;

      const payload = {
        courseId,
        title: title.trim(),
        description,
        dueDate: due,
        fileUrl: fileUrl || "",
      };

      if (isEdit) {
        await updateAssignment(initialData._id, payload);
      } else {
        await createAssignment(payload);
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
            {isEdit ? "تعديل واجب" : "إضافة واجب"}
          </h2>

          <button
            onClick={() => !loading && !uploading && onClose?.()}
            className="text-gray-500 hover:text-gray-800"
            disabled={loading || uploading}
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
                disabled={loading || uploading}
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
              placeholder="مثال: واجب الأسبوع الأول"
              disabled={loading || uploading}
            />
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">الوصف</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm min-h-[90px]"
              placeholder="تفاصيل الواجب..."
              disabled={loading || uploading}
            />
          </div>

          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">
              آخر موعد (اختياري)
            </div>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm"
              disabled={loading || uploading}
            />
          </div>

          <div className="border rounded-xl p-3">
            <div className="text-sm font-medium text-gray-700">
              ملف الواجب (PDF) اختياري
            </div>

            <div className="mt-2 flex flex-col gap-2">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading || uploading}
                className="text-sm"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!file || loading || uploading}
                  className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
                >
                  {uploading ? "جاري الرفع..." : "رفع الملف"}
                </button>

                {fileUrl ? (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline text-sm"
                  >
                    عرض الملف الحالي
                  </a>
                ) : (
                  <span className="text-xs text-gray-500">
                    لا يوجد ملف مرفوع
                  </span>
                )}
              </div>

              {uploading ? (
                <div className="w-full">
                  <div className="h-2 rounded bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{progress}%</div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => !loading && !uploading && onClose?.()}
              className="px-3 py-2 rounded bg-gray-100 text-gray-900 text-sm"
              disabled={loading || uploading}
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-emerald-600 text-white text-sm"
              disabled={loading || uploading}
            >
              {loading ? "جاري الحفظ..." : isEdit ? "حفظ التعديل" : "إضافة"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
