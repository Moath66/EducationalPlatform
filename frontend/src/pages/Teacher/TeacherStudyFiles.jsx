import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient";

export default function TeacherStudyPlans() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const TYPE = "plan"; // ✅ ثابت: خطة فقط
  const [search, setSearch] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "https://educationalplatform-zwvt.onrender.com";

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get("/api/study-files", {
        params: { type: TYPE },
        // ✅ لا ترسل grade من الفرونت — السيرفر يطبق role + grade + audience
      });

      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err.response?.data || err);
      alert(err.response?.data?.message || "❌ فشل في تحميل الخطط الدراسية");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ لا تعتمد على user من localStorage (مو ضروري)
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ✅ Redirect العام من الباك اند (بدون axios/blob وبدون baseURL undefined)
  const fileRedirectUrl = (f, forceDownload = false) =>
    `${API_BASE}/api/study-files/${f._id}/download${
      forceDownload ? "?dl=1" : ""
    }`;

  return (
    <div className="p-6 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">📘 الخطط الدراسية</h1>
          <p className="text-slate-500 text-sm mt-1">
            هنا تشوف الخطط الدراسية المرفوعة من الإدارة — حسب صلاحيتك.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/teacher")}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition"
        >
          ← رجوع
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="flex-1">
          <label className="text-sm text-slate-600">بحث</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالعنوان أو الوصف أو اسم الملف..."
            className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        <button
          onClick={fetchFiles}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          تحديث
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <div className="py-10 text-center text-slate-500">
            🔄 جاري تحميل الخطط...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-slate-500">
            لا يوجد خطط مرفوعة حالياً.
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
                    الصف: {f.grade || "عام"} • النوع: خطة •{" "}
                    {f.fileType || "unknown"}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <a
                    href={fileRedirectUrl(f, false)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    فتح
                  </a>

                  <a
                    href={fileRedirectUrl(f, true)}
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
