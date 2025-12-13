import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSettings, updateSettings } from "../../../api/settingApi";
import { useSettings } from "../../context/SettingsContext";

export default function Settings() {
  const [platformName, setPlatformName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { reloadSettings } = useSettings();

  useEffect(() => {
    getSettings().then((data) => {
      setPlatformName(data.platformName || "");
      setContactEmail(data.contactEmail || "");
      setLogoUrl(data.logoUrl || "");
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateSettings({ platformName, contactEmail, logoUrl });
      await reloadSettings(); // 🔥 يحدث الاسم + الشعار في Sidebar فورًا
      alert("تم حفظ الإعدادات بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">إعدادات المنصة</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow max-w-xl space-y-4"
      >
        <div>
          <label className="block mb-1 text-sm font-medium">اسم المنصة</label>
          <input
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">بريد التواصل</label>
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            رابط الشعار (Logo URL)
          </label>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="https://example.com/logo.png"
          />
        </div>

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

        <button
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {loading ? "جاري الحفظ..." : "حفظ"}
        </button>
      </form>
    </AdminLayout>
  );
}
