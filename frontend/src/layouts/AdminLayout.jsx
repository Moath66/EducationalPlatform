import { Link, NavLink } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

export default function AdminLayout({ children }) {
  const { settings, loading } = useSettings();

  return (
    <div
      className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
      dir="rtl"
    >
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col dark:bg-slate-950">
        {/* Logo + Platform Name */}
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {settings?.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="logo"
                className="w-10 h-10 object-contain rounded bg-white p-1"
              />
            )}

            <div>
              <h1 className="text-lg font-bold leading-tight">
                {loading ? "..." : settings?.platformName || "المنصة التعليمية"}
              </h1>
              <p className="text-xs text-slate-400">لوحة تحكم المشرف</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <AdminNavItem to="/admin" label="لوحة التحكم" />
          <AdminNavItem to="/admin/pending" label="طلبات التسجيل" />
          <AdminNavItem to="/admin/teachers" label="إدارة المعلمين" />
          <AdminNavItem to="/admin/students" label="إدارة الطلاب" />
          <AdminNavItem to="/admin/courses" label="إدارة الكورسات" />
          <AdminNavItem to="/admin/study-plans" label="الخطط والجداول" />
          <AdminNavItem to="/admin/sessions" label="جلسات الفصول" />
          <AdminNavItem to="/admin/settings" label="إعدادات المنصة" />
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full text-right hover:text-red-400 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500 dark:text-slate-300">
            مرحباً،{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              مشرف النظام
            </span>
          </div>

          <Link
            to="/"
            className="text-xs px-3 py-1 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            الرجوع للصفحة الرئيسية
          </Link>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

function AdminNavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2 rounded-lg transition ${
          isActive
            ? "bg-slate-800 text-emerald-400"
            : "text-slate-200 hover:bg-slate-800/60 hover:text-emerald-300"
        }`
      }
    >
      <span className="text-sm">{label}</span>
      <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
    </NavLink>
  );
}
