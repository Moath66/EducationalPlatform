import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "admin") {
    alert("❌ غير مصرح لك بالدخول إلى صفحة المشرف");
    return <Navigate to="/login" replace />;
  }

  return children;
}
