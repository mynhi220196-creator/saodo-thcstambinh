/** Các mức số dòng mỗi trang cho bảng Tổ chức / Người dùng. */
export const ORG_PAGE_SIZE_OPTIONS = [5, 10, 15, 20]

export const DEFAULT_ORG_PAGE_SIZE = 10

export default function OrgTablePageSizeSelect({ value, onChange, id = 'org-page-size' }) {
  return (
    <label htmlFor={id} className="inline-flex items-center gap-2 text-sm text-on-surface-variant shrink-0">
      <span className="font-medium whitespace-nowrap">Mỗi trang</span>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-2.5 py-1.5 text-sm font-semibold text-on-surface tabular-nums focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {ORG_PAGE_SIZE_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  )
}
