import { Navigate } from "react-router-dom";

export default function RequireTeacher({ children }) {
  const role = localStorage.getItem("role");

  if (role !== "teacher") {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "50px",
          color: "red",
          fontSize: "24px",
        }}
      >
        🚫 هذه الصفحة للمعلمين فقط
      </div>
    );
  }

  return children;
}
