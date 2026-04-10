export default function UserPageHeader({ onInvite }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Hệ thống</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Người dùng</span>
        </div>
        <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">Quản lý người dùng</h2>
        <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body">
          Tài khoản đăng nhập cho quản trị, ban giám hiệu, giáo viên, Sao Đỏ và cộng tác viên — phân quyền và
          trạng thái kích hoạt.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <button
          type="button"
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-all"
        >
          <span className="material-symbols-outlined">history</span>
          <span>Nhật ký đăng nhập</span>
        </button>
        <button
          type="button"
          onClick={onInvite}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Mời người dùng</span>
        </button>
      </div>
    </div>
  )
}
