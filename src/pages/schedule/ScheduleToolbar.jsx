import { SHIFT_KEYS, SHIFT_LABELS } from './scheduleMockData.js'

export default function ScheduleToolbar({
  weekOffset,
  onWeekOffsetChange,
  weekOptions,
  shift,
  onShiftChange,
  areaFilter,
  onAreaFilterChange,
  areaFilterOptions,
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-5 shadow-sm border border-outline-variant/10 flex flex-col lg:flex-row lg:flex-wrap lg:items-end gap-5">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-0.5">Tuần học</label>
        <select
          value={String(weekOffset)}
          onChange={(e) => onWeekOffsetChange(Number(e.target.value))}
          className="bg-surface-container-low border border-outline-variant/15 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-primary/20"
        >
          {weekOptions.map((o) => (
            <option key={o.offset} value={String(o.offset)}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5 min-w-0 flex-1 max-w-md">
        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-0.5">Ca trực</label>
        <div className="flex flex-wrap bg-surface-container-low p-1 rounded-xl gap-1">
          {SHIFT_KEYS.map((k) => {
            const active = shift === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => onShiftChange(k)}
                className={`flex-1 min-w-[5.5rem] px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm ring-1 ring-primary/15'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {SHIFT_LABELS[k]}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 min-w-[200px] lg:ml-auto">
        <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant px-0.5">Khu vực</label>
        <select
          value={areaFilter}
          onChange={(e) => onAreaFilterChange(e.target.value)}
          className="bg-surface-container-low border border-outline-variant/15 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-primary/20"
        >
          {(areaFilterOptions ?? [{ value: 'all', label: 'Tất cả' }]).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
