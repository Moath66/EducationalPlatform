// frontend/src/pages/Landing/BenefitsPage.jsx
import MainLayout from "../../layouts/MainLayout";

export default function BenefitsPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            الفوائد
          </h1>
          <p className="text-slate-600 mt-2">
            لماذا هذه المنصة مناسبة لشركة تدريب أو فريق تعليم داخلي؟
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              title="تقليل الوقت التشغيلي"
              desc="كل شيء في لوحة واحدة بدل ملفات متفرقة ومتابعة يدوية."
            />
            <Card
              title="متابعة واضحة للأداء"
              desc="جلسات، حضور، واجبات، وتسليمات تظهر بحالة واضحة."
            />
            <Card
              title="تحكم بالصلاحيات"
              desc="مشرف/مدرب/متدرب بصلاحيات محددة تقلل الأخطاء."
            />
            <Card
              title="قابل للتوسع"
              desc="سهل تضيف تقارير ورسوم بيانية وميزات إضافية حسب احتياج العمل."
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Card({ title, desc }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="font-extrabold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}
