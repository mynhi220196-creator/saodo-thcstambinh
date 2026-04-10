export default function SaoDoMemberStatsCards({ totalFiltered, totalSystem, activeCount, pendingCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-red-600 shadow-sm">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            diversity_3
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Đội viên (đang lọc)</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{totalFiltered}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Tổng hồ sơ Sao Đỏ (Firestore): {totalSystem}</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-primary">
        <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            verified_user
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Đang hoạt động</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{activeCount}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Trong kết quả sau lọc</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-tertiary">
        <div className="w-14 h-14 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            hourglass_top
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Chờ đăng nhập lần đầu</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{pendingCount}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Theo trạng thái tài khoản (profiles)</p>
        </div>
      </div>
    </div>
  )
}
