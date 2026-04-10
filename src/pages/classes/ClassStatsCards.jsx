export default function ClassStatsCards({ totalClasses, totalStudents, avgStudents }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-primary">
        <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            class
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Số lớp (đang lọc)</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface">{totalClasses}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Theo năm &amp; khối đã chọn</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-secondary">
        <div className="w-14 h-14 bg-secondary-fixed rounded-full flex items-center justify-center text-secondary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            groups
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Tổng sĩ số</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface tabular-nums">
            {totalStudents.toLocaleString('vi-VN')}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">Học sinh trong các lớp hiển thị</p>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 border-l-4 border-tertiary">
        <div className="w-14 h-14 bg-tertiary-fixed rounded-full flex items-center justify-center text-tertiary shrink-0">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            analytics
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Sĩ số trung bình</p>
          <h3 className="editorial-title text-3xl font-extrabold text-on-surface">{avgStudents}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Học sinh / lớp</p>
        </div>
      </div>
    </div>
  )
}
