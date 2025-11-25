import AdminLayout from "../../layouts/AdminLayout";

export default function Settings() {
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">إعدادات المنصة</h2>
      <p className="text-sm text-slate-500">
        سيتم لاحقاً إضافة إعدادات مثل اسم المنصة، الشعار، البريد الافتراضي
        للتواصل.
      </p>
    </AdminLayout>
  );
}
