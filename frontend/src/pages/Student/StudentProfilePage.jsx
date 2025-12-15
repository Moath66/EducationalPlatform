// frontend/src/pages/Student/StudentProfilePage.jsx
import { useEffect, useState } from "react";
import {
  fetchMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../../../api/profileApi";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    grade: "",
  });

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

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

        // ✅ حدّث localStorage user عشان باقي الصفحات تعرض بيانات صحيحة
        const saved = JSON.parse(localStorage.getItem("user") || "null");
        if (saved) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...saved,
              name: data.user?.name ?? saved.name,
              phone: data.user?.phone ?? saved.phone,
              grade: data.user?.grade ?? saved.grade,
              isApproved: data.user?.isApproved ?? saved.isApproved,
              role: data.user?.role ?? saved.role,
              email: data.user?.email ?? saved.email,
              _id: data.user?._id ?? saved._id,
            })
          );
        }
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

  function onChangePw(key, val) {
    setPw((p) => ({ ...p, [key]: val }));
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

      // ✅ حدّث localStorage عشان باقي الصفحات تعرض الاسم الجديد
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

  async function onChangePassword(e) {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!pw.currentPassword) return setErr("اكتب كلمة المرور الحالية.");
    if (!pw.newPassword) return setErr("اكتب كلمة المرور الجديدة.");
    if (pw.newPassword.length < 6)
      return setErr("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
    if (pw.newPassword !== pw.confirmNewPassword)
      return setErr("تأكيد كلمة المرور غير مطابق.");

    try {
      setPwSaving(true);
      const data = await changeMyPassword({
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setOk(data.message || "تم تغيير كلمة المرور ✅");
      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (e2) {
      setErr(e2.message || "فشل تغيير كلمة المرور");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div className="text-right">
          <h1 className="text-3xl font-bold">👤 الملف الشخصي</h1>
          <p className="text-slate-500 text-sm mt-1">
            حدّث بياناتك الأساسية. (البريد والدور للعرض فقط)
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

      {/* ====== بيانات الحساب ====== */}
      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden mb-6">
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

      {/* ====== تغيير كلمة المرور ====== */}
      <div className="bg-white rounded-2xl shadow border border-slate-100 overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="text-lg font-bold text-slate-800">
            تغيير كلمة المرور
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            سيتم تغيير كلمة المرور في قاعدة البيانات.
          </p>
        </div>

        <form onSubmit={onChangePassword} className="p-5 space-y-4">
          <div className="text-right">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => onChangePw("currentPassword", e.target.value)}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-right">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={pw.newPassword}
                onChange={(e) => onChangePw("newPassword", e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                type="password"
                value={pw.confirmNewPassword}
                onChange={(e) =>
                  onChangePw("confirmNewPassword", e.target.value)
                }
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setOk("");
                setErr("");
                setPw({
                  currentPassword: "",
                  newPassword: "",
                  confirmNewPassword: "",
                });
              }}
              className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-50"
              disabled={pwSaving}
            >
              مسح
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 disabled:opacity-60"
              disabled={pwSaving}
            >
              {pwSaving ? "جاري التغيير..." : "تغيير كلمة المرور"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
