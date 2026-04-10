export default function StudentPageHeader({ onAdd, onImport }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-10">
      <div className="space-y-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Tổ chức</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Danh sách học sinh</span>
        </div>
        <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">Quản lý học sinh</h2>
        <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body">
          Dữ liệu lưu trên Firestore: thêm/sửa, chuyển lớp, xoá mềm và import Excel (.xlsx) hàng loạt.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <button
          type="button"
          onClick={onImport}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-surface-container-high text-on-surface font-semibold rounded-xl hover:bg-surface-container-highest transition-all"
        >
          <span className="material-symbols-outlined">upload_file</span>
          <span>Import Excel</span>
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Thêm học sinh</span>
        </button>
      </div>
    </div>
  )
}
