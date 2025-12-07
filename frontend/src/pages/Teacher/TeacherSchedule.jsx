// frontend/src/pages/Teacher/TeacherSchedule.jsx
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient"; // ✅ عدّل المسار لو مختلف عندك

export default function TeacherSchedule() {
  const [user, setUser] = useState(null);

  const [type, setType] = useState("schedule"); // schedule | plan
  const [grade, setGrade] = useState(""); // فلتر
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);

    // لو عندك grade محفوظ للمدرس أو المرحلة اللي يدرسها:
    // إذا ما عندك، خليه فاضي والفلتر يدوي
    if (savedUser?.grade) setGrade(savedUser.grade);
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (grade) params.set("grade", grade);
    return params.toString();
  }, [type, grade]);

  const fetchFiles = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await apiClient.get(`/api/study-files?${queryString}`);
      setFiles(res.data || []);
    } catch (err) {
      console.log(err);
      setError("❌ فشل في تحميل الملفات. تأكد من الصلاحيات/API.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // لا تطلب لو ما فيه user (عشان token)
    if (!user) return;
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, queryString]);

  const openFile = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const isPDF = (mime, url) => {
    if (mime?.includes("pdf")) return true;
    return (url || "").toLowerCase().includes(".pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            📄 الجدول والخطة الدراسية
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            هنا تشوف الملفات اللي رفعتها الإدارة (جداول/خطط) وتفتحها مباشرة.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => (window.location.href = "/teacher")}
            className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
          >
            ← رجوع
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              نوع الملف
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="schedule">📅 الجداول الدراسية</option>
              <option value="plan">📘 الخطط الدراسية</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              الصف / المرحلة (اختياري)
            </label>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="مثال: Grade 10 أو 10"
            />
          </div>

          <div className="flex items-end gap-2 justify-end">
            <button
              onClick={fetchFiles}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
            >
              🔄 تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-gray-600">🔄 جاري تحميل الملفات...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : files.length === 0 ? (
          <p className="text-gray-600">
            لا توجد ملفات متاحة حسب الفلاتر الحالية.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((f) => (
              <div
                key={f._id}
                className="border rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {f.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      النوع: {f.type === "plan" ? "خطة" : "جدول"}{" "}
                      {f.grade ? `— الصف: ${f.grade}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {f.fileName ? `الملف: ${f.fileName}` : ""}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {isPDF(f.fileType, f.fileUrl) ? "PDF" : "IMAGE"}
                  </span>
                </div>

                {/* Preview (صورة فقط) */}
                {!isPDF(f.fileType, f.fileUrl) && f.fileUrl && (
                  <img
                    src={f.fileUrl}
                    alt={f.title}
                    className="w-full max-h-64 object-contain rounded-lg bg-gray-50 border"
                    loading="lazy"
                  />
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => openFile(f.fileUrl)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
                  >
                    فتح الملف
                  </button>
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                  >
                    تحميل / عرض
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
