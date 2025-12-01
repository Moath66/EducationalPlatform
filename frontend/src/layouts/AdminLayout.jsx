import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100" dir="rtl">
      {/* زر القائمة للجوال */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-3 right-3 z-50 bg-white p-2 rounded-lg shadow text-slate-800"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`
          bg-slate-900 text-slate-100 flex flex-col z-40
          fixed top-0 right-0 h-full w-64
          transform ${open ? "translate-x-0" : "translate-x-full"}
          transition-transform duration-300
          lg:static lg:translate-x-0 lg:transform-none lg:w-64
        `}
      >
        <div className="px-6 py-4 border-b border-slate-800">
          <h1 className="text-xl font-bold">لوحة تحكم المشرف</h1>
          <p className="text-xs text-slate-400 mt-1">إدارة المنصة التعليمية</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
          <AdminNavItem to="/admin" label="لوحة التحكم" />
          <AdminNavItem to="/admin/pending" label="طلبات التسجيل" />
          <AdminNavItem to="/admin/teachers" label="إدارة المعلمين" />
          <AdminNavItem to="/admin/students" label="إدارة الطلاب" />
          <AdminNavItem to="/admin/study-plans" label="الخطط والجداول" />
          <AdminNavItem to="/admin/sessions" label="جلسات الفصول" />
          <AdminNavItem to="/admin/settings" label="إعدادات المنصة" />
        </nav>

        <div className="px-4 py-4 border-t border-slate-800 text-xs text-slate-400">
          <button
            onClick={() => (window.location.href = "/login")}
            className="w-full text-right hover:text-red-400 transition"
          >
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col lg:mr-64">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="text-sm text-slate-500">
            مرحباً،{" "}
            <span className="font-semibold text-slate-800">مشرف النظام</span>
          </div>
          <Link
            to="/"
            className="text-xs px-3 py-1 rounded-full border border-slate-300 hover:bg-slate-100"
          >
            الرجوع للصفحة الرئيسية
          </Link>
        </header>

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
