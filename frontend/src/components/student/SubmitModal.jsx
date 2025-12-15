// frontend/src/components/student/SubmitModal.jsx
import { useState } from "react";
import apiClient from "../../../api/apiClient";
import { submitAssignmentSolution } from "../../../api/submissionApi";

export default function SubmitModal({
  assignmentId,
  open,
  onClose,
  onSuccess,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  if (!open) return null;

  const reset = () => {
    setFile(null);
    setError("");
    setProgress(0);
    setUploading(false);
  };

  const handleClose = () => {
    if (uploading) return;
    reset();
    onClose?.();
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("اختر ملف أولاً");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setProgress(0);

      // 1) رفع الملف فعليًا (Cloudinary عبر الباك)
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await apiClient.post("/api/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
        },
      });

      const fileUrl = uploadRes?.data?.fileUrl;
      if (!fileUrl) throw new Error("فشل رفع الملف");

      // 2) ربط الملف بالواجب (submit / update)
      await submitAssignmentSolution({
        assignmentId,
        fileUrl,
      });

      onSuccess?.();
      handleClose();
    } catch (e) {
      setError(e?.message || "حدث خطأ أثناء الرفع");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl w-full max-w-md p-4 md:p-5" dir="rtl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">رفع حل الواجب</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
            disabled={uploading}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
            className="w-full text-sm"
          />

          {file ? (
            <div className="text-xs text-gray-600">
              الملف المختار: <span className="font-medium">{file.name}</span>
            </div>
          ) : null}

          {uploading ? (
            <div className="w-full">
              <div className="h-2 rounded bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">
                جاري الرفع... {progress}%
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="p-2 rounded bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-3 py-2 rounded bg-gray-100 text-gray-900 text-sm"
          >
            إلغاء
          </button>

          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="px-4 py-2 rounded bg-emerald-600 text-white text-sm"
          >
            {uploading ? "جاري الرفع..." : "رفع الحل"}
          </button>
        </div>
      </div>
    </div>
  );
}
