import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient"; // لو ملفك هنا src/api/apiClient.js

export default function StudentStudyPlans() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [typeFilter, setTypeFilter] = useState("all"); // all | plan | schedule
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser || null);
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      // نجيب كل الملفات، ثم نفلتر بالواجهة حسب grade (لو موجود)
      const res = await apiClient.get("/api/study-files");
      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
      alert("❌ تعذر تحميل الخطط والجداول");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const userGrade = user?.grade || null;

  const filtered = useMemo(() => {
    return files.filter((f) => {
      const matchesType = typeFilter === "all" ? true : f.type === typeFilter;

      const matchesSearch =
        !normalizedSearch ||
        f.title?.toLowerCase().includes(normalizedSearch) ||
        f.fileName?.toLowerCase().includes(normalizedSearch);

      // لو الطالب له grade: نعرض اللي grade حقها نفس grade أو grade = null (عام)
      const matchesGrade = !userGrade
        ? true
        : f.grade == null || String(f.grade) === String(userGrade);

      return matchesType && matchesSearch && matchesGrade;
    });
  }, [files, typeFilter, normalizedSearch, userGrade]);

  const openFile = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold">الخطط والجداول الدراسية 📚</h1>
          <p className="text-sm text-gray-600 mt-1">
            هنا تجد خطة الدراسة والجداول الخاصة بصفّك (وأيضاً الملفات العامة).
          </p>
          {userGrade && (
            <p className="text-xs text-gray-500 mt-1">
              يتم عرض ملفات الصف:{" "}
              <span className="font-semibold">{userGrade}</span>
            </p>
          )}
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
            placeholder="ابحث بعنوان الملف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-lg px-3 py-2 text-sm bg-white"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">كل الأنواع</option>
            <option value="plan">الخطة الدراسية</option>
            <option value="schedule">الجدول الدراسي</option>
          </select>

          <button
            onClick={fetchFiles}
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
                  <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      النوع: {f.type === "plan" ? "خطة" : "جدول"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      الصف: {f.grade ?? "عام"}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100">
                      {f.fileType || "file"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => openFile(f.fileUrl)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                  >
                    فتح
                  </button>

                  <a
                    href={f.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200"
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
