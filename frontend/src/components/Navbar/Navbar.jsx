import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center w-full">
      {/* MOBILE MENU BUTTON */}
      <button
        className="md:hidden text-3xl text-gray-700"
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>

      {/* NAV LINKS — DESKTOP */}
      <div className="hidden md:flex items-center gap-12 flex-1">
        <ul className="flex gap-8 text-base font-medium text-gray-700">
          <li>
            <a href="/" className="hover:text-teal-600 transition">
              الرئيسية
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-teal-600 transition">
              المساعدة
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-teal-600 transition">
              الفوائد
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-teal-600 transition">
              المميزات
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-teal-600 transition">
              من نحن
            </a>
          </li>
        </ul>
      </div>

      {/* LOGIN BUTTON — DESKTOP */}
      <div className="hidden md:flex">
        <Link
          to="/login"
          className="px-5 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition font-medium flex items-center gap-2"
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
        <div className="md:hidden absolute top-16 right-0 w-full bg-white shadow-lg rounded-b-lg p-6 flex flex-col gap-4">
          <a href="/" className="text-gray-700 font-medium hover:text-teal-600">
            الرئيسية
          </a>
          <a href="#" className="text-gray-700 font-medium hover:text-teal-600">
            المساعدة
          </a>
          <a href="#" className="text-gray-700 font-medium hover:text-teal-600">
            الفوائد
          </a>
          <a href="#" className="text-gray-700 font-medium hover:text-teal-600">
            المميزات
          </a>
          <a href="#" className="text-gray-700 font-medium hover:text-teal-600">
            من نحن
          </a>

          <Link
            to="/login"
            className="text-center mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
          >
            تسجيل الدخول
          </Link>
        </div>
      )}
    </nav>
  );
}
