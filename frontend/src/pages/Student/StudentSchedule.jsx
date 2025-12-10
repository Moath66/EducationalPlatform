import { useEffect, useMemo, useState } from "react";
import apiClient from "../../../api/apiClient";

export default function StudentSchedule() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const API_BASE =
    import.meta.env.VITE_API_URL ||
    "https://educationalplatform-zwvt.onrender.com";

  const fetchSchedules = async () => {
    try {
      setLoading(true);

      // الطالب يطلب schedule فقط
      // الباك يطبق: audience in (all, student) + grade (null أو grade حق الطالب)
      const res = await apiClient.get("/api/study-files", {
        params: { type: "schedule" },
      });

      setFiles(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message || "❌ فشل في تحميل الجداول الدراسية";
      console.log(err.response?.data || err);

      // تحسين UX: لو غير مصرح/غير معتمد، رجعه للّوجن
      if (status === 401 || status === 403) {
        alert(msg);
        window.location.href = "/login";
        return;
      }

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
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

  // Redirect العام من الباك اند
  const fileRedirectUrl = (f, forceDownload = false) =>
    `${API_BASE}/api/study-files/${f._id}/download${
      forceDownload ? "?dl=1" : ""
    }`;

  const openFile = (f, forceDownload = false) => {
    if (!f?._id) return;
    window.open(
      fileRedirectUrl(f, forceDownload),
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">🗓️ الجدول الدراسي</h1>
          <p className="text-slate-500 text-sm mt-1">
            هنا تلاقي جداول الدوام/الحصص المرفوعة من الإدارة — حسب صفّك
            وصلاحياتك.
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/student")}
          className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition"
        >
          ← رجوع
        </button>
      </div>

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
          onClick={fetchSchedules}
          className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition"
        >
          🔄 تحديث
        </button>
      </div>

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
                    الصف: {f.grade || "عام"} • النوع: جدول •{" "}
                    {f.fileType || "unknown"}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => openFile(f, false)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    type="button"
                  >
                    فتح
                  </button>

                  <button
                    onClick={() => openFile(f, true)}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition"
                    type="button"
                  >
                    تحميل
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        * يتم جلب الملفات من السيرفر حسب صلاحيات المستخدم (audience + grade).
      </p>
    </div>
  );
}
