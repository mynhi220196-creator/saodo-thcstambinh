export default function ConductPageHeader({ onAdd, onExport }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
      <div>
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
          <span>Hệ thống</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>Thi đua &amp; Tác phong</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary">Cấu hình danh mục</span>
        </nav>
        <h1 className="text-3xl font-headline font-extrabold text-primary tracking-tight">
          Cấu hình Danh mục Tác phong
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-2xl">
          Định nghĩa tiêu chí cộng/trừ điểm theo nhóm hành vi; dữ liệu lưu trên Firestore, đồng bộ realtime cho admin.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest text-primary font-semibold rounded-xl hover:bg-secondary-container transition-all text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">download</span>
          Xuất CSV (đang lọc)
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add_circle</span>
          Thêm quy định mới
        </button>
      </div>
    </div>
  )
}
