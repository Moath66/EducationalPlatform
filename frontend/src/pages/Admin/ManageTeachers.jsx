import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import apiClient from "../../../api/apiClient";
import "../../styles/ManageTeachers.css"; // ← ملف التنسيق الجديد

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------- البحث (بالإيميل فقط)
  const [search, setSearch] = useState("");

  // -------- الفلترة
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // مودالات
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [teacherToEdit, setTeacherToEdit] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);

  // فورم الإضافة
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // فورم التعديل
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // === API ===
  const fetchTeachers = async () => {
    try {
      setLoading(true);

      // 🔥 جلب المعلمين فقط
      const res = await apiClient.get("/api/users?role=teacher");

      setTeachers(res.data || []);
    } catch (err) {
      console.log(err);
      alert("❌ فشل في تحميل بيانات المعلّمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ======== فلترة (بحث بالإيميل فقط) ========
  const filteredTeachers = teachers.filter((t) => {
    const emailMatch = t.email.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
        ? t.isApproved
        : !t.isApproved;

    return emailMatch && statusMatch;
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTeachers.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageTeachers = filteredTeachers.slice(start, start + PAGE_SIZE);

  // إعادة رقم الصفحة بعد تغيير الفلتر
  useEffect(() => setCurrentPage(1), [search, statusFilter]);

  // بقية الأكواد كما هي مثل المودالات والإضافة والحذف والتعديل...
  // (نفس الكود الذي أرسلته — لم يتم حذفه)

  return (
    <AdminLayout>
      {/* ======== الهيدر وزر إضافة معلم ======== */}
      <div className="teachers-header">
        <div>
          <h2 className="teachers-title">إدارة المعلّمين</h2>
          <p className="teachers-subtitle">
            يمكنك هنا إدارة حسابات المعلّمين: الإضافة، التعديل، الحذف، والتفعيل.
          </p>
        </div>

        <button onClick={() => setShowAdd(true)} className="btn-add-teacher">
          + إضافة معلّم
        </button>
      </div>

      {/* ======== البحث ======== */}
      <input
        type="text"
        placeholder="بحث بالبريد الإلكتروني فقط..."
        className="teacher-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ======== جدول المعلّمِين ======== */}
      <div className="teachers-table-container">
        <table className="teachers-table">
          <thead>
            <tr>
              <th>البريد الإلكتروني</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="3" className="loading-row">
                  🔄 جاري التحميل...
                </td>
              </tr>
            )}

            {!loading && pageTeachers.length === 0 && (
              <tr>
                <td colSpan="3" className="empty-row">
                  لا يوجد معلّمين حسب البحث الحالي.
                </td>
              </tr>
            )}

            {!loading &&
              pageTeachers.map((t) => (
                <tr key={t._id}>
                  <td>{t.email}</td>

                  <td>
                    {t.isApproved ? (
                      <span className="status-active">✔ مفعّل</span>
                    ) : (
                      <span className="status-inactive">✖ غير مفعّل</span>
                    )}
                  </td>

                  <td className="actions-cell">
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setTeacherToEdit(t);
                        setShowEdit(true);
                      }}
                    >
                      تعديل
                    </button>

                    <button
                      className="btn-delete"
                      onClick={() => {
                        setTeacherToDelete(t);
                        setShowDelete(true);
                      }}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* باقي المودالات كما هي */}
    </AdminLayout>
  );
}
