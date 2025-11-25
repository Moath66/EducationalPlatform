import AdminLayout from "../../layouts/AdminLayout";

export default function ManageTeachers() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">إدارة المعلمين</h2>
      <p className="text-sm text-slate-500">
        هنا سيتم لاحقاً عرض جدول المعلمين مع إمكانية الإضافة، التعديل، والحذف.
      </p>
    </AdminLayout>
  );
}
