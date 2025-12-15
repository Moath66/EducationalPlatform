// frontend/src/pages/Landing/FeaturesPage.jsx
import MainLayout from "../../layouts/MainLayout";

export default function FeaturesPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            المميزات
          </h1>
          <p className="text-slate-600 mt-2">
            مجموعة مميزات أساسية تغطي تشغيل التدريب من البداية للنهاية.
          </p>

          <div className="mt-6 space-y-4">
            <Row
              title="إدارة المستخدمين"
              desc="إضافة/تعديل/حذف المستخدمين وربطهم بالأدوار."
            />
            <Row
              title="إدارة الكورسات"
              desc="إنشاء كورس وربطه بالمدرب والمتدربين."
            />
            <Row
              title="الجلسات المباشرة + الحضور"
              desc="Meet link + جدول + تسجيل حضور."
            />
            <Row
              title="الدروس والمواد"
              desc="رفع ملفات وروابط YouTube وتنظيم المحتوى."
            />
            <Row
              title="الواجبات والتسليمات"
              desc="رفع الحل + تقييم + متابعة حالة التسليم."
            />
            <Row
              title="Study Files (خطة/جدول)"
              desc="رفع ملفات PDF/صور بصلاحيات audience."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Row({ title, desc }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
        ✓
      </div>
      <div>
        <div className="font-extrabold text-slate-900">{title}</div>
        <div className="text-sm text-slate-600 mt-1 leading-relaxed">
          {desc}
        </div>
      </div>
    </div>
  );
}
