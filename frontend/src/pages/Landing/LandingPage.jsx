import MainLayout from "../../layouts/MainLayout";

export default function LandingPage() {
  return (
    <MainLayout>
      <div className="text-center mt-20">
        <h1 className="text-4xl font-bold mb-4">
          مرحباً بك في المنصة التعليمية
        </h1>
        <p className="text-gray-600 text-lg">
          نظام متكامل لإدارة الطلاب والمعلمين والفصول الافتراضية
        </p>
      </div>
    </MainLayout>
  );
}
