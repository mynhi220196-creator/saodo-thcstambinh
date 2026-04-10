import OrgTablePageSizeSelect from '../../components/OrgTablePageSizeSelect.jsx'

export default function ScoreRecordsTableFooter({
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
  const safePage = Math.min(page, Math.max(1, totalPages))

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-outline-variant/10 bg-surface-container-low/20 text-sm text-on-surface-variant">
      <p>
        {filteredTotal === 0 ? (
          <>
            Không có bản ghi khớp lọc
            {totalInDb != null ? (
              <>
                {' '}
                · Firestore <span className="font-mono font-semibold text-on-surface">{totalInDb}</span> bản
              </>
            ) : null}
          </>
        ) : (
          <>
            Hiển thị{' '}
            <span className="font-bold text-on-surface tabular-nums">
              {from}–{to}
            </span>{' '}
            trong <span className="font-bold text-on-surface tabular-nums">{filteredTotal}</span> bản ghi khớp lọc
            {totalInDb != null ? (
              <>
                {' '}
                · Firestore <span className="font-mono font-semibold text-on-surface">{totalInDb}</span> bản
              </>
            ) : null}
            <span className="hidden sm:inline"> · </span>
            <span className="block sm:inline text-xs sm:text-sm mt-1 sm:mt-0">Sắp xếp: mới nhất trước</span>
          </>
        )}
      </p>
      {filteredTotal > 0 ? (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-3 flex-wrap">
          <OrgTablePageSizeSelect value={pageSize} onChange={onPageSizeChange} id="score-records-page-size" />
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-1">
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
              <span className="text-xs font-mono font-semibold text-on-surface tabular-nums px-2 min-w-[3.5rem] text-center">
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
      ) : null}
    </div>
  )
}
