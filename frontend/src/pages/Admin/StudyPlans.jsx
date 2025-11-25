import AdminLayout from "../../layouts/AdminLayout";

export default function StudyPlans() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">
        الخطط والجداول الدراسية
      </h2>
      <p className="text-sm text-slate-500">
        هنا سنضيف لاحقاً رفع ملفات PDF للجداول والخطط، مع معاينة وحذف وتحديث.
      </p>
    </AdminLayout>
  );
}
