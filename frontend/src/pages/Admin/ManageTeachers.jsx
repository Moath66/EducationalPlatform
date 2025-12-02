import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import apiClient from "../../../api/apiClient";

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
  const handleAddTeacher = async () => {
    try {
      if (!addForm.name || !addForm.email || !addForm.password) {
        alert("⚠ الرجاء إدخال الاسم، البريد، وكلمة المرور");
        return;
      }

      await apiClient.post("/api/auth/register", {
        ...addForm,
        role: "teacher",
      });

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المعلّمين</h2>
          <p className="text-sm text-slate-500 mt-1">
            يمكنك هنا إدارة حسابات المعلّمين: الإضافة، التعديل، الحذف، وتفعيل
            الحسابات.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm"
        >
          + إضافة معلّم
        </button>
      </div>

      {/* شريط البحث + الفلترة */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="ابحث بالاسم، البريد، أو رقم الجوال..."
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="w-full md:w-48 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">كل الحالات</option>
          <option value="approved">مفعّلين فقط</option>
          <option value="pending">غير مفعّلين</option>
        </select>
      </div>

      {/* جدول المعلّمين */}
      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3 text-sm">الاسم</th>
              <th className="p-3 text-sm">البريد</th>
              <th className="p-3 text-sm">رقم الجوال</th>
              <th className="p-3 text-sm">الحالة</th>
              <th className="p-3 text-sm">إجراءات</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-500">
                  🔄 جاري تحميل بيانات المعلّمين...
                </td>
              </tr>
            )}

            {!loading && pageTeachers.length === 0 && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-slate-400">
                  لا يوجد معلّمين حسب معايير البحث الحالية.
                </td>
              </tr>
            )}

            {pageTeachers.map((t) => (
              <tr key={t._id} className="border-b hover:bg-slate-50">
                <td className="p-3 text-sm">{t.name}</td>
                <td className="p-3 text-sm">{t.email}</td>
                <td className="p-3 text-sm">{t.phone}</td>

                <td className="p-3 text-sm">
                  {t.isApproved ? (
                    <span className="text-green-600 font-semibold">
                      ✔ مفعّل
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      ✖ غير مفعّل
                    </span>
                  )}
                </td>

                <td className="p-3">
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => openEditModal(t)}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      تعديل
                    </button>

                    <button
                      onClick={() => openDeleteModal(t)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-600">
            <span>
              صفحة {currentPageSafe} من {totalPages} — عدد المعلّمين:{" "}
              {filteredTeachers.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPageSafe === 1}
                onClick={() => setCurrentPage((p) => (p > 1 ? p - 1 : p))}
                className={`px-3 py-1 rounded border text-xs ${
                  currentPageSafe === 1
                    ? "text-slate-400 border-slate-200 cursor-not-allowed"
                    : "border-slate-300 hover:bg-slate-100"
                }`}
              >
                السابق
              </button>

              <button
                disabled={currentPageSafe === totalPages}
                onClick={() =>
                  setCurrentPage((p) => (p < totalPages ? p + 1 : p))
                }
                className={`px-3 py-1 rounded border text-xs ${
                  currentPageSafe === totalPages
                    ? "text-slate-400 border-slate-200 cursor-not-allowed"
                    : "border-slate-300 hover:bg-slate-100"
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
          <div className="space-y-3 text-sm">
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

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="px-3 py-1 rounded border border-slate-300 text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddTeacher}
                className="px-4 py-1 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================== مودال تعديل معلّم ================== */}
      {showEdit && teacherToEdit && (
        <Modal onClose={() => setShowEdit(false)} title="تعديل بيانات المعلّم">
          <div className="space-y-3 text-sm">
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

            <p className="text-xs text-slate-400">
              ملاحظة: لا يمكن تعديل كلمة المرور من هنا، يمكن إضافة شاشة خاصة
              لإعادة التعيين لاحقاً.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowEdit(false)}
                className="px-3 py-1 rounded border border-slate-300 text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditTeacher}
                className="px-4 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700"
              >
                حفظ التعديل
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================== مودال تأكيد الحذف ================== */}
      {showDelete && teacherToDelete && (
        <Modal onClose={() => setShowDelete(false)} title="تأكيد حذف المعلّم">
          <div className="space-y-3 text-sm">
            <p className="text-slate-700">
              هل أنت متأكد أنك تريد حذف حساب المعلّم:
            </p>
            <p className="font-semibold text-red-600">
              {teacherToDelete.name} ({teacherToDelete.email})
            </p>
            <p className="text-xs text-slate-500">
              هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDelete(false)}
                className="px-3 py-1 rounded border border-slate-300 text-xs"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteTeacher}
                className="px-4 py-1 rounded bg-red-600 text-white text-xs hover:bg-red-700"
              >
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg"
          >
            ×
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

/* =============== مكوّن حقل إدخال صغير =============== */

function InputField({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </label>
  );
}
