// frontend/src/pages/Teacher/TeacherAttendance.jsx
import { useState } from "react";

const dummySessions = [
  { id: "s1", title: "رياضيات 101 - جلسة 1", date: "2025-01-10" },
  { id: "s2", title: "علوم 201 - تجربة 2", date: "2025-01-12" },
];

const dummyStudents = [
  { id: "st1", name: "أحمد علي" },
  { id: "st2", name: "سارة محمد" },
  { id: "st3", name: "خالد يوسف" },
];

export default function TeacherAttendance() {
  const [selectedSession, setSelectedSession] = useState("");
  const [attendance, setAttendance] = useState({}); // { studentId: "present" | "absent" }

  const handleChangeStatus = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSave = () => {
    if (!selectedSession) {
      alert("الرجاء اختيار جلسة أولاً");
      return;
    }

    // هنا لاحقًا نستبدله بطلب API للباك إند
    console.log("Saving attendance for session:", selectedSession);
    console.log("Attendance:", attendance);

    alert("✅ تم حفظ الحضور (بيانات تجريبية فقط حالياً)");
  };

  return (
    <div className="p-6 text-right min-h-screen bg-gray-100" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">تسجيل الحضور 📅</h1>

      {/* Select Session */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <label className="block mb-2 font-semibold text-gray-700">
          اختر الجلسة:
        </label>
        <select
          className="w-full border rounded-lg p-2 text-right"
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
        >
          <option value="">-- اختر الجلسة --</option>
          {dummySessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} ({s.date})
            </option>
          ))}
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          قائمة الطلاب في الجلسة
        </h2>

        <table className="w-full text-right border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 border">#</th>
              <th className="py-2 px-3 border">اسم الطالب</th>
              <th className="py-2 px-3 border">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {dummyStudents.map((st, index) => (
              <tr key={st.id} className="border-b">
                <td className="py-2 px-3 border">{index + 1}</td>
                <td className="py-2 px-3 border">{st.name}</td>
                <td className="py-2 px-3 border">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleChangeStatus(st.id, "present")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[st.id] === "present"
                          ? "bg-emerald-600 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      حاضر
                    </button>
                    <button
                      onClick={() => handleChangeStatus(st.id, "absent")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        attendance[st.id] === "absent"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      غائب
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {dummyStudents.length === 0 && (
              <tr>
                <td colSpan="3" className="py-4 text-center text-gray-500">
                  لا يوجد طلاب في هذه الجلسة.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            💾 حفظ الحضور
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4">
        *هذه الواجهة تجريبية، وسيتم ربطها بقاعدة البيانات ونظام الحضور الفعلي
        لاحقًا.
      </p>
    </div>
  );
}
