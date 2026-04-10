export default function ScheduleStatsCards({ filled, totalSlots, empty }) {
  const pct = totalSlots > 0 ? Math.round((filled / totalSlots) * 100) : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-2xl p-6 bg-gradient-to-br from-red-600 to-primary text-white shadow-lg shadow-red-600/15">
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Đã lấp đầy (ca đang xem)</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl font-headline font-extrabold tabular-nums">{filled}</span>
          <span className="text-sm font-medium opacity-90">/ {totalSlots} ô</span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/20 overflow-hidden">
          <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs mt-2 opacity-85">{pct}% khu/ngày đã có người trực</p>
      </div>
      <div className="rounded-2xl p-6 bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Ô còn trống</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-4xl font-headline font-extrabold text-error tabular-nums">{empty}</span>
          <span className="text-sm font-medium text-on-surface-variant">cần phân công</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">
          Ưu tiên khu cổng và sân khi thiếu người. Kéo thả từ cột phải (sắp có).
        </p>
      </div>
    </div>
  )
}
