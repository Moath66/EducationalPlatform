// frontend/src/pages/Teacher/TeacherDashboard.jsx
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setTeacher(savedUser);
  }, []);

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          أهلاً، {teacher?.name || "المعلم"} 👋
        </h1>

        <button
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">عدد كورساتي</p>
          <p className="text-3xl font-bold text-teal-600">4</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">جلسات اليوم</p>
          <p className="text-3xl font-bold text-indigo-600">2</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">طلاب مسجلين</p>
          <p className="text-3xl font-bold text-emerald-600">35</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-sm">واجبات قيد التصحيح</p>
          <p className="text-3xl font-bold text-orange-500">5</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الجلسات</h2>
          <p className="text-gray-600 text-sm">
            إدارة الجلسات المباشرة، الوقت، التاريخ، والرابط.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/sessions")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الجلسات
            </button>
            <button
              onClick={() => (window.location.href = "/teacher/attendance")}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
            >
              📅 تسجيل الحضور
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الدروس</h2>
          <p className="text-gray-600 text-sm">
            إضافة الدروس، رفع ملفات، وروابط YouTube.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/lessons")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الدروس
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow flex flex-col gap-3">
          <h2 className="text-xl font-bold mb-1">الواجبات والطلاب</h2>
          <p className="text-gray-600 text-sm">
            إنشاء واجبات، متابعة التسليمات، واستعراض الطلاب.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => (window.location.href = "/teacher/assignments")}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm"
            >
              إدارة الواجبات
            </button>
            <button
              onClick={() => (window.location.href = "/teacher/students")}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm"
            >
              قائمة الطلاب
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-800">
          الجلسات القادمة 🎥
        </h2>

        <div className="space-y-3">
          <div className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="font-bold">رياضيات 101 - مراجعة الوحدة 2</p>
              <p className="text-gray-500 text-sm">
                الأربعاء، ٨ مساءً - Google Meet
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                نسخ رابط الجلسة
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                تفاصيل
              </button>
            </div>
          </div>

          <div className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <p className="font-bold">علوم 201 - تجربة تفاعلية</p>
              <p className="text-gray-500 text-sm">
                الخميس، ٧ مساءً - Google Meet
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
                نسخ رابط الجلسة
              </button>
              <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                تفاصيل
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple bottom notice */}
      <p className="text-xs text-gray-400 text-center mt-4">
        *جميع البيانات في هذه الصفحة تجريبية (Placeholder) وسيتم ربطها
        بالباك-إند لاحقًا.
      </p>
    </div>
  );
}
