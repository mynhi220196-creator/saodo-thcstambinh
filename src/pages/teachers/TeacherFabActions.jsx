import { Link } from 'react-router-dom'

export default function TeacherFabActions() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
      <Link
        to="/admin/users"
        className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
        aria-label="Quản lý người dùng — thêm giáo viên"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </Link>
    </div>
  )
}
