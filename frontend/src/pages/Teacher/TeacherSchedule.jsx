// frontend/src/pages/Teacher/TeacherSchedule.jsx
import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient";

export default function TeacherSchedule() {
  const [user, setUser] = useState(null);

  // ✅ صفحة المعلم للجداول فقط
  const TYPE = "schedule";

  const [grade, setGrade] = useState(""); // فلتر اختياري يدوي
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser || null);

    // ❌ لا تسوي setGrade تلقائيًا للمعلم
    // لأن هذا ممكن يقيّد النتائج بدون قصد
  }, []);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("type", TYPE);

    const g = String(grade || "").trim();
    if (g) params.set("grade", g); // اختياري فقط

    return params.toString();
  }, [grade]);

  const fetchFiles = async () => {
    try {
      setError("");
      setLoading(true);

      const res = await apiClient.get(`/api/study-files?${queryString}`);
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err.response?.data || err);
      setError("❌ فشل في تحميل الجداول. تأكد من الصلاحيات أو الـ API.");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, queryString]);

  const openFile = (url) => {
    if (!url) return;
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
            🗓️ الجداول الدراسية
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            هنا تشوف الجداول اللي رفعتها الإدارة وتفتحها مباشرة.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/teacher")}
          className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
        >
          ← رجوع
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">
              الصف / المرحلة (اختياري)
            </label>
            <input
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="اتركه فاضي لعرض كل الجداول المتاحة للمعلم"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={fetchFiles}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-900"
            >
              🔄 تحديث
            </button>

            <button
              onClick={() => setGrade("")}
              className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
              title="مسح فلتر الصف"
            >
              مسح
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-gray-600">🔄 جاري تحميل الجداول...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : files.length === 0 ? (
          <p className="text-gray-600">
            لا توجد جداول متاحة حسب الفلاتر الحالية.
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
                      النوع: جدول {f.grade ? `— الصف: ${f.grade}` : "— عام"}
                    </p>
                    {f.fileName ? (
                      <p className="text-xs text-gray-400 mt-1">
                        الملف: {f.fileName}
                      </p>
                    ) : null}
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
                    فتح
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
