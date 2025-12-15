// frontend/src/components/Navbar/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

const navItem = "text-gray-700 font-medium hover:text-teal-600 transition";
const navItemActive = "text-teal-700 font-semibold";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <nav className="bg-white/90 backdrop-blur border-b border-slate-100 px-5 md:px-8 py-4 flex justify-between items-center w-full sticky top-0 z-50">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2" onClick={close}>
        <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
          M
        </div>
        <div className="leading-tight">
          <div className="font-extrabold text-slate-900">mnhlyn</div>
          <div className="text-[11px] text-slate-500">منصة إدارة التعليم</div>
        </div>
      </Link>

      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden text-3xl text-gray-700"
        onClick={() => setOpen(!open)}
        aria-label="menu"
      >
        ☰
      </button>

      {/* NAV LINKS — DESKTOP */}
      <div className="hidden md:flex items-center gap-10">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? navItemActive : navItem)}
        >
          الرئيسية
        </NavLink>

        <NavLink
          to="/help"
          className={({ isActive }) => (isActive ? navItemActive : navItem)}
        >
          المساعدة
        </NavLink>

        <NavLink
          to="/benefits"
          className={({ isActive }) => (isActive ? navItemActive : navItem)}
        >
          الفوائد
        </NavLink>

        <NavLink
          to="/features"
          className={({ isActive }) => (isActive ? navItemActive : navItem)}
        >
          المميزات
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) => (isActive ? navItemActive : navItem)}
        >
          من نحن
        </NavLink>
      </div>

      {/* LOGIN BUTTON — DESKTOP */}
      <div className="hidden md:flex">
        <Link
          to="/login"
          className="px-5 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-medium flex items-center gap-2 shadow-sm"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          تسجيل الدخول
        </Link>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {open && (
        <div className="md:hidden absolute top-[72px] right-0 w-full bg-white shadow-lg border-t border-slate-100 rounded-b-2xl p-6 flex flex-col gap-4">
          <NavLink to="/" className={navItem} onClick={close}>
            الرئيسية
          </NavLink>
          <NavLink to="/help" className={navItem} onClick={close}>
            المساعدة
          </NavLink>
          <NavLink to="/benefits" className={navItem} onClick={close}>
            الفوائد
          </NavLink>
          <NavLink to="/features" className={navItem} onClick={close}>
            المميزات
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? navItemActive : navItem)}
          >
            من نحن
          </NavLink>

          <Link
            to="/login"
            onClick={close}
            className="text-center mt-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition"
          >
            تسجيل الدخول
          </Link>
        </div>
      )}
    </nav>
  );
}
