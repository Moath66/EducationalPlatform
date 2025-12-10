// frontend/src/pages/Student/StudentProfilePage.jsx
import { useEffect, useState } from "react";
import { fetchMyProfile, updateMyProfile } from "../../../api/profileApi";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    grade: "",
  });

  // تحميل البروفايل
  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setOk("");
        setLoading(true);

        const data = await fetchMyProfile(); // { user }
        setUser(data.user);

        setForm({
          name: data.user?.name || "",
          phone: data.user?.phone || "",
          grade: data.user?.grade || "",
        });
      } catch (e) {
        setErr(e.message || "فشل تحميل بيانات الملف الشخصي");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onChange(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!form.name.trim()) return setErr("الاسم مطلوب.");

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        phone: (form.phone || "").trim(),
        grade: (form.grade || "").trim(),
      };

      const data = await updateMyProfile(payload); // { message, user }
      setUser(data.user);

      // حدّث localStorage عشان باقي الصفحات تعرض الاسم الجديد
      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (saved) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...saved,
            name: data.user?.name ?? saved.name,
            phone: data.user?.phone ?? saved.phone,
            grade: data.user?.grade ?? saved.grade,
          })
        );
      }

      setOk(data.message || "تم تحديث الملف بنجاح ✅");
    } catch (e2) {
      setErr(e2.message || "فشل حفظ التعديلات");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="text-right">
          <h1 className="text-3xl font-bold">👤 الملف الشخصي</h1>
          <p className="text-slate-500 text-sm mt-1">
            حدّث بياناتك الأساسية. (البريد والرتبة للعرض فقط)
          </p>
        </div>
      </div>

      {err ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 mb-4 text-sm text-right">
          {err}
        </div>
      ) : null}

      {ok ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 mb-4 text-sm text-right">
          {ok}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-bold text-slate-800">بيانات الحساب</h2>
          <p className="text-xs text-slate-500 mt-1">
            سيتم حفظ التعديلات مباشرة في قاعدة البيانات.
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-slate-500">جاري التحميل...</div>
        ) : (
          <form onSubmit={onSubmit} className="p-5 space-y-5">
            {/* معلومات ثابتة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">البريد الإلكتروني</p>
                <p className="font-semibold text-slate-800">
                  {user?.email || "—"}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">الدور</p>
                <p className="font-semibold text-slate-800">
                  {user?.role === "student" ? "طالب" : user?.role || "—"}
                </p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-right">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الاسم
                </label>
                <input
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="اكتب اسمك"
                />
              </div>

              <div className="text-right">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  رقم الجوال
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => onChange("phone", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="مثال: 05xxxxxxxx"
                />
              </div>

              <div className="text-right md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الصف / المستوى
                </label>
                <input
                  value={form.grade}
                  onChange={(e) => onChange("grade", e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                  placeholder="مثال: ثاني ثانوي / Level 2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOk("");
                  setErr("");
                  setForm({
                    name: user?.name || "",
                    phone: user?.phone || "",
                    grade: user?.grade || "",
                  });
                }}
                className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-50"
                disabled={saving}
              >
                تراجع
              </button>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
