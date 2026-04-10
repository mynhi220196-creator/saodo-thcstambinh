import OrgTablePageSizeSelect from '../../components/OrgTablePageSizeSelect.jsx'

export default function TeacherTablePagination({
  from,
  to,
  filteredTotal,
  totalSystem,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  if (filteredTotal === 0) return null

  const safePage = Math.min(page, totalPages)

  return (
    <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-low/30 border-t border-outline-variant/10">
      <div className="text-sm text-on-surface-variant font-medium text-center sm:text-left">
        Hiển thị{' '}
        <span className="font-bold text-on-surface">
          {from} - {to}
        </span>{' '}
        trong <span className="font-bold text-on-surface">{filteredTotal}</span> kết quả lọc · Tổng giáo viên (Firestore){' '}
        <span className="font-bold text-on-surface">{totalSystem.toLocaleString('vi-VN')}</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 flex-wrap">
        <OrgTablePageSizeSelect value={pageSize} onChange={onPageSizeChange} id="teacher-page-size" />
        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onPageChange(1)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40"
              aria-label="Trang đầu"
            >
              <span className="material-symbols-outlined">first_page</span>
            </button>
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => onPageChange(safePage - 1)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40"
              aria-label="Trang trước"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="text-sm font-semibold text-on-surface px-2 tabular-nums">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(safePage + 1)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40"
              aria-label="Trang sau"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => onPageChange(totalPages)}
              className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40"
              aria-label="Trang cuối"
            >
              <span className="material-symbols-outlined">last_page</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
