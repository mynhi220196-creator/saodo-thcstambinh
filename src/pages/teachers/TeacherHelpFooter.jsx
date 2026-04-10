export default function TeacherHelpFooter() {
  return (
    <div className="mt-10 p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-primary/5">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">info</span>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-primary">Cần hỗ trợ quản lý nhân sự?</h4>
          <p className="text-sm text-on-surface-variant">
            Tạo tài khoản và sửa hồ sơ tại <span className="font-mono text-xs">Quản lý người dùng</span>. Tổ/đơn vị lưu ở trường{' '}
            <span className="font-mono text-xs">unit</span> trên profile.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="px-5 py-2.5 text-sm font-bold text-primary bg-white rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 self-start sm:self-center"
      >
        Tài liệu hướng dẫn
      </button>
    </div>
  )
}
