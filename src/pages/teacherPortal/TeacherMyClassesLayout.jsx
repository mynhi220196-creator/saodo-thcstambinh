import { Outlet } from 'react-router-dom'
import TeacherShell from '../../components/layout/TeacherShell.jsx'

export default function TeacherMyClassesLayout() {
  return (
    <TeacherShell activeKey="lop-hoc" headerTitle="Lớp của tôi" searchPlaceholder="Tìm học sinh…">
      <Outlet />
    </TeacherShell>
  )
}
