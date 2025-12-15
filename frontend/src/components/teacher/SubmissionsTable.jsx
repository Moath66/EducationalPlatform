// frontend/src/components/teacher/SubmissionsTable.jsx
import { useMemo, useState } from "react";

export default function SubmissionsTable({ submissions = [], onGrade }) {
  const [localGrades, setLocalGrades] = useState({}); // submissionId -> grade string
  const [savingId, setSavingId] = useState(null);

  const rows = useMemo(() => {
    return (submissions || []).map((s) => {
      const student = s?.studentId;
      return {
        id: s?._id,
        studentName: student?.name || "—",
        studentEmail: student?.email || "—",
        studentGrade: student?.grade || "—",
        fileUrl: s?.fileUrl || "",
        grade: s?.grade,
        createdAt: s?.createdAt,
      };
    });
  }, [submissions]);

  const formatDate = (d) => {
    if (!d) return "—";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString();
  };

  const getValue = (row) => {
    const local = localGrades[row.id];
    if (local !== undefined) return local;
    return row.grade === null || row.grade === undefined
      ? ""
      : String(row.grade);
  };

  const handleSave = async (row) => {
    const value = getValue(row).trim();
    if (!value) return;

    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    try {
      setSavingId(row.id);
      await onGrade?.(row.id, numeric);
      // بعد الحفظ امسح local (عشان يرجع ياخذ من الداتا الجديدة)
      setLocalGrades((prev) => {
        const copy = { ...prev };
        delete copy[row.id];
        return copy;
      });
    } finally {
      setSavingId(null);
    }
  };

  if (!rows.length) {
    return (
      <div
        className="bg-white border rounded-xl p-4 text-sm text-gray-700"
        dir="rtl"
      >
        لا يوجد تسليمات لهذا الواجب.
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden" dir="rtl">
      <div className="p-4 border-b">
        <h2 className="font-semibold">قائمة التسليمات</h2>
        <p className="text-xs text-gray-500 mt-1">
          يمكنك فتح ملف الطالب ثم إدخال الدرجة وحفظها.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="text-right p-3">الطالب</th>
              <th className="text-right p-3">البريد</th>
              <th className="text-right p-3">المرحلة</th>
              <th className="text-right p-3">تاريخ التسليم</th>
              <th className="text-right p-3">الملف</th>
              <th className="text-right p-3">الدرجة</th>
              <th className="text-right p-3">حفظ</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const value = getValue(row);
              const isSaving = savingId === row.id;

              return (
                <tr key={row.id} className="border-t">
                  <td className="p-3 font-medium">{row.studentName}</td>
                  <td className="p-3">{row.studentEmail}</td>
                  <td className="p-3">{row.studentGrade}</td>
                  <td className="p-3">{formatDate(row.createdAt)}</td>

                  <td className="p-3">
                    {row.fileUrl ? (
                      <a
                        href={row.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline"
                      >
                        فتح الملف
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="p-3">
                    <input
                      value={value}
                      onChange={(e) =>
                        setLocalGrades((prev) => ({
                          ...prev,
                          [row.id]: e.target.value,
                        }))
                      }
                      placeholder="مثلاً 10"
                      className="w-28 border rounded-lg p-2 text-sm"
                      disabled={isSaving}
                      dir="ltr"
                    />
                    {row.grade !== null && row.grade !== undefined ? (
                      <div className="text-xs text-green-700 mt-1">
                        الحالية: {row.grade}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 mt-1">
                        لم يتم التقييم بعد
                      </div>
                    )}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleSave(row)}
                      className="px-3 py-2 rounded bg-emerald-600 text-white text-xs"
                      disabled={isSaving || !value.trim()}
                    >
                      {isSaving ? "جارٍ..." : "حفظ"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
