import { GRADE_FILTER_OPTIONS, SCHOOL_YEAR_OPTIONS } from './classMockData.js'

export default function ClassFilterBar({
  schoolYear,
  onSchoolYearChange,
  gradeFilter,
  onGradeFilterChange,
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
          placeholder="Tìm theo mã lớp, GVCN, email hoặc phòng…"
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-11 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
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
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">stairs</span>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter shrink-0">
              Khối:
            </span>
            <select
              value={gradeFilter}
              onChange={(e) => onGradeFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer min-w-[8rem]"
            >
              {GRADE_FILTER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface text-sm font-semibold rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>
    </div>
  )
}
