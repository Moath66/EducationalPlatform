// frontend/src/pages/Student/SubmitAssignment.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { fetchStudentAssignments } from "../../../api/assignmentApi";
import { fetchMySubmissions } from "../../../api/submissionApi";
import SubmitModal from "../../components/student/SubmitModal";

export default function SubmitAssignment() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [assignment, setAssignment] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openModal, setOpenModal] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // 1) جيب الواجب من واجبات الطالب
      const aRes = await fetchStudentAssignments();
      const list = aRes?.payload || [];
      const found = list.find((x) => String(x?._id) === String(assignmentId));
      setAssignment(found || null);

      // 2) جيب تسليمي الحالي (إن وجد)
      const sRes = await fetchMySubmissions({ assignmentId });
      const my = (sRes?.payload || [])[0] || null;
      setExistingSubmission(my);
    } catch (e) {
      setError(e?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!assignmentId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">رفع حل الواجب</h1>

        <Link
          to="/student/assignments"
          className="px-3 py-2 rounded bg-gray-100 text-gray-900 text-sm"
        >
          رجوع
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-gray-600">جاري التحميل...</div>
      ) : (
        <div className="mt-6 grid gap-4">
          {/* معلومات الواجب */}
          <div className="bg-white border rounded-xl p-4">
            <div className="text-sm text-gray-600">الواجب:</div>
            <div className="text-lg font-semibold mt-1">
              {assignment?.title || "—"}
            </div>

            {assignment?.description ? (
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                {assignment.description}
              </p>
            ) : null}

            <div className="mt-3 text-sm text-gray-600 flex flex-wrap gap-4">
              {assignment?.dueDate ? (
                <div>
                  <span className="font-medium">آخر موعد:</span>{" "}
                  {new Date(assignment.dueDate).toLocaleString()}
                </div>
              ) : null}

              {assignment?.fileUrl ? (
                <a
                  href={assignment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-700 underline"
                >
                  ملف الواجب (PDF)
                </a>
              ) : null}
            </div>
          </div>

          {/* التسليم */}
          <div className="bg-white border rounded-xl p-4">
            <div className="text-sm text-gray-700 font-medium">
              تسليم الواجب
            </div>

            {existingSubmission?.fileUrl ? (
              <div className="mt-3 text-sm">
                <a
                  href={existingSubmission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-green-700 underline"
                >
                  عرض ملف حلك الحالي
                </a>
              </div>
            ) : (
              <div className="mt-3 text-sm text-gray-600">
                لا يوجد تسليم سابق.
              </div>
            )}

            {existingSubmission?.grade !== null &&
            existingSubmission?.grade !== undefined ? (
              <div className="mt-3 text-sm">
                <span className="font-medium">تم تقييمك:</span>{" "}
                <span className="text-green-700">
                  {existingSubmission.grade}
                </span>
              </div>
            ) : existingSubmission ? (
              <div className="mt-3 text-sm text-blue-700">
                لديك تسليم سابق (بانتظار التقييم).
              </div>
            ) : null}

            {error ? (
              <div className="mt-3 p-3 rounded bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mt-3 p-3 rounded bg-green-50 text-green-700 text-sm">
                {success}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={load}
                className="px-3 py-2 rounded bg-gray-100 text-gray-900 text-sm"
              >
                تحديث
              </button>

              <button
                type="button"
                onClick={() => setOpenModal(true)}
                className="px-4 py-2 rounded bg-emerald-600 text-white text-sm"
              >
                {existingSubmission ? "تحديث الحل" : "رفع الحل"}
              </button>
            </div>
          </div>

          {/* ✅ Submit Modal */}
          <SubmitModal
            open={openModal}
            assignmentId={assignmentId}
            onClose={() => setOpenModal(false)}
            onSuccess={() => {
              // بعد نجاح التسليم
              load();
              setSuccess("تم رفع الحل بنجاح");
              setTimeout(() => navigate("/student/assignments"), 800);
            }}
          />
        </div>
      )}
    </div>
  );
}
