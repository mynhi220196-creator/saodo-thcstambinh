import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoleRoute from './auth/AdminRoleRoute.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import SaoDoRoleRoute from './auth/SaoDoRoleRoute.jsx'
import TeacherRoleRoute from './auth/TeacherRoleRoute.jsx'
import AdminSchedule from './pages/AdminSchedule.jsx'
import AdminAccountPage from './pages/account/AdminAccountPage.jsx'
import UpdatePasswordPage from './pages/auth/UpdatePasswordPage.jsx'
import Login from './pages/Login.jsx'
import RankConfigPage from './pages/ranks/RankConfigPage.jsx'
import HonorBoardPage from './pages/honor/HonorBoardPage.jsx'
import ConductConfigPage from './pages/conductConfig/ConductConfigPage.jsx'
import ClassDetailPage from './pages/classes/ClassDetailPage.jsx'
import ClassManagementPage from './pages/classes/ClassManagementPage.jsx'
import DepartmentManagementPage from './pages/departments/DepartmentManagementPage.jsx'
import StudentManagementPage from './pages/students/StudentManagementPage.jsx'
import AdminDashboardPage from './pages/adminDashboard/AdminDashboardPage.jsx'
import AdminReportsPage from './pages/reports/AdminReportsPage.jsx'
import ScoreRecordsPage from './pages/scoreRecords/ScoreRecordsPage.jsx'
import SaoDoMemberManagementPage from './pages/saoDoMembers/SaoDoMemberManagementPage.jsx'
import TeacherManagementPage from './pages/teachers/TeacherManagementPage.jsx'
import UserManagementPage from './pages/users/UserManagementPage.jsx'
import SaoDoAccountPage from './pages/account/SaoDoAccountPage.jsx'
import TeacherAccountPage from './pages/account/TeacherAccountPage.jsx'
import TeacherConductHistoryPage from './pages/teacherPortal/TeacherConductHistoryPage.jsx'
import TeacherConductPage from './pages/teacherPortal/TeacherConductPage.jsx'
import TeacherDashboardPage from './pages/teacherPortal/TeacherDashboardPage.jsx'
import TeacherClassListPage from './pages/teacherPortal/TeacherClassListPage.jsx'
import TeacherClassStudentsPage from './pages/teacherPortal/TeacherClassStudentsPage.jsx'
import TeacherMyClassesLayout from './pages/teacherPortal/TeacherMyClassesLayout.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/vinh-danh" element={<HonorBoardPage />} />
        <Route element={<AdminRoleRoute />}>
          <Route path="/admin" element={<AdminSchedule />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/sao-do/members" element={<SaoDoMemberManagementPage />} />
          <Route path="/admin/conduct-criteria" element={<ConductConfigPage />} />
          <Route path="/admin/ranks" element={<RankConfigPage />} />
          <Route path="/admin/score-records" element={<ScoreRecordsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/departments" element={<DepartmentManagementPage />} />
          <Route path="/admin/classes/:classId" element={<ClassDetailPage />} />
          <Route path="/admin/classes" element={<ClassManagementPage />} />
          <Route path="/admin/teachers" element={<TeacherManagementPage />} />
          <Route path="/admin/students" element={<StudentManagementPage />} />
          <Route path="/admin/account" element={<AdminAccountPage />} />
        </Route>
        <Route element={<TeacherRoleRoute />}>
          <Route path="/giao-vien" element={<TeacherDashboardPage />} />
          <Route path="/giao-vien/lop-hoc" element={<TeacherMyClassesLayout />}>
            <Route index element={<TeacherClassListPage />} />
            <Route path=":classId" element={<TeacherClassStudentsPage />} />
          </Route>
          <Route path="/giao-vien/tac-phong" element={<TeacherConductPage />} />
          <Route path="/giao-vien/lich-su-ghi-nhan" element={<TeacherConductHistoryPage />} />
          <Route path="/giao-vien/tai-khoan" element={<TeacherAccountPage />} />
        </Route>
        <Route element={<SaoDoRoleRoute />}>
          <Route path="/sao-do" element={<Navigate to="/sao-do/tac-phong" replace />} />
          <Route path="/sao-do/tac-phong" element={<TeacherConductPage variant="sao_do" />} />
          <Route path="/sao-do/lich-su-ghi-nhan" element={<TeacherConductHistoryPage variant="sao_do" />} />
          <Route path="/sao-do/tai-khoan" element={<SaoDoAccountPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
