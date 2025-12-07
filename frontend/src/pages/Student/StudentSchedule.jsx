import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient";

export default function StudentSchedule() {
  const [user, setUser] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser || null);
  }, []);

  const fetchSchedules = async (grade) => {
    try {
      setLoading(true);

      // student يشوف ملفات نوع schedule حسب صفه
      // لاحظ: هذا يتطلب أن GET /api/study-files يكون متاح للطالب (protect فقط أو public)
      const res = await apiClient.get("/api/study-files", {
        params: { type: "schedule", grade: grade || undefined },
      });

      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في تحميل الجداول الدراسية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // grade من بيانات الطالب
    if (user) fetchSchedules(user.grade);
    // إذا user لسه null ما نسوي طلب
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedSearch) return files;
    return files.filter((f) => {
      const t = (f.title || "").toLowerCase();
      const d = (f.description || "").toLowerCase();
      const g = (f.grade || "").toLowerCase();
      return (
        t.includes(normalizedSearch) ||
        d.includes(normalizedSearch) ||
        g.includes(normalizedSearch)
      );
    });
  }, [files, normalizedSearch]);

  return (
    <div className="p-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🗓️ الجدول الدراسي</h1>
          <p className="text-slate-500 text-sm mt-1">
            هنا تلاقي جداول الدوام/الحصص المرفوعة من الإدارة — حسب صفّك.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/student")}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition"
        >
          ← رجوع
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <label className="text-sm text-slate-600">بحث</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان أو الوصف..."
            className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <div className="min-w-[180px]">
          <label className="text-sm text-slate-600">صفّك</label>
          <div className="mt-1 w-full border rounded-lg px-3 py-2 bg-slate-50 text-slate-700">
            {user?.grade || "غير محدد"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div className="py-10 text-center text-slate-500">
            🔄 جاري تحميل الجداول...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            لا يوجد جداول مرفوعة لهذا الصف حالياً.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((f) => (
              <div
                key={f._id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-bold text-slate-800">{f.title}</p>
                  {f.description ? (
                    <p className="text-slate-600 text-sm mt-1">
                      {f.description}
                    </p>
                  ) : null}
                  <div className="text-xs text-slate-500 mt-2">
                    الصف: {f.grade || "غير محدد"} • النوع: جدول
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    فتح
                  </a>

                  <a
                    href={f.fileUrl}
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
    </div>
  );
}
