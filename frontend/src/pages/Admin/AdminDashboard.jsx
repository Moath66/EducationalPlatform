import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchAdminStats } from "../../../api/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await fetchAdminStats();
        setStats(data);
      } catch (e) {
        setErr(e.message || "فشل تحميل إحصائيات لوحة المشرف");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = [
    {
      label: "عدد الطلاب",
      value: stats?.studentsCount ?? "—",
      badge: "طلاب مسجلين",
    },
    {
      label: "عدد المعلمين",
      value: stats?.teachersCount ?? "—",
      badge: "معلمين مسجلين",
    },
    {
      label: "عدد الجلسات",
      value: stats?.sessionsCount ?? "—",
      badge: "إجمالي الجلسات",
    },
    {
      label: "عدد الكورسات",
      value: stats?.coursesCount ?? "—",
      badge: "كورسات متاحة",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        {/* العنوان */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            لوحة تحكم المشرف
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            نظرة عامة سريعة على حالة المنصة التعليمية.
          </p>
        </div>

        {/* Errors */}
        {err ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            {err}
          </div>
        ) : null}

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.badge}</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700">
                  {loading ? "…" : "i"}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-2xl font-bold text-slate-800">
                  {loading ? "..." : item.value}
                </div>
                <div className="text-sm text-slate-600 mt-1">{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
