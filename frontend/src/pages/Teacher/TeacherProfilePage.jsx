// frontend/src/pages/Teacher/TeacherProfilePage.jsx
import { useEffect, useMemo, useState } from "react";
import {
  fetchMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../../../api/profileApi";

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const roleLabel = useMemo(() => {
    if (!user?.role) return "—";
    if (user.role === "teacher") return "معلّم";
    if (user.role === "admin") return "مشرف";
    return "طالب";
  }, [user]);

  function resetAlerts() {
    setMsg("");
    setErr("");
  }

  function onChangeField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function onChangePw(key, value) {
    setPw((p) => ({ ...p, [key]: value }));
  }

  // ✅ تحميل بيانات حقيقية من الداتابيس
  useEffect(() => {
    (async () => {
      try {
        resetAlerts();
        setLoading(true);

        const data = await fetchMyProfile(); // { user }
        setUser(data.user);

        setForm({
          name: data.user?.name || "",
          phone: data.user?.phone || "",
        });

        // ✅ حدّث localStorage عشان باقي الصفحات
        const saved = JSON.parse(localStorage.getItem("user") || "null");
        if (saved) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...saved,
              name: data.user?.name ?? saved.name,
              phone: data.user?.phone ?? saved.phone,
              isApproved: data.user?.isApproved ?? saved.isApproved,
              role: data.user?.role ?? saved.role,
              email: data.user?.email ?? saved.email,
              _id: data.user?._id ?? saved._id,
            })
          );
        }
      } catch (e) {
        setErr(e?.message || "فشل تحميل بيانات الملف الشخصي");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ حفظ بيانات حقيقية بالداتابيس (name + phone فقط)
  async function onSaveProfile(e) {
    e.preventDefault();
    resetAlerts();

    if (!form.name.trim()) return setErr("الاسم مطلوب.");

    try {
      setSaving(true);
      const data = await updateMyProfile({
        name: form.name.trim(),
        phone: (form.phone || "").trim(),
      });

      setUser(data.user);

      // ✅ حدّث localStorage
      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (saved) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...saved,
            name: data.user?.name ?? saved.name,
            phone: data.user?.phone ?? saved.phone,
          })
        );
      }

      setMsg(data.message || "✅ تم حفظ البيانات.");
    } catch (e2) {
      setErr(e2?.message || "فشل حفظ البيانات.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ تغيير كلمة المرور (حقيقي)
  async function onChangePassword(e) {
    e.preventDefault();
    resetAlerts();

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

      setMsg(data.message || "✅ تم تغيير كلمة المرور.");
      setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
    } catch (e2) {
      setErr(e2?.message || "فشل تغيير كلمة المرور.");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="p-6 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold mb-1">الملف الشخصي</h1>
          <p className="text-slate-500 text-sm">
            تحديث بياناتك وحفظها في قاعدة البيانات.
          </p>
        </div>

        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
        >
          رجوع
        </button>
      </div>

      {err ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg mb-4">
          {err}
        </div>
      ) : null}

      {msg ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg mb-4">
          {msg}
        </div>
      ) : null}

      {/* Summary card */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        {loading ? (
          <div className="text-slate-500">جاري التحميل...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">الاسم</div>
              <div className="font-semibold text-slate-800">
                {user?.name || "—"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">الدور</div>
              <div className="font-semibold text-slate-800">{roleLabel}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1">الحالة</div>
              <div className="font-semibold text-slate-800">
                {user?.isApproved === false ? "غير معتمد" : "معتمد"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-3">بيانات الحساب</h2>

        {loading ? (
          <div className="text-slate-500">جاري التحميل...</div>
        ) : (
          <form
            onSubmit={onSaveProfile}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className="md:col-span-2">
              <div className="text-xs text-slate-500 mb-1">
                الإيميل (للعرض فقط)
              </div>
              <div className="p-3 border rounded-lg bg-slate-50 text-slate-800">
                {user?.email || "—"}
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-600 block mb-1">الاسم</label>
              <input
                value={form.name}
                onChange={(e) => onChangeField("name", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
                placeholder="اسم المعلّم"
              />
            </div>

            <div>
              <label className="text-sm text-slate-600 block mb-1">
                رقم الجوال (اختياري)
              </label>
              <input
                value={form.phone}
                onChange={(e) => onChangeField("phone", e.target.value)}
                className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
                placeholder="05xxxxxxxx"
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetAlerts();
                  setForm({
                    name: user?.name || "",
                    phone: user?.phone || "",
                  });
                }}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
                disabled={saving}
              >
                إلغاء
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-bold text-slate-800 mb-3">
          تغيير كلمة المرور
        </h2>

        <form
          onSubmit={onChangePassword}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <div className="md:col-span-2">
            <label className="text-sm text-slate-600 block mb-1">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => onChangePw("currentPassword", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={pw.newPassword}
              onChange={(e) => onChangePw("newPassword", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600 block mb-1">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              value={pw.confirmNewPassword}
              onChange={(e) => onChangePw("confirmNewPassword", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
              placeholder="••••••••"
            />
          </div>

          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetAlerts();
                setPw({
                  currentPassword: "",
                  newPassword: "",
                  confirmNewPassword: "",
                });
              }}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
              disabled={pwSaving}
            >
              مسح
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-60"
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
