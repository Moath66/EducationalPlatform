import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSettings, updateSettings } from "../../../api/settingApi";
import { useSettings } from "../../context/SettingsContext";

export default function Settings() {
  const [platformName, setPlatformName] = useState("");
  const [platformDescription, setPlatformDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phoneOrWhatsapp, setPhoneOrWhatsapp] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [darkMode, setDarkMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const { reloadSettings } = useSettings();

  // ✅ تحميل الإعدادات من السيرفر
  useEffect(() => {
    getSettings().then((data) => {
      setPlatformName(data.platformName || "");
      setPlatformDescription(data.platformDescription || "");
      setContactEmail(data.contactEmail || "");
      setPhoneOrWhatsapp(data.phoneOrWhatsapp || "");
      setLogoUrl(data.logoUrl || "");
      setFaviconUrl(data.faviconUrl || "");
      setPrimaryColor(data.primaryColor || "#2563eb");
      setDarkMode(!!data.darkMode);
    });
  }, []);

  // ✅ تطبيق فوري للـ Dark Mode (حتى قبل الحفظ)
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // ✅ (اختياري) CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty("--primary", primaryColor);
  }, [primaryColor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({
        platformName,
        platformDescription,
        contactEmail,
        phoneOrWhatsapp,
        logoUrl,
        faviconUrl,
        primaryColor,
        darkMode,
      });

      await reloadSettings();
      alert("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-3">
      {children}
    </h3>
  );

  const inputBase =
    "w-full rounded px-3 py-2 border bg-white text-slate-900 placeholder:text-slate-400 " +
    "dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 " +
    "border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700";

  const labelBase = "block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200";

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">
        إعدادات المنصة
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow max-w-2xl space-y-8 border border-slate-200 dark:border-slate-800"
      >
        {/* General */}
        <section>
          <SectionTitle>إعدادات عامة</SectionTitle>

          <div className="space-y-4">
            <div>
              <label className={labelBase}>اسم المنصة</label>
              <input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelBase}>وصف المنصة</label>
              <textarea
                value={platformDescription}
                onChange={(e) => setPlatformDescription(e.target.value)}
                className={`${inputBase} min-h-[90px]`}
                placeholder="مثال: منصة تعليمية لإدارة الطلاب والمعلمين والجلسات..."
              />
            </div>

            <div>
              <label className={labelBase}>رابط الشعار (Logo URL)</label>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className={inputBase}
                placeholder="https://.../logo.png"
              />

              {logoUrl && (
                <div className="mt-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    معاينة الشعار:
                  </p>
                  <div className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded p-2 bg-white dark:bg-slate-950">
                    <img src={logoUrl} alt="logo" className="h-16 object-contain" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className={labelBase}>رابط أيقونة الموقع (Favicon URL)</label>
              <input
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className={inputBase}
                placeholder="https://.../favicon.png"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                لازم يكون رابط صورة مباشر (png/ico/svg)، مو رابط موقع.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <SectionTitle>التواصل</SectionTitle>

          <div className="space-y-4">
            <div>
              <label className={labelBase}>بريد التواصل</label>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={inputBase}
              />
            </div>

            <div>
              <label className={labelBase}>رقم الهاتف / واتساب</label>
              <input
                value={phoneOrWhatsapp}
                onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
                className={inputBase}
                placeholder="+9665xxxxxxxx"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <SectionTitle>المظهر</SectionTitle>

          <div className="space-y-4">
            {/* Primary Color */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className={labelBase}>اللون الأساسي (Primary Color)</label>
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className={inputBase}
                  placeholder="#2563eb"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Hex مثل: #2563eb
                </p>
              </div>

              <div
                className="w-14 h-14 rounded border border-slate-200 dark:border-slate-800"
                style={{ background: primaryColor }}
                title={primaryColor}
              />
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between border border-slate-200 dark:border-slate-800 rounded p-3 bg-slate-50 dark:bg-slate-950">
              <div>
                <p className="font-medium text-sm text-slate-800 dark:text-slate-100">
                  الوضع الليلي
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  يتطبق فورًا حتى قبل الحفظ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode((v) => !v)}
                className="w-14 h-8 rounded-full transition flex items-center px-1 bg-slate-300 dark:bg-slate-700"
                style={{ backgroundColor: darkMode ? primaryColor : undefined }}
                aria-label="toggle dark mode"
              >
                <span
                  className={`w-6 h-6 rounded-full bg-white transition ${
                    darkMode ? "translate-x-0" : "-translate-x-6"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="text-white px-6 py-2 rounded transition disabled:opacity-60 hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? "جاري الحفظ..." : "حفظ"}
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            الحفظ يثبت الإعدادات في قاعدة البيانات.
          </span>
        </div>
      </form>
    </AdminLayout>
  );
}
