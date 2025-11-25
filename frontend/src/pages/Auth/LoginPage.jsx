import { useState } from "react";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle Login
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ خطأ: " + data.message);
        return;
      }

      // حفظ البيانات في المتصفح
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("✔ تسجيل الدخول ناجح!");

      // إعادة توجيه حسب الدور
      if (data.user.role === "admin") {
        window.location.href = "/admin";
      } else if (data.user.role === "teacher") {
        window.location.href = "/teacher";
      } else {
        window.location.href = "/student";
      }
    } catch (error) {
      alert("❌ لم يتم الاتصال بالسيرفر");
      console.log(error);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center mt-20 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            تسجيل الدخول
          </h2>

          {/* Email */}
          <div className="mb-5">
            <Input
              name="email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@mail.com"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <Input
              name="password"
              type="password"
              label="كلمة المرور"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          {/* Forget Password */}
          <div className="text-left mb-5">
            <Link
              to="/forgot-password"
              className="text-teal-700 text-sm hover:underline transition"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>

          {/* Login Button */}
          <Button
            className="w-full py-3 rounded-lg bg-teal-600 text-white text-lg font-medium hover:bg-teal-700 transition"
            onClick={handleSubmit}
          >
            دخول
          </Button>

          {/* Register Link */}
          <p className="text-center mt-6 text-gray-700 text-sm">
            ليس لديك حساب؟
            <Link
              to="/register"
              className="text-teal-700 font-semibold hover:underline mr-1"
            >
              سجل كطالب
            </Link>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
