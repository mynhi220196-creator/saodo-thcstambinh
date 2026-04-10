/** Phân trang FE dùng chung trang tác phong / lịch sử (cổng GV & Sao Đỏ). */
export default function PortalTablePagination({ from, to, total, page, totalPages, onPageChange, noun = 'mục' }) {
  if (total === 0) return null

  const safePage = Math.min(Math.max(1, page), totalPages)

  return (
    <div className="px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-low/30 border-t border-outline-variant/10 shrink-0">
      <div className="text-sm text-on-surface-variant font-medium text-center sm:text-left">
        Hiển thị{' '}
        <span className="font-bold text-on-surface tabular-nums">
          {from} – {to}
        </span>{' '}
        trong <span className="font-bold text-on-surface tabular-nums">{total}</span> {noun}
      </div>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40 disabled:pointer-events-none"
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
          className="p-2 rounded-lg hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Trang sau"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
