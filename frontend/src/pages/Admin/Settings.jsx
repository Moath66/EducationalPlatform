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
  const [language, setLanguage] = useState("ar");

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
      setLanguage(data.language || "ar");
    });
  }, []);

  // ✅ تطبيق فوري للـ Dark Mode (حتى قبل الحفظ)
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [darkMode]);

  // ✅ تطبيق فوري للغة (RTL/LTR) حتى قبل الحفظ
  useEffect(() => {
    const root = document.documentElement;
    const lang = language === "en" ? "en" : "ar";
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }, [language]);

  // ✅ تطبيق فوري للون الأساسي كـ CSS Variable (يساعدك لاحقًا مع Tailwind advanced)
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
        language,
      });

      await reloadSettings(); // يثبت التغييرات ويطبق favicon وغيرها
      alert("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ children }) => (
    <h3 className="text-lg font-bold text-slate-800 mb-3">{children}</h3>
  );

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">إعدادات المنصة</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow max-w-2xl space-y-8"
      >
        {/* General */}
        <section>
          <SectionTitle>إعدادات عامة</SectionTitle>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">اسم المنصة</label>
              <input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">وصف المنصة</label>
              <textarea
                value={platformDescription}
                onChange={(e) => setPlatformDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 min-h-[90px]"
                placeholder="مثال: منصة تعليمية لإدارة الطلاب والمعلمين والجلسات..."
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">رابط الشعار (Logo URL)</label>
              <input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="https://.../logo.png"
              />
              {logoUrl && (
                <div className="mt-3">
                  <p className="text-sm text-slate-500 mb-1">معاينة الشعار:</p>
                  <img
                    src={logoUrl}
                    alt="logo"
                    className="h-16 object-contain border rounded p-2"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">رابط أيقونة الموقع (Favicon URL)</label>
              <input
                value={faviconUrl}
                onChange={(e) => setFaviconUrl(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="https://.../favicon.png"
              />
              <p className="text-xs text-slate-500 mt-1">
                لازم يكون رابط صورة (png/ico)، مو رابط موقع.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <SectionTitle>التواصل</SectionTitle>

          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">بريد التواصل</label>
              <input
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">رقم الهاتف / واتساب</label>
              <input
                value={phoneOrWhatsapp}
                onChange={(e) => setPhoneOrWhatsapp(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
                <label className="block mb-1 text-sm font-medium">
                  اللون الأساسي (Primary Color)
                </label>
                <input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="#2563eb"
                />
                <p className="text-xs text-slate-500 mt-1">Hex مثل: #2563eb</p>
              </div>

              <div className="w-14 h-14 rounded border" style={{ background: primaryColor }} />
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between border rounded p-3">
              <div>
                <p className="font-medium text-sm">الوضع الليلي</p>
                <p className="text-xs text-slate-500">يتطبق فورًا حتى قبل الحفظ</p>
              </div>

              <button
                type="button"
                onClick={() => setDarkMode((v) => !v)}
                className={`w-14 h-8 rounded-full transition flex items-center px-1 ${
                  darkMode ? "" : "bg-slate-300"
                }`}
                style={{ backgroundColor: darkMode ? primaryColor : undefined }}
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

        {/* Language */}
        <section>
          <SectionTitle>اللغة</SectionTitle>

          <div>
            <label className="block mb-1 text-sm font-medium">لغة الواجهة</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-white"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>

            <p className="text-xs text-slate-500 mt-1">
              الاتجاه RTL/LTR يتغير فورًا. (الترجمة النصية نضيفها لاحقًا لو تبغى)
            </p>
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

          <span className="text-xs text-slate-500">
            الحفظ يثبت الإعدادات في قاعدة البيانات.
          </span>
        </div>
      </form>
    </AdminLayout>
  );
}
