export default function DepartmentStatsCards({ totalTeams, totalMembers, activeTeams }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-primary">
        <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            corporate_fare
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Số tổ (đang lọc)</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{totalTeams}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Theo năm &amp; trạng thái</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-secondary">
        <div className="w-14 h-14 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            groups
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Tổng GV trong các tổ</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">
            {totalMembers.toLocaleString('vi-VN')}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">Cộng sĩ số các tổ hiển thị</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-tertiary">
        <div className="w-14 h-14 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            task_alt
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Tổ đang hoạt động</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{activeTeams}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Trong kết quả lọc</p>
        </div>
      </div>
    </div>
  )
}
