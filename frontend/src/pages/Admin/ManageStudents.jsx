import AdminLayout from "../../layouts/AdminLayout";

export default function ManageStudents() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">إدارة الطلاب</h2>
      <p className="text-sm text-slate-500">
        هنا سيتم لاحقاً عرض الطلاب مع إمكانيات CRUD للمدير.
      </p>
    </AdminLayout>
  );
}
