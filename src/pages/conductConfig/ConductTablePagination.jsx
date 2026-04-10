import OrgTablePageSizeSelect from '../../components/OrgTablePageSizeSelect.jsx'

export default function ConductTablePagination({
  from,
  to,
  filteredTotal,
  totalInDb,
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  if (filteredTotal === 0 && totalInDb === 0) return null

  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages))

  return (
    <div className="px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-outline-variant/10 bg-surface-container-low/20">
      <p className="text-xs text-on-surface-variant text-center sm:text-left">
        {filteredTotal === 0 ? (
          <>
            Không có dòng nào khớp bộ lọc · Tổng trong cơ sở dữ liệu:{' '}
            <span className="font-semibold text-on-surface">{totalInDb}</span>
          </>
        ) : (
          <>
            Hiển thị{' '}
            <span className="font-semibold text-on-surface tabular-nums">
              {from}–{to}
            </span>{' '}
            trong <span className="font-semibold text-on-surface tabular-nums">{filteredTotal}</span> sau lọc · Tổng hạng mục:{' '}
            <span className="font-semibold text-on-surface tabular-nums">{totalInDb}</span>
          </>
        )}
      </p>
      {filteredTotal > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 flex-wrap">
          <OrgTablePageSizeSelect value={pageSize} onChange={onPageSizeChange} id="conduct-criteria-page-size" />
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => onPageChange(safePage - 1)}
                className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40"
                aria-label="Trang trước"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="text-xs font-mono tabular-nums px-2 text-on-surface font-semibold">
                {safePage}/{totalPages}
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
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
