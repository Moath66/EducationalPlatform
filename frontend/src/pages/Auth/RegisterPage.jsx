import { useState } from "react";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import MainLayout from "../../layouts/MainLayout";

export default function RegisterPage() {
  // State for inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "",
    password: "",
  });

  // Handle change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ خطأ: " + data.message);
        return;
      }

      alert("✔ تم التسجيل بنجاح!");
    } catch (error) {
      alert("❌ لم يتم الاتصال بالسيرفر");
      console.log(error);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center mt-16 px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            تسجيل طالب جديد
          </h2>

          <div className="mb-4">
            <Input
              name="name"
              label="الاسم الكامل"
              placeholder="مثال: محمد أحمد"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <Input
              name="email"
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@mail.com"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <Input
              name="phone"
              label="رقم الجوال"
              placeholder="05xxxxxxxx"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <Input
              name="grade"
              label="الصف الدراسي (اختياري)"
              placeholder="مثل: الصف الثالث"
              onChange={handleChange}
            />
          </div>

          <div className="mb-6">
            <Input
              name="password"
              type="password"
              label="كلمة المرور"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          <Button
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white text-lg rounded-lg transition"
            onClick={handleSubmit}
          >
            تسجيل
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
