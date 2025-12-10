import { useEffect, useMemo, useState } from "react";
import { fetchMyAttendance } from "../../../api/attendanceApi";

function formatDateAr(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ar", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function safeStatusLabel(status) {
  switch (status) {
    case "present":
      return { text: "✔ حاضر", cls: "text-green-600" };
    case "absent":
      return { text: "✖ غائب", cls: "text-red-600" };
    case "late":
      return { text: "⏳ متأخر", cls: "text-amber-600" };
    case "excused":
      return { text: "📝 بعذر", cls: "text-slate-600" };
    default:
      return { text: status || "—", cls: "text-slate-600" };
  }
}

export default function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        const data = await fetchMyAttendance();
        setRecords(data.records || []);
      } catch (e) {
        setErr(e.message || "❌ فشل في تحميل بيانات الحضور");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const excused = records.filter((r) => r.status === "excused").length;

    // نعتبر late حاضر في النسبة (تقدر تغيرها)
    const effectivePresent = present + late + excused;
    const percentage =
      total > 0 ? Math.round((effectivePresent / total) * 100) : 0;

    return { total, present, absent, late, excused, percentage };
  }, [records]);

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-right">📊 تقرير الحضور</h1>

      {err ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-6 text-sm text-right">
          {err}
        </div>
      ) : null}

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">إجمالي الجلسات</p>
          <p className="text-2xl font-bold">{loading ? "..." : stats.total}</p>
        </div>

        <div className="bg-green-100 p-5 rounded-xl shadow text-center">
          <p className="text-gray-700">📗 عدد الحضور</p>
          <p className="text-2xl font-bold text-green-700">
            {loading ? "..." : stats.present}
          </p>
        </div>

        <div className="bg-red-100 p-5 rounded-xl shadow text-center">
          <p className="text-gray-700">📕 عدد الغياب</p>
          <p className="text-2xl font-bold text-red-700">
            {loading ? "..." : stats.absent}
          </p>
        </div>

        <div className="bg-blue-100 p-5 rounded-xl shadow text-center">
          <p className="text-gray-700">📈 نسبة الحضور</p>
          <p className="text-2xl font-bold text-blue-700">
            {loading ? "..." : `${stats.percentage}%`}
          </p>
        </div>
      </div>

      {/* تحذير */}
      {!loading && stats.total > 0 && stats.percentage < 75 && (
        <div className="bg-red-200 text-red-800 p-4 mb-6 rounded-lg text-center font-semibold">
          ⚠️ تنبيه: نسبة حضورك منخفضة!
        </div>
      )}

      {/* جدول الحضور */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b text-right">
          <h2 className="text-lg font-bold text-slate-800">سجل الحضور</h2>
          <p className="text-xs text-slate-500 mt-1">
            هذا السجل يعتمد على جلسات الفصول (Sessions) المسجلة من المعلم.
          </p>
        </div>

        <table className="w-full text-right">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">التاريخ</th>
              <th className="p-3">الجلسة</th>
              <th className="p-3">الكورس</th>
              <th className="p-3">الحالة</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  جاري التحميل...
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-500">
                  لا يوجد سجل حضور حتى الآن.
                </td>
              </tr>
            ) : (
              records.map((rec) => {
                const id = rec._id;
                const session = rec.sessionId; // populated
                const startAt = session?.startAt;
                const sessionTitle = session?.title || "—";
                const courseTitle = session?.courseId?.title || "—";

                const s = safeStatusLabel(rec.status);

                return (
                  <tr key={id} className="border-b">
                    <td className="p-3">{formatDateAr(startAt)}</td>
                    <td className="p-3">{sessionTitle}</td>
                    <td className="p-3">{courseTitle}</td>
                    <td className={`p-3 font-semibold ${s.cls}`}>{s.text}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
