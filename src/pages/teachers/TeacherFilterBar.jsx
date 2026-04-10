import { TEACHER_STATUS_OPTIONS } from './teacherMockData.js'

export default function TeacherFilterBar({
  department,
  onDepartmentChange,
  departmentOptions,
  statusFilter,
  onStatusFilterChange,
  query,
  onQueryChange,
  onExport,
}) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl mb-6 flex flex-col gap-4">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
          <span className="material-symbols-outlined text-[22px]">search</span>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm theo tên, email, UID, tổ CM, lớp CN…"
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-11 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Tổ / đơn vị:</span>
            <select
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer max-w-[14rem] sm:max-w-none"
            >
              {departmentOptions.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer"
            >
              {TEACHER_STATUS_OPTIONS.map((s) => (
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
