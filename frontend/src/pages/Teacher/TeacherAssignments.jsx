// frontend/src/pages/Teacher/TeacherAssignments.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  fetchTeacherAssignments,
  deleteAssignment,
} from "../../../api/assignmentApi";

import AssignmentFormModal from "../../components/teacher/AssignmentFormModal";

export default function TeacherAssignments() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetchTeacherAssignments();
      setAssignments(res?.payload || []);
    } catch (e) {
      setError(e?.message || "فشل تحميل الواجبات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm("هل أنت متأكد من حذف الواجب؟");
    if (!ok) return;

    setError("");
    setInfo("");
    try {
      await deleteAssignment(id);
      setInfo("تم حذف الواجب بنجاح");
      await load();
    } catch (e) {
      setError(e?.message || "فشل حذف الواجب");
    }
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">إدارة الواجبات</h1>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
            disabled={loading}
          >
            تحديث
          </button>

          <button
            onClick={() => {
              setEditingAssignment(null);
              setOpenModal(true);
            }}
            className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
          >
            + إضافة واجب
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      {info ? (
        <div className="mt-4 p-3 rounded bg-green-50 text-green-700 text-sm">
          {info}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-sm text-gray-600">جاري التحميل...</div>
      ) : assignments.length === 0 ? (
        <div className="mt-6 p-4 rounded bg-white border text-sm text-gray-700">
          لا يوجد واجبات بعد.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {assignments.map((a) => (
            <div
              key={a._id}
              className="bg-white border rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{a.title}</div>

                  {a?.courseId?.title ? (
                    <div className="text-xs text-gray-500 mt-1">
                      الكورس: {a.courseId.title}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAssignment(a);
                      setOpenModal(true);
                    }}
                    className="px-3 py-1.5 rounded bg-blue-600 text-white text-xs"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() => handleDelete(a._id)}
                    className="px-3 py-1.5 rounded bg-red-600 text-white text-xs"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {a?.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {a.description}
                </p>
              ) : null}

              <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                {a?.dueDate ? (
                  <div>
                    <span className="font-medium">آخر موعد:</span>{" "}
                    {new Date(a.dueDate).toLocaleString()}
                  </div>
                ) : null}

                {a?.fileUrl ? (
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-700 underline"
                  >
                    ملف الواجب
                  </a>
                ) : null}

                <Link
                  to="/teacher/submissions"
                  className="text-emerald-700 underline"
                >
                  عرض التسليمات
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Modal إضافة / تعديل */}
      <AssignmentFormModal
        open={openModal}
        initialData={editingAssignment}
        onClose={() => {
          setOpenModal(false);
          setEditingAssignment(null);
        }}
        onSuccess={() => {
          setOpenModal(false);
          setEditingAssignment(null);
          load();
        }}
      />
    </div>
  );
}
