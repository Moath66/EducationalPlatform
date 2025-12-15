// frontend/src/pages/Landing/HelpPage.jsx
import MainLayout from "../../layouts/MainLayout";

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            المساعدة والدعم
          </h1>
          <p className="text-slate-600 mt-2">
            إجابات سريعة لأكثر الأسئلة شيوعًا وطريقة استخدام المنصة.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Faq
              q="كيف أسجّل الدخول؟"
              a="من زر تسجيل الدخول في الأعلى، ثم اختر الحساب المناسب (مشرف/مدرب/متدرب)."
            />
            <Faq
              q="كيف أرفع خطة أو جدول؟"
              a="من لوحة المشرف → الخطط والجداول → رفع ملف (PDF/صورة)."
            />
            <Faq
              q="كيف يرفع المتدرب واجب؟"
              a="من المتدرب → الواجبات → رفع الحل، ثم يظهر للمدرب في صفحة التسليمات."
            />
            <Faq
              q="أواجه مشكلة في الرابط أو الجلسة"
              a="تأكد من رابط Meet داخل الجلسة، ويمكن للمشرف/المدرب تعديلها من إدارة الجلسات."
            />
          </div>

          <div className="mt-8 bg-white border rounded-2xl p-5">
            <h2 className="font-extrabold text-slate-900">نصيحة تشغيل</h2>
            <p className="text-slate-600 mt-2">
              ابدأ بتجهيز: (المستخدمين → الكورسات → ربط المتدربين بالكورس →
              الجلسات → الدروس → الواجبات).
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Faq({ q, a }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="font-extrabold text-slate-900">{q}</div>
      <div className="text-sm text-slate-600 mt-2 leading-relaxed">{a}</div>
    </div>
  );
}
