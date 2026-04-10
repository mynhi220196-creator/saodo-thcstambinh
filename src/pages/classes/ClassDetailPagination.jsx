export default function ClassDetailPagination({
  page,
  pageSize,
  total,
  onPageChange,
  noun = 'mục',
  /** Khi total = 0 nhưng có bộ lọc (vd. tìm kiếm), thay cho “Không có {noun}”. */
  zeroStateMessage = null,
}) {
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
  const safePage = Math.min(Math.max(1, page), totalPages)
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-3.5 border-t border-outline-variant/10 bg-surface-container-low/25">
      <p className="text-sm text-on-surface-variant">
        {total === 0 ? (
          <>{zeroStateMessage ?? <>Không có {noun}</>}</>
        ) : (
          <>
            Hiển thị <span className="font-bold text-on-surface tabular-nums">{from}</span>
            –
            <span className="font-bold text-on-surface tabular-nums">{to}</span>
            <span className="text-on-surface-variant"> / </span>
            <span className="font-bold text-on-surface tabular-nums">{total}</span>
            <span className="text-on-surface-variant"> {noun}</span>
          </>
        )}
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-on-surface bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
          Trước
        </button>
        <span className="text-sm font-extrabold text-primary tabular-nums min-w-[4.5rem] text-center">
          {safePage} / {totalPages}
        </span>
        <button
          type="button"
          disabled={safePage >= totalPages || total === 0}
          onClick={() => onPageChange(safePage + 1)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold text-on-surface bg-surface-container-high hover:bg-surface-container-highest disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Sau
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
