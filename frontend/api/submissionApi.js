// frontend/api/submissionApi.js
import apiClient from "./apiClient";

/**
 * STUDENT
 * Submit/Update solution
 * POST /api/submissions
 * body: { assignmentId, fileUrl }
 */
export async function submitAssignmentSolution(payload) {
  const res = await apiClient.post("/api/submissions", payload);
  return res.data; // { message, payload }
}

/**
 * STUDENT
 * Get my submissions (optional: assignmentId)
 * GET /api/submissions/my?assignmentId=
 */
export async function fetchMySubmissions(params = {}) {
  const res = await apiClient.get("/api/submissions/my", { params });
  return res.data; // { message, payload: [...] }
}

/**
 * TEACHER
 * Get submissions for assignment
 * GET /api/submissions/assignment/:assignmentId
 */
export async function fetchSubmissionsForAssignment(assignmentId) {
  if (!assignmentId) throw new Error("assignmentId is required");
  const res = await apiClient.get(
    `/api/submissions/assignment/${assignmentId}`
  );
  return res.data; // { message, payload: [...] }
}

/**
 * TEACHER
 * Grade submission
 * PUT /api/submissions/:id/grade
 * body: { grade }
 */
export async function gradeSubmission(submissionId, grade) {
  if (!submissionId) throw new Error("submissionId is required");
  const res = await apiClient.put(`/api/submissions/${submissionId}/grade`, {
    grade,
  });
  return res.data; // { message, payload }
}
