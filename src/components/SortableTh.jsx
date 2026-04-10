/**
 * Tiêu đề cột bảng có thể click để sắp xếp (tăng/giảm).
 */
export default function SortableTh({
  sortKey,
  activeKey,
  dir,
  onSort,
  align = 'left',
  className = '',
  disabled = false,
  children,
}) {
  if (disabled) {
    return <th className={className}>{children}</th>
  }

  const active = activeKey === sortKey
  const icon = active ? (dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'
  const justify = align === 'right' ? 'justify-end text-right' : 'justify-start text-left'

  return (
    <th className={className}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSort(sortKey)
        }}
        className={`group inline-flex w-full items-start gap-1 leading-snug ${justify}`}
        title="Sắp xếp"
      >
        <span className="min-w-0">{children}</span>
        <span
          className={`material-symbols-outlined text-sm leading-none mt-0.5 shrink-0 ${
            active ? 'opacity-100 text-on-surface' : 'opacity-30 group-hover:opacity-70'
          }`}
          aria-hidden
        >
          {icon}
        </span>
      </button>
    </th>
  )
}
