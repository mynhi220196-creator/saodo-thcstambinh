import { formatDateTimeVN } from '../lib/dateFormat.js'
import RankBadge from './RankBadge.jsx'

const PODIUM_META = [
  { medal: '🥇', ring: 'ring-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/30', order: 'order-2', scale: 'sm:scale-110 sm:-translate-y-2' },
  { medal: '🥈', ring: 'ring-slate-300', bg: 'bg-slate-50 dark:bg-slate-900/40', order: 'order-1', scale: '' },
  { medal: '🥉', ring: 'ring-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/30', order: 'order-3', scale: '' },
]

function classLabel(e) {
  return e.class_code && e.class_code !== '—' ? e.class_code : e.class_name || '—'
}

/**
 * Bảng vinh danh tuần — tái dùng cho dashboard admin, GV và màn hình lớn (TV).
 *
 * props:
 *   ranking            { label, weekStart, weekEnd, entries[], publishedByName, _publishedMs } | null
 *   highlightClassIds  mảng id lớp cần làm nổi bật (vd lớp GVCN)
 *   tvMode             phóng to cho màn hình lớn
 *   emptyHint          text khi chưa có dữ liệu
 */
export default function WeeklyHonorBoard({ ranking, highlightClassIds = [], tvMode = false, emptyHint }) {
  const entries = ranking?.entries ?? []
  const hiSet = new Set((highlightClassIds ?? []).filter(Boolean))
  const isHighlighted = (e) => Boolean(e.class_id) && hiSet.has(e.class_id)
  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)

  const titleSize = tvMode ? 'text-4xl sm:text-5xl' : 'text-xl sm:text-2xl'
  const cardPad = tvMode ? 'p-8' : 'p-5'

  return (
    <section className={`rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/60 to-surface-container-lowest dark:from-amber-950/20 shadow-sm overflow-hidden`}>
      <div className={`flex flex-col items-center text-center gap-1 border-b border-amber-200/50 dark:border-amber-900/40 ${cardPad}`}>
        <span className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 font-extrabold uppercase tracking-widest text-xs">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            trophy
          </span>
          Vinh danh thi đua
        </span>
        <h2 className={`font-headline font-extrabold text-on-surface ${titleSize}`}>Lớp xuất sắc trong tuần</h2>
        {ranking?.label ? <p className="text-on-surface-variant font-semibold">{ranking.label}</p> : null}
        {ranking?._publishedMs ? (
          <p className="text-[11px] text-on-surface-variant">
            Công bố {formatDateTimeVN(ranking._publishedMs)}
            {ranking.publishedByName ? ` · ${ranking.publishedByName}` : ''}
          </p>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="px-6 py-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-amber-400/60 mb-2 block">workspace_premium</span>
          <p className="text-sm">{emptyHint ?? 'Chưa có bảng xếp hạng tuần được công bố.'}</p>
        </div>
      ) : (
        <div className={cardPad}>
          {/* Bục vinh danh top 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
            {podium.map((e, i) => {
              const m = PODIUM_META[i]
              const isHi = isHighlighted(e)
              return (
                <div
                  key={e.class_id || e.class_code || i}
                  className={`flex flex-col items-center rounded-2xl ring-2 ${m.ring} ${m.bg} ${m.order} ${m.scale} ${cardPad} ${
                    isHi ? 'outline outline-2 outline-emerald-500' : ''
                  }`}
                >
                  <span className={tvMode ? 'text-6xl' : 'text-4xl'}>{m.medal}</span>
                  <p className={`font-headline font-extrabold text-on-surface mt-2 ${tvMode ? 'text-3xl' : 'text-xl'}`}>
                    {classLabel(e)}
                  </p>
                  {e.rank_name ? (
                    <div className="mt-2">
                      <RankBadge name={e.rank_name} icon={e.rank_icon} color={e.rank_color} size={tvMode ? 'lg' : 'md'} />
                    </div>
                  ) : null}
                  <p className={`tabular-nums font-extrabold mt-2 ${e.final_points < 0 ? 'text-rose-600' : 'text-emerald-700 dark:text-emerald-300'} ${tvMode ? 'text-3xl' : 'text-lg'}`}>
                    {e.final_points > 0 ? `+${e.final_points}` : e.final_points} điểm
                  </p>
                  {isHi ? <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mt-1">Lớp của bạn</p> : null}
                </div>
              )
            })}
          </div>

          {/* Phần còn lại */}
          {rest.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-outline-variant/15">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4 py-2.5 text-center w-16">Hạng</th>
                    <th className="px-4 py-2.5">Lớp</th>
                    <th className="px-4 py-2.5">Huy hiệu</th>
                    <th className="px-4 py-2.5 text-right">Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {rest.map((e) => {
                    const isHi = isHighlighted(e)
                    return (
                      <tr
                        key={e.class_id || e.class_code}
                        className={isHi ? 'bg-emerald-50/70 dark:bg-emerald-950/30' : 'hover:bg-surface-container-low/30'}
                      >
                        <td className="px-4 py-2.5 text-center tabular-nums font-bold text-on-surface-variant">
                          {e.rank_position}
                        </td>
                        <td className="px-4 py-2.5 font-semibold text-on-surface">
                          {classLabel(e)}
                          {isHi ? (
                            <span className="ml-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">(lớp của bạn)</span>
                          ) : null}
                        </td>
                        <td className="px-4 py-2.5">
                          {e.rank_name ? (
                            <RankBadge name={e.rank_name} icon={e.rank_icon} color={e.rank_color} size="sm" />
                          ) : (
                            <span className="text-xs text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className={`px-4 py-2.5 text-right tabular-nums font-bold ${e.final_points < 0 ? 'text-rose-600' : 'text-on-surface'}`}>
                          {e.final_points > 0 ? `+${e.final_points}` : e.final_points}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
