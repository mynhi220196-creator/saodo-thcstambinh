export default function DepartmentPageHeader({ onAddTeam }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Tổ chức</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Tổ chuyên môn</span>
        </div>
        <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">Quản lý tổ chuyên môn</h2>
        <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body">
          Cấu hình tổ/bộ môn theo năm học, trưởng tổ, số lượng giáo viên và trạng thái hoạt động.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <button
          type="button"
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-all"
        >
          <span className="material-symbols-outlined">history_edu</span>
          <span>Lịch sử thay đổi</span>
        </button>
        <button
          type="button"
          onClick={onAddTeam}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Thêm tổ mới</span>
        </button>
      </div>
    </div>
  )
}
