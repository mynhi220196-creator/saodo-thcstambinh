export default function TeacherStatsCards({ totalFiltered, totalSystem, homeroomCount, newThisMonth }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-primary">
        <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            groups
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Giáo viên (đang lọc)</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{totalFiltered}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Tổng hồ sơ GV trên Firestore: {totalSystem}</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-secondary">
        <div className="w-14 h-14 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            assignment_ind
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Đang chủ nhiệm</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{homeroomCount}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Trong danh sách sau lọc (theo lớp đang hoạt động)</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-tertiary">
        <div className="w-14 h-14 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            person_celebrate
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Mới trong tháng</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">{newThisMonth}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Hồ sơ giáo viên tạo trong tháng này (created_at)</p>
        </div>
      </div>
    </div>
  )
}
