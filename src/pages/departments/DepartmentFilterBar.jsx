import { DEPARTMENT_STATUS_OPTIONS, SCHOOL_YEAR_OPTIONS } from './departmentMockData.js'

export default function DepartmentFilterBar({
  schoolYear,
  onSchoolYearChange,
  statusFilter,
  onStatusFilterChange,
}) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">calendar_month</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">
            Năm học:
          </span>
          <select
            value={schoolYear}
            onChange={(e) => onSchoolYearChange(e.target.value)}
            className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer min-w-[10rem]"
          >
            {SCHOOL_YEAR_OPTIONS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">rule</span>
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">
            Trạng thái tổ:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer min-w-[11rem]"
          >
            {DEPARTMENT_STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-all"
          title="Làm mới"
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface text-sm font-semibold rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          <span>Xuất cấu trúc tổ</span>
        </button>
      </div>
    </div>
  )
}
