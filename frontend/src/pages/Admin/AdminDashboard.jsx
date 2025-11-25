import AdminLayout from "../../layouts/AdminLayout";

export default function AdminDashboard() {
  // لاحقاً هنجيب الإحصائيات من الـ API
  const stats = [
    { label: "عدد الطلاب", value: 120, badge: "طلاب نشطين" },
    { label: "عدد المعلمين", value: 12, badge: "معلمين مسجلين" },
    { label: "عدد الجلسات", value: 48, badge: "جلسات هذا الأسبوع" },
    { label: "عدد الكورسات", value: 9, badge: "كورسات مفعّلة" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* العنوان */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            لوحة تحكم المشرف
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            نظرة عامة سريعة على حالة المنصة التعليمية.
          </p>
        </div>

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{item.badge}</span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700">
                  i
                </span>
              </div>
              <div className="mt-1">
                <div className="text-2xl font-bold text-slate-800">
                  {item.value}
                </div>
                <div className="text-sm text-slate-600 mt-1">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* مكان مخصص للجداول / الإحصائيات القادمة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm">
              آخر الجداول الدراسية المرفوعة
            </h3>
            <p className="text-xs text-slate-500">
              سيتم ربط هذه القائمة بالـ API لاحقاً لعرض أحدث الجداول والخطط.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-semibold text-slate-800 mb-2 text-sm">
              إحصائيات سريعة
            </h3>
            <p className="text-xs text-slate-500">
              يمكن لاحقاً إضافة رسم بياني بسيط لعرض عدد الجلسات خلال الأيام
              الماضية.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
