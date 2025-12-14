import MainLayout from "../../layouts/MainLayout";
import { useSettings } from "../../context/SettingsContext";

export default function LandingPage() {
  const { settings, loading } = useSettings();

  const platformName = settings?.platformName || "المنصة التعليمية";
  const platformDescription =
    settings?.platformDescription ||
    "نظام متكامل لإدارة الطلاب والمعلمين والفصول الافتراضية";
  const contactEmail = settings?.contactEmail || "";
  const phoneOrWhatsapp = settings?.phoneOrWhatsapp || "";

  return (
    <MainLayout>
      {/* ✅ حطينا dark: هنا عشان يبان الدارك مود */}
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <div className="text-center max-w-2xl px-4">
          <h1 className="text-4xl font-bold mb-4">
            {loading ? "..." : `مرحباً بك في ${platformName}`}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300">
            {loading ? "جاري تحميل الوصف..." : platformDescription}
          </p>

          {(contactEmail || phoneOrWhatsapp) && (
            <div className="mt-8 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm">
              <p className="font-semibold mb-2">التواصل</p>

              {contactEmail && (
                <p className="text-slate-700 dark:text-slate-200">
                  📧 <span className="font-medium">البريد:</span>{" "}
                  <a
                    className="text-primary underline"
                    href={`mailto:${contactEmail}`}
                  >
                    {contactEmail}
                  </a>
                </p>
              )}

              {phoneOrWhatsapp && (
                <p className="text-slate-700 dark:text-slate-200 mt-2">
                  📞 <span className="font-medium">الهاتف/واتساب:</span>{" "}
                  <a
                    className="text-primary underline"
                    href={`tel:${phoneOrWhatsapp}`}
                  >
                    {phoneOrWhatsapp}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
