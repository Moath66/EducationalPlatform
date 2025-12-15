// frontend/src/pages/Admin/AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { fetchAdminStats } from "../../../api/adminApi";
import { fetchSessions } from "../../../api/sessionsApi";
import apiClient from "../../../api/apiClient";

function toDayKey(d) {
  // YYYY-MM-DD
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatArDayLabel(dateKey) {
  // dateKey: YYYY-MM-DD
  const [y, m, d] = dateKey.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("ar", { weekday: "short", day: "numeric" });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Study files
  const [studyFiles, setStudyFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [filesErr, setFilesErr] = useState("");

  // ✅ Sessions chart
  const [chartSessions, setChartSessions] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartErr, setChartErr] = useState("");

  async function loadAll() {
    setErr("");
    setLoading(true);

    setFilesErr("");
    setFilesLoading(true);

    setChartErr("");
    setChartLoading(true);

    try {
      // 1) Stats
      const statsP = fetchAdminStats()
        .then((data) => setStats(data))
        .catch((e) => setErr(e?.message || "فشل تحميل إحصائيات لوحة المشرف"));

      // 2) Study files (آخر 5)
      const filesP = apiClient
        .get("/api/study-files") // يرجّع Array مرتّب createdAt desc
        .then((res) => {
          const arr = Array.isArray(res.data)
            ? res.data
            : res.data?.files || [];
          setStudyFiles(arr.slice(0, 5));
        })
        .catch((e) => {
          setStudyFiles([]);
          setFilesErr(e?.message || "فشل تحميل Study Files");
        })
        .finally(() => setFilesLoading(false));

      // 3) Sessions chart (آخر 7 أيام)
      const from = new Date();
      from.setDate(from.getDate() - 6); // 7 days including today
      from.setHours(0, 0, 0, 0);

      const sessionsP = fetchSessions({
        from: from.toISOString(),
        limit: 500,
        sort: "startAt",
      })
        .then((data) => {
          const list = Array.isArray(data) ? data : data?.sessions || [];
          setChartSessions(list);
        })
        .catch((e) => {
          setChartSessions([]);
          setChartErr(e?.message || "فشل تحميل الجلسات للرسم البياني");
        })
        .finally(() => setChartLoading(false));

      await Promise.all([statsP, filesP, sessionsP]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ✅ تجهيز بيانات الرسم (آخر 7 أيام)
  const chartData = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      days.push(toDayKey(d));
    }

    const counter = new Map(days.map((k) => [k, 0]));

    for (const s of chartSessions || []) {
      const dt = s?.startAt || s?.date || s?.createdAt;
      if (!dt) continue;
      const key = toDayKey(dt);
      if (counter.has(key)) counter.set(key, (counter.get(key) || 0) + 1);
    }

    const values = days.map((k) => counter.get(k) || 0);
    const max = Math.max(1, ...values);

    return days.map((k, idx) => ({
      key: k,
      label: formatArDayLabel(k),
      value: values[idx],
      pct: Math.round(((values[idx] || 0) / max) * 100),
    }));
  }, [chartSessions]);

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        {/* العنوان */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              لوحة تحكم المشرف
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              نظرة عامة سريعة على حالة المنصة التعليمية.
            </p>
          </div>

          <button
            onClick={loadAll}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm disabled:opacity-60"
            disabled={loading || filesLoading || chartLoading}
          >
            {loading || filesLoading || chartLoading ? "جاري..." : "تحديث"}
          </button>
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

        {/* الجداول / الإحصائيات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ✅ آخر الملفات */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-800 text-sm">
                آخر الملفات المرفوعة (Study Files)
              </h3>
              <button
                onClick={loadAll}
                className="text-xs text-blue-700 hover:underline"
                disabled={filesLoading}
              >
                تحديث
              </button>
            </div>

            {filesErr ? (
              <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg p-2">
                {filesErr}
              </div>
            ) : filesLoading ? (
              <div className="text-xs text-slate-500">جاري التحميل...</div>
            ) : studyFiles.length === 0 ? (
              <div className="text-xs text-slate-600">
                لا توجد ملفات مرفوعة حتى الآن.
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {studyFiles.map((f) => {
                  const id = f?._id;
                  const title = f?.title || "—";
                  const type = f?.type || "—";
                  const audience = f?.audience || "all";
                  const createdAt = f?.createdAt
                    ? new Date(f.createdAt).toLocaleString("ar")
                    : "";

                  const openUrl = f?.fileUrl || "";
                  const downloadUrl = id
                    ? `${apiClient.defaults.baseURL}/api/study-files/${id}/download?dl=1`
                    : "";

                  return (
                    <div
                      key={id}
                      className="border rounded-xl p-3 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-800 text-sm truncate">
                          {title}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 rounded bg-slate-50 border">
                            النوع: {type}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 border">
                            الفئة: {audience}
                          </span>
                          {createdAt ? (
                            <span className="px-2 py-0.5 rounded bg-slate-50 border">
                              {createdAt}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {openUrl ? (
                          <a
                            href={openUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs"
                          >
                            فتح
                          </a>
                        ) : null}

                        {downloadUrl ? (
                          <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 rounded-lg bg-slate-900 text-white text-xs"
                          >
                            تحميل
                          </a>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 text-[11px] text-slate-400">
              *يتم جلب أحدث الملفات مباشرة من /api/study-files (مرتبة بالأحدث).
            </div>
          </div>

          {/* ✅ رسم بياني بسيط */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-800 text-sm">
                جلسات حسب الأيام (آخر 7 أيام)
              </h3>
              <button
                onClick={loadAll}
                className="text-xs text-blue-700 hover:underline"
                disabled={chartLoading}
              >
                تحديث
              </button>
            </div>

            {chartErr ? (
              <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg p-2">
                {chartErr}
              </div>
            ) : chartLoading ? (
              <div className="text-xs text-slate-500">جاري التحميل...</div>
            ) : (
              <div className="mt-3">
                <div className="grid grid-cols-7 gap-2 items-end">
                  {chartData.map((d) => (
                    <div
                      key={d.key}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className="text-[10px] text-slate-500">
                        {d.value}
                      </div>
                      <div className="w-full h-24 bg-slate-50 border rounded-lg flex items-end overflow-hidden">
                        <div
                          className="w-full bg-indigo-600"
                          style={{ height: `${d.pct}%` }}
                          title={`${d.label}: ${d.value}`}
                        />
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {d.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-[11px] text-slate-400">
                  *الرسم يعتمد على startAt للجلسات، ويعرض عدد الجلسات لكل يوم.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
