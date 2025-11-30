import { useState } from "react";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import apiClient from "../../../api/apiClient";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const res = await apiClient.post("/api/auth/login", formData);

      // Check if approved
      if (!res.data.user.isApproved) {
        alert("⛔ حسابك لم تتم الموافقة عليه بعد. يرجى انتظار موافقة الإدارة.");
        return;
      }

      // Save user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("✔ تسجيل الدخول ناجح!");

      const role = res.data.user.role;

      if (role === "admin") window.location.href = "/admin";
      else if (role === "teacher") window.location.href = "/teacher";
      else window.location.href = "/student";
    } catch (error) {
      alert("❌ خطأ في تسجيل الدخول");
      console.log(error.response?.data || error);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-center mt-20 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            تسجيل الدخول
          </h2>

          <div className="mb-5">
            <Input
              name="email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@mail.com"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <Input
              name="password"
              type="password"
              label="كلمة المرور"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          <Button
            className="w-full py-3 rounded-lg bg-teal-600 text-white text-lg font-medium hover:bg-teal-700 transition"
            onClick={handleSubmit}
          >
            دخول
          </Button>

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
