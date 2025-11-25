import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";

import RequireAdmin from "../middleware/RequireAdmin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageTeachers from "../pages/Admin/ManageTeachers";
import ManageStudents from "../pages/Admin/ManageStudents";
import StudyPlans from "../pages/Admin/StudyPlans";
import ClassSessions from "../pages/Admin/ClassSessions";
import Settings from "../pages/Admin/Settings";

import RequireStudent from "../middleware/RequireStudent";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentAttendance from "../pages/Student/StudentAttendance";

import RequireTeacher from "../middleware/RequireTeacher";
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import TeacherAttendance from "../pages/Teacher/TeacherAttendance";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/teachers"
          element={
            <RequireAdmin>
              <ManageTeachers />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/students"
          element={
            <RequireAdmin>
              <ManageStudents />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/study-plans"
          element={
            <RequireAdmin>
              <StudyPlans />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/sessions"
          element={
            <RequireAdmin>
              <ClassSessions />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <RequireAdmin>
              <Settings />
            </RequireAdmin>
          }
        />
        <Route
          path="/student"
          element={
            <RequireStudent>
              <StudentDashboard />
            </RequireStudent>
          }
        />

        <Route
          path="/student/attendance"
          element={
            <RequireStudent>
              <StudentAttendance />
            </RequireStudent>
          }
        />

        <Route
          path="/teacher"
          element={
            <RequireTeacher>
              <TeacherDashboard />
            </RequireTeacher>
          }
        />
        <Route
          path="/teacher/attendance"
          element={
            <RequireTeacher>
              <TeacherAttendance />
            </RequireTeacher>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
