import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import apiClient from "../../../api/apiClient";
import "../../styles/ManageTeachers.css"; // ← ملف التنسيق الجديد

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // بحث + فلترة + صفحات
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | approved | pending
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

  // ================== API ==================

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      // backend: عدّل getAllUsers ليقبل ?role=teacher
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

  // إضافة معلّم جديد
  // إضافة معلّم جديد
  const handleAddTeacher = async () => {
    try {
      if (!addForm.name || !addForm.email || !addForm.password) {
        alert("⚠ الرجاء إدخال الاسم، البريد، وكلمة المرور");
        return;
      }

      await apiClient.post("/api/users/create-teacher", addForm); // ✅ هنا

      alert("✔ تم إضافة المعلّم بنجاح");
      setShowAdd(false);
      setAddForm({ name: "", email: "", phone: "", password: "" });
      fetchTeachers();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في إضافة المعلّم");
    }
  };

  // فتح مودال التعديل
  const openEditModal = (t) => {
    setTeacherToEdit(t);
    setEditForm({
      name: t.name || "",
      email: t.email || "",
      phone: t.phone || "",
    });
    setShowEdit(true);
  };

  // حفظ التعديل
  const handleEditTeacher = async () => {
    if (!teacherToEdit) return;

    try {
      await apiClient.put(`/api/users/${teacherToEdit._id}`, editForm);
      alert("✔ تم تعديل بيانات المعلّم");
      setShowEdit(false);
      setTeacherToEdit(null);
      fetchTeachers();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في تعديل بيانات المعلّم");
    }
  };

  // فتح مودال الحذف
  const openDeleteModal = (t) => {
    setTeacherToDelete(t);
    setShowDelete(true);
  };

  // تأكيد الحذف
  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      await apiClient.delete(`/api/users/${teacherToDelete._id}`);
      alert("✔ تم حذف المعلّم");
      setShowDelete(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في حذف المعلّم");
    }
  };

  // ================== فلترة + Pagination ==================

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      !normalizedSearch ||
      t.name?.toLowerCase().includes(normalizedSearch) ||
      t.email?.toLowerCase().includes(normalizedSearch) ||
      t.phone?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
        ? t.isApproved
        : !t.isApproved;

    return matchesSearch && matchesStatus;
  });

  const totalPages =
    filteredTeachers.length === 0
      ? 1
      : Math.ceil(filteredTeachers.length / PAGE_SIZE);

  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const pageTeachers = filteredTeachers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // إعادة الصفحة للأولى عند تغيير البحث أو الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // ================== JSX ==================

  return (
    <AdminLayout>
      {/* العنوان + زر إضافة معلّم */}
      <div className="mt-head">
        <div>
          <h2 className="mt-title">إدارة المعلّمين</h2>
          <p className="mt-subtitle">
            يمكنك هنا إدارة حسابات المعلّمين: الإضافة، التعديل، الحذف، وتفعيل
            الحسابات.
          </p>
        </div>

        <button onClick={() => setShowAdd(true)} className="mt-addBtn">
          + إضافة معلّم
        </button>
      </div>

      {/* شريط البحث + الفلترة */}
      <div className="mt-filters">
        <input
          type="text"
          placeholder="ابحث بالاسم، البريد، أو رقم الجوال..."
          className="mt-searchInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="mt-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          <option value="approved">مفعّلين فقط</option>
          <option value="pending">غير مفعّلين</option>
        </select>
      </div>

      {/* جدول المعلّمين */}
      <div className="mt-card">
        <table className="mt-table">
          <thead className="mt-thead">
            <tr>
              <th className="mt-th">الاسم</th>
              <th className="mt-th">البريد</th>
              <th className="mt-th">رقم الجوال</th>
              <th className="mt-th">الحالة</th>
              <th className="mt-th">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="mt-empty">
                  🔄 جاري تحميل بيانات المعلّمين...
                </td>
              </tr>
            )}

            {!loading && pageTeachers.length === 0 && (
              <tr>
                <td colSpan="5" className="mt-empty mt-emptyMuted">
                  لا يوجد معلّمين حسب معايير البحث الحالية.
                </td>
              </tr>
            )}

            {pageTeachers.map((t) => (
              <tr key={t._id} className="mt-tr">
                <td className="mt-td">{t.name}</td>
                <td className="mt-td">{t.email}</td>
                <td className="mt-td">{t.phone}</td>

                <td className="mt-td">
                  {t.isApproved ? (
                    <span className="mt-statusApproved">✔ مفعّل</span>
                  ) : (
                    <span className="mt-statusPending">✖ غير مفعّل</span>
                  )}
                </td>

                <td className="mt-td">
                  <div className="mt-actions">
                    <button
                      onClick={() => openEditModal(t)}
                      className="mt-btnEdit"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => openDeleteModal(t)}
                      className="mt-btnDelete"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filteredTeachers.length > 0 && (
          <div className="mt-pagination">
            <span>
              صفحة {currentPageSafe} من {totalPages} — عدد المعلّمين:{" "}
              {filteredTeachers.length}
            </span>

            <div className="mt-paginationBtns">
              <button
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
                className={`mt-pageBtn ${
                  currentPageSafe === 1 ? "mt-pageBtnDisabled" : ""
                }`}
              >
                السابق
              </button>

              <button
                disabled={currentPageSafe === totalPages}
                onClick={() =>
                  setCurrentPage((p) => (p < totalPages ? p + 1 : p))
                }
                className={`mt-pageBtn ${
                  currentPageSafe === totalPages ? "mt-pageBtnDisabled" : ""
                }`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================== مودال إضافة معلّم ================== */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="إضافة معلّم جديد">
          <div className="mt-modalBody">
            <InputField
              label="الاسم الكامل"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="مثال: أحمد محمد"
            />
            <InputField
              label="البريد الإلكتروني"
              value={addForm.email}
              onChange={(e) =>
                setAddForm({ ...addForm, email: e.target.value })
              }
              placeholder="example@mail.com"
              type="email"
            />
            <InputField
              label="رقم الجوال"
              value={addForm.phone}
              onChange={(e) =>
                setAddForm({ ...addForm, phone: e.target.value })
              }
              placeholder="05xxxxxxxx"
            />
            <InputField
              label="كلمة المرور"
              value={addForm.password}
              onChange={(e) =>
                setAddForm({ ...addForm, password: e.target.value })
              }
              placeholder="••••••••"
              type="password"
            />

            <div className="mt-modalActions">
              <button
                onClick={() => setShowAdd(false)}
                className="mt-cancelBtn"
              >
                إلغاء
              </button>
              <button onClick={handleAddTeacher} className="mt-saveGreen">
                حفظ
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================== مودال تعديل معلّم ================== */}
      {showEdit && teacherToEdit && (
        <Modal onClose={() => setShowEdit(false)} title="تعديل بيانات المعلّم">
          <div className="mt-modalBody">
            <InputField
              label="الاسم الكامل"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <InputField
              label="البريد الإلكتروني"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
              type="email"
            />
            <InputField
              label="رقم الجوال"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />

            <p className="mt-note">
              ملاحظة: لا يمكن تعديل كلمة المرور من هنا، يمكن إضافة شاشة خاصة
              لإعادة التعيين لاحقاً.
            </p>

            <div className="mt-modalActions">
              <button
                onClick={() => setShowEdit(false)}
                className="mt-cancelBtn"
              >
                إلغاء
              </button>
              <button onClick={handleEditTeacher} className="mt-saveBlue">
                حفظ التعديل
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================== مودال تأكيد الحذف ================== */}
      {showDelete && teacherToDelete && (
        <Modal onClose={() => setShowDelete(false)} title="تأكيد حذف المعلّم">
          <div className="mt-modalBody">
            <p className="mt-confirmText">
              هل أنت متأكد أنك تريد حذف حساب المعلّم:
            </p>
            <p className="mt-dangerName">
              {teacherToDelete.name} ({teacherToDelete.email})
            </p>
            <p className="mt-warning">هذا الإجراء لا يمكن التراجع عنه.</p>

            <div className="mt-modalActions">
              <button
                onClick={() => setShowDelete(false)}
                className="mt-cancelBtn"
              >
                إلغاء
              </button>
              <button onClick={handleDeleteTeacher} className="mt-saveRed">
                حذف
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* =============== مكوّن Modal بسيط =============== */

function Modal({ children, title, onClose }) {
  return (
    <div className="mt-modalOverlay">
      <div className="mt-modalCard">
        <div className="mt-modalHeader">
          <h3 className="mt-modalTitle">{title}</h3>
          <button onClick={onClose} className="mt-modalClose">
            ×
          </button>
        </div>
        <div className="mt-modalContent">{children}</div>
      </div>
    </div>
  );
}

/* =============== مكوّن حقل إدخال صغير =============== */

function InputField({ label, ...props }) {
  return (
    <label className="mt-field">
      <span className="mt-fieldLabel">{label}</span>
      <input {...props} className="mt-fieldInput" />
    </label>
  );
}
