import ScheduleEmptyCell from './ScheduleEmptyCell.jsx'
import SchedulePersonCell from './SchedulePersonCell.jsx'
import { isAssignmentFilled } from './scheduleMockData.js'

export default function ScheduleGrid({ zones, columns, assignments, todayKey, onCellAdd, onCellEdit }) {
  const findAssign = (zoneId, dateKey) =>
    assignments.find((a) => a.zoneId === zoneId && a.dateKey === dateKey && isAssignmentFilled(a))

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="overflow-x-auto">
        <div
          className="inline-grid min-w-full"
          style={{ gridTemplateColumns: `minmax(160px,200px) repeat(${columns.length}, minmax(104px,1fr))` }}
        >
          {/* Header row */}
          <div className="sticky left-0 z-20 bg-gradient-to-br from-red-50/95 to-surface-container-low dark:from-red-950/40 dark:to-slate-900 p-4 border-b border-r border-outline-variant/10 flex items-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-on-surface-variant">Khu vực</span>
          </div>
          {columns.map((col) => {
            const isToday = col.dateKey === todayKey
            return (
              <div
                key={col.dateKey}
                className={`p-3 sm:p-4 text-center border-b border-outline-variant/10 border-r border-outline-variant/5 last:border-r-0 ${
                  isToday ? 'bg-primary/8 ring-1 ring-inset ring-primary/25' : 'bg-surface-container-low/40'
                }`}
              >
                <div className={`text-sm font-extrabold ${isToday ? 'text-primary' : 'text-primary/90'}`}>
                  {col.weekdayLabel}
                </div>
                <div className="text-[11px] font-medium text-on-surface-variant mt-0.5">{col.shortDate}</div>
                {isToday ? (
                  <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Hôm nay
                  </span>
                ) : null}
              </div>
            )
          })}

          {/* Data rows */}
          {zones.map((zone, zi) => (
            <div key={zone.id} className="contents">
              <div
                className={`sticky left-0 z-10 flex flex-col justify-center p-4 border-r border-outline-variant/10 border-b border-outline-variant/5 bg-surface-container-lowest ${
                  zi % 2 === 1 ? 'bg-surface-container-low/30' : ''
                }`}
              >
                <span className="font-bold text-sm text-primary leading-snug">{zone.name}</span>
                <span className="text-[10px] text-on-surface-variant mt-1 leading-snug">{zone.subtitle}</span>
              </div>
              {columns.map((col, ci) => {
                const a = findAssign(zone.id, col.dateKey)
                const isToday = col.dateKey === todayKey
                return (
                  <div
                    key={`${zone.id}-${col.dateKey}`}
                    className={`p-2 border-r border-outline-variant/5 border-b border-outline-variant/5 last:border-r-0 ${
                      zi % 2 === 1 ? 'bg-surface-container-low/20' : ''
                    } ${isToday ? 'bg-primary/[0.04]' : ''}`}
                  >
                    {a ? (
                      <SchedulePersonCell
                        name={a.memberName}
                        avatarUrl={a.avatarUrl}
                        onEdit={() => onCellEdit?.({ zone, column: col, assignment: a })}
                      />
                    ) : (
                      <ScheduleEmptyCell onAdd={() => onCellAdd?.({ zone, column: col })} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
