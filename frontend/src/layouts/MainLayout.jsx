import Navbar from "../components/Navbar/Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔵 NAVBAR ثابت فوق الصفحة */}
      <header>
        <Navbar />
      </header>

      {/* 🔵 المحتوى */}
      <main className="container mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
