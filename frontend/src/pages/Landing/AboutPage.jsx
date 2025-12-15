// frontend/src/pages/Landing/AboutPage.jsx
import MainLayout from "../../layouts/MainLayout";
import { useSettings } from "../../context/SettingsContext";

export default function AboutPage() {
  const { settings, loading } = useSettings();

  const platformName = settings?.platformName || "mnhlyn";
  const platformDescription =
    settings?.platformDescription ||
    "حل عملي لإدارة المتعلمين، المدربين، الجلسات، المحتوى، والواجبات — في مكان واحد.";

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <div className="bg-white border rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-xs text-teal-800">
              عن المنصة
            </div>

            <h1 className="mt-4 text-2xl md:text-3xl font-extrabold text-slate-900">
              {loading ? "..." : `من نحن — ${platformName}`}
            </h1>

            <p className="mt-3 text-slate-600 leading-relaxed">
              {loading ? "جاري التحميل..." : platformDescription}
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Box
                title="رؤيتنا"
                desc="أن تكون إدارة التدريب أسهل، أوضح، وأسرع لأي شركة أو مركز تدريب."
              />
              <Box
                title="رسالتنا"
                desc="تجميع العمليات اليومية (المحتوى، الجلسات، الحضور، الواجبات) في نظام واحد عملي."
              />
              <Box
                title="قيمنا"
                desc="وضوح، بساطة، أمان، وتجربة استخدام محترفة."
              />
            </div>

            <div className="mt-8 bg-slate-50 border rounded-2xl p-5">
              <h2 className="font-extrabold text-slate-900">ما الذي يميزنا؟</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>✅ لوحات تحكم متعددة الأدوار بصلاحيات واضحة.</li>
                <li>✅ إدارة جلسات مباشرة + حضور.</li>
                <li>✅ إدارة دروس ومواد وواجبات وتسليمات وتقييم.</li>
                <li>✅ رفع الخطط والجداول بصلاحيات (Audience) للعرض الصحيح.</li>
              </ul>
            </div>

            <div className="mt-6 text-xs text-slate-500">
              *يمكن تخصيص الاسم والوصف وبيانات التواصل من إعدادات المنصة.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Box({ title, desc }) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <div className="font-extrabold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}
