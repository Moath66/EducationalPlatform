// frontend/src/pages/Landing/LandingPage.jsx
import MainLayout from "../../layouts/MainLayout";
import { useSettings } from "../../context/SettingsContext";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const { settings, loading } = useSettings();

  const platformName = settings?.platformName || "mnhlyn";
  const platformDescription =
    settings?.platformDescription ||
    "حل عملي لإدارة المتعلمين، المدربين، الجلسات، المحتوى، والواجبات — في مكان واحد.";
  const contactEmail = settings?.contactEmail || "";
  const phoneOrWhatsapp = settings?.phoneOrWhatsapp || "";

  return (
    <MainLayout>
      <div className="bg-slate-50 text-slate-900" dir="rtl">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50 to-slate-50" />
          <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-14 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-xs text-slate-600">
                  ✅ منصة جاهزة للشركات التعليمية ومراكز التدريب
                </div>

                <h1 className="mt-4 text-3xl md:text-5xl font-extrabold leading-tight">
                  {loading ? "..." : `مرحباً بك في ${platformName}`}
                </h1>

                <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
                  {loading ? "جاري تحميل الوصف..." : platformDescription}
                </p>

                <div className="mt-6 flex flex-wrap gap-3 justify-start">
                  <Link
                    to="/login"
                    className="px-6 py-3 rounded-2xl bg-teal-600 text-white font-semibold shadow-sm hover:bg-teal-700 transition"
                  >
                    ابدأ الآن
                  </Link>

                  <Link
                    to="/features"
                    className="px-6 py-3 rounded-2xl bg-white border font-semibold text-slate-800 hover:bg-slate-50 transition"
                  >
                    استعراض المميزات
                  </Link>
                </div>

                {(contactEmail || phoneOrWhatsapp) && (
                  <div className="mt-6 bg-white border rounded-2xl p-4 text-sm">
                    <div className="font-bold mb-2">التواصل</div>

                    {contactEmail && (
                      <div className="text-slate-700">
                        📧 <span className="font-medium">البريد:</span>{" "}
                        <a
                          className="text-teal-700 underline"
                          href={`mailto:${contactEmail}`}
                        >
                          {contactEmail}
                        </a>
                      </div>
                    )}

                    {phoneOrWhatsapp && (
                      <div className="text-slate-700 mt-2">
                        📞 <span className="font-medium">الهاتف/واتساب:</span>{" "}
                        <a
                          className="text-teal-700 underline"
                          href={`tel:${phoneOrWhatsapp}`}
                        >
                          {phoneOrWhatsapp}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right card */}
              <div className="bg-white border rounded-3xl p-6 shadow-sm">
                <div className="text-sm text-slate-600">نظرة سريعة</div>
                <div className="mt-2 text-xl font-extrabold text-slate-900">
                  تشغيل وإدارة التدريب بثقة
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <MiniCard
                    title="إدارة المستخدمين"
                    desc="طلاب / مدربين / مشرفين"
                  />
                  <MiniCard title="جلسات مباشرة" desc="روابط + جدول + حضور" />
                  <MiniCard title="محتوى ودروس" desc="PDF + روابط + تنظيم" />
                  <MiniCard
                    title="واجبات وتسليمات"
                    desc="رفع + تقييم + متابعة"
                  />
                </div>

                <div className="mt-5 text-xs text-slate-500">
                  *يمكن تخصيص الاسم والوصف وبيانات التواصل من إعدادات المنصة.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS PREVIEW */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold">الفوائد</h2>
              <p className="text-sm text-slate-600 mt-1">
                تقليل الوقت الضائع وزيادة وضوح الأداء.
              </p>
            </div>
            <Link
              to="/benefits"
              className="text-sm text-teal-700 hover:underline font-semibold"
            >
              عرض كل الفوائد
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InfoCard
              title="وضوح ومتابعة"
              desc="مؤشرات واضحة للجلسات والطلاب والواجبات داخل لوحة تحكم واحدة."
            />
            <InfoCard
              title="تنظيم العمليات"
              desc="هيكلة تعليمية محسوبة: كورسات → دروس → واجبات → تسليمات."
            />
            <InfoCard
              title="تقارير قابلة للتوسع"
              desc="جاهزة لإضافة رسوم بيانية وتقارير أداء حسب احتياج الشركة."
            />
          </div>
        </section>

        {/* FEATURES PREVIEW */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 pb-14">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold">المميزات</h2>
              <p className="text-sm text-slate-600 mt-1">
                وظائف أساسية تغطي احتياج التدريب اليومي.
              </p>
            </div>
            <Link
              to="/features"
              className="text-sm text-teal-700 hover:underline font-semibold"
            >
              عرض كل المميزات
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureRow
              title="لوحات متعددة الأدوار"
              desc="مشرف / مدرب / متدرب بصلاحيات واضحة."
            />
            <FeatureRow
              title="رفع ملفات منظمة"
              desc="Study Files لرفع الخطط والجداول بصلاحيات Audience."
            />
            <FeatureRow
              title="تسليمات وتقييم"
              desc="رفع الحل، متابعة، وتقييم من المدرب."
            />
            <FeatureRow
              title="حضور الجلسات"
              desc="تسجيل حضور مرن ومتابعة السجل."
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="text-sm opacity-90">
              © {new Date().getFullYear()} {platformName} — All rights reserved.
            </div>

            <div className="text-xs opacity-70 flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-right">
              <span>
                Built with MERN • Secure access • Role-based dashboards
              </span>
              <span className="hidden md:inline">—</span>
              <span>
                Developed by{" "}
                <span className="font-semibold text-teal-400">
                  Eng.Moath_dev
                </span>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}

function MiniCard({ title, desc }) {
  return (
    <div className="border rounded-2xl p-3 bg-slate-50">
      <div className="font-bold text-slate-900 text-sm">{title}</div>
      <div className="text-xs text-slate-600 mt-1">{desc}</div>
    </div>
  );
}

function InfoCard({ title, desc }) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="font-extrabold text-slate-900">{title}</div>
      <div className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</div>
    </div>
  );
}

function FeatureRow({ title, desc }) {
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
