import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import apiClient from "../../../api/apiClient";
import "../../styles/ManageTeachers.css";

export default function ManageTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [filterEmail, setFilterEmail] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // إضافة معلّم جديد
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await apiClient.get("/api/users?role=teacher");
      setTeachers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredTeachers = teachers.filter((t) =>
    t.email.toLowerCase().includes(filterEmail.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="teacher-header">
        <h2 className="title">إدارة المعلمين</h2>
        <button className="btn-add" onClick={() => setShowAddModal(true)}>
          + إضافة معلّم
        </button>
      </div>

      {/* فلترة بالإيميل فقط */}
      <input
        type="text"
        className="filter-input"
        placeholder="بحث بالبريد الإلكتروني..."
        value={filterEmail}
        onChange={(e) => setFilterEmail(e.target.value)}
      />

      <table className="teacher-table">
        <thead>
          <tr>
            <th>البريد</th>
            <th>الحالة</th>
            <th>إجراءات</th>
          </tr>
        </thead>

        <tbody>
          {filteredTeachers.map((t) => (
            <tr key={t._id}>
              <td>{t.email}</td>

              <td>
                {t.isApproved ? (
                  <span className="status-active">✔ مفعّل</span>
                ) : (
                  <span className="status-inactive">✘ غير مفعّل</span>
                )}
              </td>

              <td>
                <button
                  className="btn-edit"
                  onClick={() => {
                    setSelectedTeacher(t);
                    setShowEditModal(true);
                  }}
                >
                  تعديل
                </button>

                <button
                  className="btn-delete"
                  onClick={() => {
                    setSelectedTeacher(t);
                    setShowDeleteModal(true);
                  }}
                >
                  حذف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}
