import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import apiClient from "../../../api/apiClient";
import "../../styles/ManageStudents.css";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
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

  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // فورم الإضافة
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    grade: "",
  });

  // فورم التعديل
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
  });

  // ================== API ==================

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/api/users?role=student");
      setStudents(res.data || []);
    } catch (err) {
      console.log(err);
      alert("❌ فشل في تحميل بيانات الطلاب");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // إضافة طالب جديد
  const handleAddStudent = async () => {
    try {
      if (!addForm.name || !addForm.email || !addForm.password) {
        alert("⚠ الرجاء إدخال الاسم، البريد، وكلمة المرور");
        return;
      }

      await apiClient.post("/api/auth/register", addForm);

      alert("✔ تم إضافة الطالب بنجاح");
      setShowAdd(false);
      setAddForm({ name: "", email: "", phone: "", password: "", grade: "" });
      fetchStudents();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في إضافة الطالب");
    }
  };

  // فتح مودال التعديل
  const openEditModal = (s) => {
    setStudentToEdit(s);
    setEditForm({
      name: s.name || "",
      email: s.email || "",
      phone: s.phone || "",
      grade: s.grade || "",
    });
    setShowEdit(true);
  };

  // حفظ التعديل
  const handleEditStudent = async () => {
    if (!studentToEdit) return;

    try {
      await apiClient.put(`/api/users/${studentToEdit._id}`, editForm);
      alert("✔ تم تعديل بيانات الطالب");
      setShowEdit(false);
      setStudentToEdit(null);
      fetchStudents();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في تعديل بيانات الطالب");
    }
  };

  // فتح مودال الحذف
  const openDeleteModal = (s) => {
    setStudentToDelete(s);
    setShowDelete(true);
  };

  // تأكيد الحذف
  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      await apiClient.delete(`/api/users/${studentToDelete._id}`);
      alert("✔ تم حذف الطالب");
      setShowDelete(false);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err) {
      console.log(err.response?.data || err);
      alert("❌ فشل في حذف الطالب");
    }
  };

  // ================== فلترة + Pagination ==================

  const normalizedSearch = search.trim().toLowerCase();

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !normalizedSearch ||
      s.name?.toLowerCase().includes(normalizedSearch) ||
      s.email?.toLowerCase().includes(normalizedSearch) ||
      s.phone?.toLowerCase().includes(normalizedSearch) ||
      s.grade?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "approved"
        ? s.isApproved
        : !s.isApproved;

    return matchesSearch && matchesStatus;
  });

  const totalPages =
    filteredStudents.length === 0
      ? 1
      : Math.ceil(filteredStudents.length / PAGE_SIZE);

  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * PAGE_SIZE;
  const pageStudents = filteredStudents.slice(
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
      {/* العنوان + زر إضافة طالب */}
      <div className="ms-head">
        <div>
          <h2 className="ms-title">إدارة الطلاب</h2>
          <p className="ms-subtitle">
            يمكنك هنا إدارة حسابات الطلاب: الإضافة، التعديل، الحذف، ومتابعة حالة
            التفعيل.
          </p>
        </div>

        <button onClick={() => setShowAdd(true)} className="ms-addBtn">
          + إضافة طالب
        </button>
      </div>

      {/* شريط البحث + الفلترة */}
      <div className="ms-filters">
        <input
          type="text"
          placeholder="ابحث بالاسم، البريد، رقم الجوال، أو الصف..."
          className="ms-searchInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="ms-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          <option value="approved">مفعّلين فقط</option>
          <option value="pending">غير مفعّلين</option>
        </select>
      </div>

      {/* جدول الطلاب */}
      <div className="ms-card">
        <table className="ms-table">
          <thead className="ms-thead">
            <tr>
              <th className="ms-th">الاسم</th>
              <th className="ms-th">البريد</th>
              <th className="ms-th">رقم الجوال</th>
              <th className="ms-th">الصف</th>
              <th className="ms-th">الحالة</th>
              <th className="ms-th">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="6" className="ms-empty">
                  🔄 جاري تحميل بيانات الطلاب...
                </td>
              </tr>
            )}

            {!loading && pageStudents.length === 0 && (
              <tr>
                <td colSpan="6" className="ms-empty ms-emptyMuted">
                  لا يوجد طلاب حسب معايير البحث الحالية.
                </td>
              </tr>
            )}

            {pageStudents.map((s) => (
              <tr key={s._id} className="ms-tr">
                <td className="ms-td">{s.name}</td>
                <td className="ms-td">{s.email}</td>
                <td className="ms-td">{s.phone || "-"}</td>
                <td className="ms-td">{s.grade || "-"}</td>

                <td className="ms-td">
                  {s.isApproved ? (
                    <span className="ms-statusApproved">✔ مفعّل</span>
                  ) : (
                    <span className="ms-statusPending">✖ غير مفعّل</span>
                  )}
                </td>

                <td className="ms-td">
                  <div className="ms-actions">
                    <button
                      onClick={() => openEditModal(s)}
                      className="ms-btnEdit"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => openDeleteModal(s)}
                      className="ms-btnDelete"
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
        {!loading && filteredStudents.length > 0 && (
          <div className="ms-pagination">
            <span>
              صفحة {currentPageSafe} من {totalPages} — عدد الطلاب:{" "}
              {filteredStudents.length}
            </span>

            <div className="ms-paginationBtns">
              <button
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
                className={`ms-pageBtn ${
                  currentPageSafe === 1 ? "ms-pageBtnDisabled" : ""
                }`}
              >
                السابق
              </button>

              <button
                disabled={currentPageSafe === totalPages}
                onClick={() =>
                  setCurrentPage((p) => (p < totalPages ? p + 1 : p))
                }
                className={`ms-pageBtn ${
                  currentPageSafe === totalPages ? "ms-pageBtnDisabled" : ""
                }`}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================== مودال إضافة طالب ================== */}
      {showAdd && (
        <Modal onClose={() => setShowAdd(false)} title="إضافة طالب جديد">
          <div className="ms-modalBody">
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
              label="الصف"
              value={addForm.grade}
              onChange={(e) =>
                setAddForm({ ...addForm, grade: e.target.value })
              }
              placeholder="مثال: Grade 10"
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

            <div className="ms-modalActions">
              <button
                onClick={() => setShowAdd(false)}
                className="ms-cancelBtn"
              >
                إلغاء
              </button>
              <button onClick={handleAddStudent} className="ms-saveGreen">
                حفظ
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================== مودال تعديل طالب ================== */}
      {showEdit && studentToEdit && (
        <Modal onClose={() => setShowEdit(false)} title="تعديل بيانات الطالب">
          <div className="ms-modalBody">
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
            <InputField
              label="الصف"
              value={editForm.grade}
              onChange={(e) =>
                setEditForm({ ...editForm, grade: e.target.value })
              }
            />

            <p className="ms-note">
              ملاحظة: لا يمكن تعديل كلمة المرور من هنا، يمكن إضافة شاشة خاصة
              لإعادة التعيين لاحقاً.
            </p>

            <div className="ms-modalActions">
              <button
                onClick={() => setShowEdit(false)}
                className="ms-cancelBtn"
              >
                إلغاء
              </button>
              <button onClick={handleEditStudent} className="ms-saveBlue">
                حفظ التعديل
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================== مودال تأكيد الحذف ================== */}
      {showDelete && studentToDelete && (
        <Modal onClose={() => setShowDelete(false)} title="تأكيد حذف الطالب">
          <div className="ms-modalBody">
            <p className="ms-confirmText">
              هل أنت متأكد أنك تريد حذف حساب الطالب:
            </p>
            <p className="ms-dangerName">
              {studentToDelete.name} ({studentToDelete.email})
            </p>
            <p className="ms-warning">هذا الإجراء لا يمكن التراجع عنه.</p>

            <div className="ms-modalActions">
              <button
                onClick={() => setShowDelete(false)}
                className="ms-cancelBtn"
              >
                إلغاء
              </button>
              <button onClick={handleDeleteStudent} className="ms-saveRed">
                حذف
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

/* =============== Modal =============== */

function Modal({ children, title, onClose }) {
  return (
    <div className="ms-modalOverlay">
      <div className="ms-modalCard">
        <div className="ms-modalHeader">
          <h3 className="ms-modalTitle">{title}</h3>
          <button onClick={onClose} className="ms-modalClose">
            ×
          </button>
        </div>
        <div className="ms-modalContent">{children}</div>
      </div>
    </div>
  );
}

/* =============== InputField =============== */

function InputField({ label, ...props }) {
  return (
    <label className="ms-field">
      <span className="ms-fieldLabel">{label}</span>
      <input {...props} className="ms-fieldInput" />
    </label>
  );
}



