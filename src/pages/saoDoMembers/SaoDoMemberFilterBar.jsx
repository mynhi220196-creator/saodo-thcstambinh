import {
  GRADE_FILTER_OPTIONS,
  MEMBER_STATUS_OPTIONS,
  ROLE_FILTER_OPTIONS,
} from './saoDoMemberMockData.js'

export default function SaoDoMemberFilterBar({
  gradeFilter,
  onGradeFilterChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  query,
  onQueryChange,
  onExport,
}) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl mb-6 flex flex-col gap-4">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
          search
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm theo tên, email, UID, lớp, SĐT…"
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-10 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">stairs</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">
              Khối:
            </span>
            <select
              value={gradeFilter}
              onChange={(e) => onGradeFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer"
            >
              {GRADE_FILTER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">badge</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">
              Vai trò:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer min-w-[9rem]"
            >
              {ROLE_FILTER_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">toggle_on</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">
              Trạng thái:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer min-w-[10rem]"
            >
              {MEMBER_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface text-sm font-semibold rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          <span>Xuất CSV (đang lọc)</span>
        </button>
      </div>
    </div>
  )
}
