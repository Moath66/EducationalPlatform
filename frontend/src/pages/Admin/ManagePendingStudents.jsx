import { useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";

export default function ManagePendingStudents() {
  const [pending, setPending] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await apiClient.get("/api/users/pending");
      setPending(res.data);
    } catch (err) {
      console.log(err);
      alert("❌ فشل في جلب الطلبات");
    }
  };

  const approve = async (id) => {
    try {
      await apiClient.put(`/api/users/approve/${id}`);
      alert("✔ تمت الموافقة على المستخدم");
      fetchPending();
    } catch (err) {
      console.log(err);
      alert("❌ فشل في الموافقة");
    }
  };

  const reject = async (id) => {
    if (!confirm("❗ هل تريد حذف الطلب؟")) return;

    try {
      await apiClient.delete(`/api/users/reject/${id}`);
      alert("🚮 تم رفض المستخدم وحذف طلبه");
      fetchPending();
    } catch (err) {
      console.log(err);
      alert("❌ فشل في حذف الطلب");
    }
  };

  return (
    <div className="p-6 text-right" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">📥 طلبات التسجيل الجديدة</h1>

      {pending.length === 0 ? (
        <p className="text-gray-600 text-lg">لا يوجد طلبات حالياً ✔</p>
      ) : (
        <div className="space-y-4">
          {pending.map((u) => (
            <div
              key={u._id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center border"
            >
              <div>
                <p className="font-bold text-lg">{u.name}</p>
                <p className="text-gray-600 text-sm">{u.email}</p>
                <p className="text-gray-600 text-sm">الجوال: {u.phone}</p>

                <p className="text-gray-600 text-sm">
                  النوع: {u.role === "teacher" ? "معلّم" : "طالب"}
                </p>

                {u.role === "student" && (
                  <p className="text-gray-600 text-sm">الصف: {u.grade}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => approve(u._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  ✔ قبول
                </button>

                <button
                  onClick={() => reject(u._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  ✖ رفض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
