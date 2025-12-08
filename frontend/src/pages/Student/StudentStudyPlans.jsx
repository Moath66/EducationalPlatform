import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient"; // src/api/apiClient.js

export default function StudentStudyPlans() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser || null);
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);

      // ✅ نطلب الخطط فقط، ولا نرسل grade من الفرونت
      const res = await apiClient.get("/api/study-files", {
        params: { type: "plan" },
      });

      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err.response?.data || err);
      alert(err.response?.data?.message || "❌ تعذر تحميل الخطط الدراسية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return; // مهم عشان التوكن يكون موجود
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedSearch) return files;

    return files.filter((f) => {
      const t = String(f.title || "").toLowerCase();
      const d = String(f.description || "").toLowerCase();
      const g = String(f.grade || "").toLowerCase();
      const fn = String(f.fileName || "").toLowerCase();
      return (
        t.includes(normalizedSearch) ||
        d.includes(normalizedSearch) ||
        g.includes(normalizedSearch) ||
        fn.includes(normalizedSearch)
      );
    });
  }, [files, normalizedSearch]);

  // ✅ رابط البروكسي (يحل مشاكل فتح PDF/401/CORS)
  const fileProxyUrl = (f) =>
    `${apiClient.defaults.baseURL}/api/study-files/${f._id}/download`;

  const fileProxyDownloadUrl = (f) =>
    `${apiClient.defaults.baseURL}/api/study-files/${f._id}/download?dl=1`;

  const openFile = (f) => {
    window.open(fileProxyUrl(f), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">الخطة الدراسية 📚</h1>
          <p className="text-sm text-gray-600 mt-1">
            هنا تجد ملفات الخطة الدراسية الخاصة بصفّك (وأيضاً الملفات العامة).
          </p>

          {user?.grade ? (
            <p className="text-xs text-gray-500 mt-1">
              يتم عرض ملفات الصف:{" "}
              <span className="font-semibold">{user.grade}</span>
            </p>
          ) : null}
        </div>

        <button
          onClick={() => (window.location.href = "/student")}
          className="px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-sm"
        >
          ⬅ الرجوع للوحة الطالب
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300"
            placeholder="ابحث بعنوان الملف أو الوصف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={fetchPlans}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
          >
            🔄 تحديث
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white p-5 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">الملفات المتاحة</h2>
          <span className="text-sm text-gray-500">({filtered.length})</span>
        </div>

        {loading ? (
          <p className="text-gray-600">🔄 جاري التحميل...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">لا توجد ملفات مطابقة حالياً.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => (
              <div
                key={f._id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-gray-800">{f.title}</p>
                  {f.description ? (
                    <p className="text-sm text-gray-600 mt-1">
                      {f.description}
                    </p>
                  ) : null}

                  <div className="text-sm text-gray-600 mt-2 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      الصف: {f.grade ?? "عام"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      {f.fileType || "file"}
                    </span>
                    {f.fileName ? (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100">
                        {f.fileName}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => openFile(f)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    فتح
                  </button>

                  <a
                    href={fileProxyDownloadUrl(f)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
                  >
                    تحميل
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        * يتم جلب الملفات من السيرفر حسب صلاحيات المستخدم.
      </p>
    </div>
  );
}
