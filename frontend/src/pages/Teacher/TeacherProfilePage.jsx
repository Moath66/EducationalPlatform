import { useEffect, useMemo, useState } from "react";

export default function TeacherProfilePage() {
  const [user, setUser] = useState(null);

  // editable fields
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // password UI (optional)
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user") || "null");
    setUser(saved);

    setForm({
      name: saved?.name || "",
      email: saved?.email || "",
      phone: saved?.phone || "",
    });
  }, []);

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

  // ✅ حالياً: بدون API -> نحفظ في localStorage فقط (واجهة)
  async function onSaveProfile(e) {
    e.preventDefault();
    resetAlerts();

    if (!form.name.trim()) return setErr("الاسم مطلوب.");
    if (!form.email.trim()) return setErr("الإيميل مطلوب.");

    try {
      // هنا لاحقاً تربطه بـ API مثل:
      // await updateMyProfile({ name, phone, ... })
      const updated = {
        ...(user || {}),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: (form.phone || "").trim(),
      };

      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);
      setMsg("✅ تم حفظ البيانات (محلياً).");
    } catch (e2) {
      setErr(e2?.message || "فشل حفظ البيانات.");
    }
  }

  // ✅ واجهة فقط (بدون API)
  async function onChangePassword(e) {
    e.preventDefault();
    resetAlerts();

    if (!pw.currentPassword) return setErr("اكتب كلمة المرور الحالية.");
    if (!pw.newPassword) return setErr("اكتب كلمة المرور الجديدة.");
    if (pw.newPassword.length < 6)
      return setErr("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.");
    if (pw.newPassword !== pw.confirmNewPassword)
      return setErr("تأكيد كلمة المرور غير مطابق.");

    // لاحقاً تربطه بـ API change password
    setMsg("✅ تم (شكلياً) تغيير كلمة المرور. اربطه بـ API لاحقاً.");
    setPw({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  }

  return (
    <div className="p-6 text-right" dir="rtl">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-3xl font-bold mb-1">الملف الشخصي</h1>
          <p className="text-slate-500 text-sm">
            حدّث بياناتك الأساسية. (حالياً حفظ محلي — اربطه بـ API لاحقاً)
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
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-3">بيانات الحساب</h2>

        <form
          onSubmit={onSaveProfile}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
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
            <label className="text-sm text-slate-600 block mb-1">الإيميل</label>
            <input
              value={form.email}
              onChange={(e) => onChangeField("email", e.target.value)}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring"
              placeholder="teacher@email.com"
            />
            <div className="text-xs text-slate-500 mt-1">
              * إذا تبغى الإيميل يكون غير قابل للتعديل، قفل الحقل لاحقاً.
            </div>
          </div>

          <div className="md:col-span-2">
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
                  email: user?.email || "",
                  phone: user?.phone || "",
                });
              }}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>

      {/* Password (UI only) */}
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
            >
              مسح
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
            >
              تغيير كلمة المرور
            </button>
          </div>

          <div className="md:col-span-2 text-xs text-slate-500 mt-1">
            * هذه واجهة فقط. لو تبغى ربط حقيقي: نضيف API (PUT
            /api/profile/password) مثلاً.
          </div>
        </form>
      </div>
    </div>
  );
}
