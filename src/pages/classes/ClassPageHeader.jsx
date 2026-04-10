export default function ClassPageHeader({ onAddClass }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Tổ chức</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Danh sách lớp học</span>
        </div>
        <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">Quản lý lớp học</h2>
        <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body">
          Theo dõi lớp theo năm học và khối, gán phòng học, giáo viên chủ nhiệm và sĩ số.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <button
          type="button"
          onClick={onAddClass}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Thêm lớp mới</span>
        </button>
      </div>
    </div>
  )
}
