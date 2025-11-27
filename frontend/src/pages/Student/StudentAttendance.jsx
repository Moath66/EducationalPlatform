import { useEffect, useState } from "react";
import apiClient from "../../api/apiClient"; // ★ مهم

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0,
  });

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await apiClient.get(`/api/attendance/student/${user._id}`);

      if (res.status === 200) {
        const records = res.data.attendance;
        setAttendance(records);
        calculateStats(records);
      }
    } catch (err) {
      console.log(err);
      alert("❌ فشل في تحميل بيانات الحضور");
    }
  };

  const calculateStats = (records) => {
    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = total - present;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({ total, present, absent, percentage });
  };

  return (
    <div className="p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-right">📊 تقرير الحضور</h1>

      {/* إحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-gray-500">إجمالي الجلسات</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="bg-green-100 p-5 rounded-xl shadow text-center">
          <p className="text-gray-700">📗 عدد الحضور</p>
          <p className="text-2xl font-bold text-green-700">{stats.present}</p>
        </div>

        <div className="bg-red-100 p-5 rounded-xl shadow text-center">
          <p className="text-gray-700">📕 عدد الغياب</p>
          <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
        </div>

        <div className="bg-blue-100 p-5 rounded-xl shadow text-center">
          <p className="text-gray-700">📈 نسبة الحضور</p>
          <p className="text-2xl font-bold text-blue-700">
            {stats.percentage}%
          </p>
        </div>
      </div>

      {/* تحذير */}
      {stats.percentage < 75 && (
        <div className="bg-red-200 text-red-800 p-4 mb-6 rounded-lg text-center font-semibold">
          ⚠️ تنبيه: نسبة حضورك منخفضة!
        </div>
      )}

      {/* جدول الحضور */}
      <table className="w-full text-right bg-white rounded-xl shadow overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-3">التاريخ</th>
            <th className="p-3">المادة</th>
            <th className="p-3">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {attendance.map((rec) => (
            <tr key={rec._id} className="border-b">
              <td className="p-3">{rec.date?.slice(0, 10)}</td>
              <td className="p-3">{rec.courseName}</td>
              <td className="p-3">
                {rec.status === "present" ? (
                  <span className="text-green-600 font-semibold">✔ حاضر</span>
                ) : (
                  <span className="text-red-600 font-semibold">✖ غائب</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
