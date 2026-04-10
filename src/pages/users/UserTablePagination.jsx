import OrgTablePageSizeSelect from '../../components/OrgTablePageSizeSelect.jsx'

export default function UserTablePagination({
  page,
  pageSize,
  filteredTotal,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(filteredTotal / pageSize))
  const safePage = Math.min(page, totalPages)
  const from = filteredTotal === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filteredTotal)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-outline-variant/10 bg-surface-container-low/20 text-sm text-on-surface-variant">
      <p>
        Hiển thị{' '}
        <span className="font-bold text-on-surface tabular-nums">
          {from}–{to}
        </span>{' '}
        trong{' '}
        <span className="font-bold text-on-surface tabular-nums">{filteredTotal}</span> tài khoản (bộ lọc hiện tại)
      </p>
      <div className="flex items-center justify-center sm:justify-end gap-3 flex-wrap">
        {filteredTotal > 0 ? (
          <OrgTablePageSizeSelect value={pageSize} onChange={onPageSizeChange} id="user-page-size" />
        ) : null}
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
          className="px-3 py-1.5 rounded-lg font-bold text-sm border border-outline-variant/25 disabled:opacity-40"
        >
          Trước
        </button>
        <span className="text-xs font-mono tabular-nums px-2">
          {safePage}/{totalPages}
        </span>
        <button
          type="button"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
          className="px-3 py-1.5 rounded-lg font-bold text-sm border border-outline-variant/25 disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  )
}
