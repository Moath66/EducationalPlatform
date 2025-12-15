// frontend/src/pages/Teacher/TeacherSubmission.jsx
import { useEffect, useMemo, useState } from "react";

import { fetchTeacherAssignments } from "../../../api/assignmentApi";
import {
  fetchSubmissionsForAssignment,
  gradeSubmission,
} from "../../../api/submissionApi";

import SubmissionsTable from "../../components/teacher/SubmissionsTable";

export default function TeacherSubmission() {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");

  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const selectedAssignment = useMemo(() => {
    return assignments.find(
      (a) => String(a?._id) === String(selectedAssignmentId)
    );
  }, [assignments, selectedAssignmentId]);

  async function loadAssignments() {
    setLoading(true);
    setError("");
    try {
      const res = await fetchTeacherAssignments();
      const list = res?.payload || [];
      setAssignments(list);

      // auto select أول واجب
      if (!selectedAssignmentId && list.length > 0) {
        setSelectedAssignmentId(String(list[0]._id));
      }
    } catch (e) {
      setError(e?.message || "فشل تحميل الواجبات");
    } finally {
      setLoading(false);
    }
  }

  async function loadSubmissions(assignmentId) {
    if (!assignmentId) return;
    setSubmissionsLoading(true);
    setError("");
    setInfo("");
    try {
      const res = await fetchSubmissionsForAssignment(assignmentId);
      setSubmissions(res?.payload || []);
    } catch (e) {
      setError(e?.message || "فشل تحميل التسليمات");
      setSubmissions([]);
    } finally {
      setSubmissionsLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAssignmentId) return;
    loadSubmissions(selectedAssignmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssignmentId]);

  const handleGrade = async (submissionId, grade) => {
    setError("");
    setInfo("");
    try {
      await gradeSubmission(submissionId, grade);
      setInfo("تم حفظ التقييم ✅");
      await loadSubmissions(selectedAssignmentId);
    } catch (e) {
      setError(e?.message || "فشل حفظ التقييم");
    }
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl md:text-2xl font-bold">تسليمات الطلاب</h1>

        <button
          onClick={() => {
            loadAssignments();
            if (selectedAssignmentId) loadSubmissions(selectedAssignmentId);
          }}
          className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
          disabled={loading || submissionsLoading}
        >
          تحديث
        </button>
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

      {/* اختيار الواجب */}
      <div className="mt-6 bg-white border rounded-xl p-4">
        <div className="text-sm text-gray-700 font-medium mb-2">
          اختر الواجب
        </div>

        {loading ? (
          <div className="text-sm text-gray-600">جاري تحميل الواجبات...</div>
        ) : assignments.length === 0 ? (
          <div className="text-sm text-gray-700">لا يوجد واجبات بعد.</div>
        ) : (
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm bg-white"
          >
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.title} {a?.courseId?.title ? `— (${a.courseId.title})` : ""}
              </option>
            ))}
          </select>
        )}

        {selectedAssignment?.dueDate ? (
          <div className="text-xs text-gray-500 mt-2">
            آخر موعد: {new Date(selectedAssignment.dueDate).toLocaleString()}
          </div>
        ) : null}
      </div>

      {/* جدول التسليمات */}
      <div className="mt-6">
        {submissionsLoading ? (
          <div className="text-sm text-gray-600">جاري تحميل التسليمات...</div>
        ) : (
          <SubmissionsTable submissions={submissions} onGrade={handleGrade} />
        )}
      </div>
    </div>
  );
}
