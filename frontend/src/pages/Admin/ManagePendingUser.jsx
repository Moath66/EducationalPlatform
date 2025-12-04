import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../../api/apiClient";
import "../../styles/ManagePendingUser.css";

export default function ManagePendingUser() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/users/pending");
      setPending(res.data || []);
    } catch (err) {
      console.log(err);
      alert("❌ فشل في جلب الطلبات");
    } finally {
      setLoading(false);
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
    <div className="mpu-page" dir="rtl">
      <div className="mpu-topbar">
        <button className="mpu-backBtn" onClick={() => navigate("/admin")}>
          ← الرجوع للوحة التحكم
        </button>

        <div className="mpu-titleWrap">
          <h1 className="mpu-title">طلبات التسجيل الجديدة</h1>
          <p className="mpu-subtitle">
            راجع الطلبات ثم وافق/ارفض قبل السماح بالدخول للنظام.
          </p>
        </div>

        <div className="mpu-badge">📥</div>
      </div>

      <div className="mpu-card">
        {loading ? (
          <div className="mpu-empty">🔄 جاري تحميل الطلبات...</div>
        ) : pending.length === 0 ? (
          <div className="mpu-empty mpu-emptyOk">لا يوجد طلبات حالياً ✔</div>
        ) : (
          <div className="mpu-list">
            {pending.map((u) => (
              <div key={u._id} className="mpu-item">
                <div className="mpu-info">
                  <div className="mpu-nameRow">
                    <p className="mpu-name">{u.name}</p>
                    <span className="mpu-role">
                      {u.role === "teacher" ? "معلّم" : "طالب"}
                    </span>
                  </div>

                  <p className="mpu-line">{u.email}</p>
                  <p className="mpu-line">الجوال: {u.phone || "-"}</p>

                  {u.role === "student" && (
                    <p className="mpu-line">الصف: {u.grade || "-"}</p>
                  )}
                </div>

                <div className="mpu-actions">
                  <button
                    onClick={() => approve(u._id)}
                    className="mpu-btn mpu-approve"
                  >
                    ✔ قبول
                  </button>

                  <button
                    onClick={() => reject(u._id)}
                    className="mpu-btn mpu-reject"
                  >
                    ✖ رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
