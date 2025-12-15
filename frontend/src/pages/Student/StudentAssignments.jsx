// frontend/src/pages/Student/StudentAssignments.jsx
import { useEffect, useMemo, useState } from "react";

import { fetchStudentAssignments } from "../../../api/assignmentApi";
import { fetchMySubmissions } from "../../../api/submissionApi";
import SubmitModal from "../../components/student/SubmitModal";

export default function StudentAssignments() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);

  const submissionsMap = useMemo(() => {
    const map = new Map();
    for (const s of submissions || []) {
      const aId = s?.assignmentId?._id || s?.assignmentId;
      if (aId) map.set(String(aId), s);
    }
    return map;
  }, [submissions]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const aRes = await fetchStudentAssignments();
      const aList = aRes?.payload || [];

      const sRes = await fetchMySubmissions();
      const sList = sRes?.payload || [];

      setAssignments(aList);
      setSubmissions(sList);
    } catch (e) {
      setError(e?.message || "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
  };

  const getStatusBadge = (submission) => {
    if (!submission) {
      return (
        <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
          لم يتم التسليم
        </span>
      );
    }

    const grade = submission?.grade;
    if (grade === null || grade === undefined) {
      return (
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
          تم التسليم (بانتظار التقييم)
        </span>
      );
    }

    return (
      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
        تم التقييم: {grade}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">الواجبات</h1>

        <button
          onClick={load}
          className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
          disabled={loading}
        >
          {loading ? "جاري..." : "تحديث"}
        </button>
      </div>

      {error ? (
        <div className="mt-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 text-sm text-gray-600">جاري تحميل الواجبات...</div>
      ) : assignments.length === 0 ? (
        <div className="mt-6 p-4 rounded bg-white border text-sm text-gray-700">
          لا يوجد واجبات حالياً.
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {assignments.map((a) => {
            const id = a?._id;
            const submission = submissionsMap.get(String(id));

            return (
              <div
                key={id}
                className="bg-white border rounded-xl p-4 md:p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{a?.title}</div>

                    {a?.courseId?.title ? (
                      <div className="text-xs text-gray-500 mt-1">
                        الكورس: {a.courseId.title}
                      </div>
                    ) : null}
                  </div>

                  <div className="shrink-0">{getStatusBadge(submission)}</div>
                </div>

                {a?.description ? (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {a.description}
                  </p>
                ) : null}

                <div className="text-sm text-gray-600 flex flex-wrap gap-4">
                  <div>
                    <span className="font-medium">آخر موعد:</span>{" "}
                    {formatDate(a?.dueDate)}
                  </div>

                  {a?.fileUrl ? (
                    <a
                      href={a.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-700 underline"
                    >
                      ملف الواجب (PDF)
                    </a>
                  ) : null}

                  {submission?.fileUrl ? (
                    <a
                      href={submission.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-700 underline"
                    >
                      ملف حلك المرفوع
                    </a>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => {
                      setSelectedAssignmentId(id);
                      setOpenModal(true);
                    }}
                    className="px-3 py-2 rounded bg-emerald-600 text-white text-sm"
                  >
                    {submission ? "تحديث الحل" : "رفع الحل"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ Submit Modal */}
      <SubmitModal
        open={openModal}
        assignmentId={selectedAssignmentId}
        onClose={() => {
          setOpenModal(false);
          setSelectedAssignmentId(null);
        }}
        onSuccess={() => load()}
      />
    </div>
  );
}
