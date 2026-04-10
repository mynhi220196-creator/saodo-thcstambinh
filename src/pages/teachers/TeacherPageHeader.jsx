import { Link } from 'react-router-dom'

export default function TeacherPageHeader() {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Tổ chức</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Danh sách giáo viên</span>
        </div>
        <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">Quản lý giáo viên</h2>
        <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body">
          Dữ liệu đọc từ Firestore <code className="font-mono text-xs">profiles</code> (vai trò giáo viên) và lớp chủ nhiệm từ{' '}
          <code className="font-mono text-xs">classes.homeroom_teacher_id</code>.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <Link
          to="/admin/users"
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Thêm / sửa tài khoản GV</span>
        </Link>
      </div>
    </div>
  )
}
