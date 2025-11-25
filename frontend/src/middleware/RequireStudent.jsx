export default function RequireStudent({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "student") {
    return (
      <h1 className="text-center mt-20 text-red-600 text-3xl">
        🚫 هذه الصفحة للطلاب فقط
      </h1>
    );
  }

  return children;
}
