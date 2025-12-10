import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";

import RequireAdmin from "../middleware/RequireAdmin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import ManageTeachers from "../pages/Admin/ManageTeachers";
import ManageStudents from "../pages/Admin/ManageStudents";
import ManagePendingUser from "../pages/Admin/ManagePendingUser";
import StudyPlans from "../pages/Admin/StudyPlans";
import ClassSessions from "../pages/Admin/ClassSessions";
import Settings from "../pages/Admin/Settings";
import ManageCourses from "../pages/Admin/ManageCourses";

import RequireStudent from "../middleware/RequireStudent";
import StudentDashboard from "../pages/Student/StudentDashboard";
import StudentAttendance from "../pages/Student/StudentAttendance";
import StudentSchedule from "../pages/Student/StudentSchedule";
import StudentStudyPlans from "../pages/Student/StudentStudyPlans";
import StudentProfilePage from "../pages/Student/StudentProfilePage";

import RequireTeacher from "../middleware/RequireTeacher";
import TeacherDashboard from "../pages/Teacher/TeacherDashboard";
import TeacherAttendance from "../pages/Teacher/TeacherAttendance";
import TeacherSchedule from "../pages/Teacher/TeacherSchedule";
import TeacherStudyFiles from "../pages/Teacher/TeacherStudyFiles";
import TeacherSessions from "../pages/Teacher/TeacherSessions";
import TeacherStudents from "../pages/Teacher/TeacherStudents";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ADMIN */}
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
          path="/admin/pending"
          element={
            <RequireAdmin>
              <ManagePendingUser />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <RequireAdmin>
              <ManageCourses />
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

        {/* STUDENT */}
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
          path="/student/schedule"
          element={
            <RequireStudent>
              <StudentSchedule />
            </RequireStudent>
          }
        />

        <Route
          path="/student/study-plans"
          element={
            <RequireStudent>
              <StudentStudyPlans />
            </RequireStudent>
          }
        />

        <Route
          path="/student/profile"
          element={
            <RequireStudent>
              <StudentProfilePage />
            </RequireStudent>
          }
        />

        {/* TEACHER */}
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

        <Route
          path="/teacher/schedule"
          element={
            <RequireTeacher>
              <TeacherSchedule />
            </RequireTeacher>
          }
        />

        <Route
          path="/teacher/study-files"
          element={
            <RequireTeacher>
              <TeacherStudyFiles />
            </RequireTeacher>
          }
        />

        <Route
          path="/teacher/sessions"
          element={
            <RequireTeacher>
              <TeacherSessions />
            </RequireTeacher>
          }
        />

        <Route
          path="/teacher/students"
          element={
            <RequireTeacher>
              <TeacherStudents />
            </RequireTeacher>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
