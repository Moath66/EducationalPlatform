import AdminLayout from "../../layouts/AdminLayout";

export default function ClassSessions() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        إدارة جلسات الفصول
      </h2>
      <p className="text-sm text-slate-500">
        سيتم لاحقاً إضافة نموذج لإنشاء الجلسة (اسم – تاريخ – وقت – رابط Google
        Meet).
      </p>
    </AdminLayout>
  );
}
