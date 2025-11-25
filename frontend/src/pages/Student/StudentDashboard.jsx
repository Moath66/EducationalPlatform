import { useEffect, useState } from "react";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, []);

  return (
    <div className="p-6 text-right" dir="rtl">
      {/* Welcome */}
      <h1 className="text-3xl font-bold mb-4">
        أهلاً، {user?.name || "الطالب"} 👋
      </h1>

      {/* Simple Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">الكورسات</h2>
          <p className="text-3xl font-bold text-teal-600">3</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">الجلسات القادمة</h2>
          <p className="text-3xl font-bold text-teal-600">1</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-700">المهام المطلوبة</h2>
          <p className="text-3xl font-bold text-teal-600">2</p>
        </div>
      </div>

      {/* 🔥 Attendance Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => (window.location.href = "/student/attendance")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition text-lg font-semibold"
        >
          📅 عرض الحضور
        </button>
      </div>

      {/* Courses List */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-700">كورساتك</h2>

        <div className="space-y-3">
          <div className="p-4 border rounded-lg flex justify-between">
            <div>
              <p className="font-bold">رياضيات 101</p>
              <p className="text-gray-500 text-sm">مقدمة في الجبر</p>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">
              دخول
            </button>
          </div>

          <div className="p-4 border rounded-lg flex justify-between">
            <div>
              <p className="font-bold">علوم 201</p>
              <p className="text-gray-500 text-sm">أساسيات الفيزياء</p>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg">
              دخول
            </button>
          </div>
        </div>
      </div>

      {/* Assignments */}
      <div className="bg-white p-5 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-3 text-gray-700">
          المهام المطلوبة
        </h2>

        <ul className="list-disc pr-6 text-gray-700">
          <li>حل واجب الرياضيات (تاريخ التسليم: ٢٣ يناير)</li>
          <li>كتابة تقرير العلوم (تاريخ التسليم: ٢٥ يناير)</li>
        </ul>
      </div>

      {/* Notifications */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h2 className="text-xl font-bold mb-3 text-gray-700">الإشعارات</h2>

        <ul className="list-disc pr-6 text-gray-700">
          <li>تم رفع محاضرة جديدة في مادة الرياضيات</li>
          <li>سيتم عقد جلسة مباشرة يوم الأربعاء الساعة ٨ مساءً</li>
        </ul>
      </div>
    </div>
  );
}
