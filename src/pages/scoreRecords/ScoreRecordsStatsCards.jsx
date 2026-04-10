export default function ScoreRecordsStatsCards({ total, pending, flagged, sumPlus, sumMinus }) {
  const cards = [
    {
      icon: 'fact_check',
      label: 'Bản ghi (bộ lọc)',
      value: String(total),
      sub: 'Theo khoảng thời gian & lớp đã chọn',
      tone: 'text-primary',
      bg: 'bg-primary-fixed/40 dark:bg-primary-container/25',
    },
    {
      icon: 'hourglass_top',
      label: 'Chờ duyệt',
      value: String(pending),
      sub: 'Cần BGH / GVCN xác nhận',
      tone: 'text-amber-800 dark:text-amber-200',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      icon: 'flag',
      label: 'Xử lý nghiêm',
      value: String(flagged),
      sub: 'Đã gắn cờ trên Firestore (chỉ ADMIN)',
      tone: 'text-error',
      bg: 'bg-error-container/40 dark:bg-error/10',
    },
    {
      icon: 'balance',
      label: 'Tổng điểm ± (bộ lọc)',
      value: (
        <span className="tabular-nums">
          <span className="text-green-700 dark:text-green-400">+{sumPlus}</span>
          <span className="text-on-surface-variant mx-1">/</span>
          <span className="text-error">{sumMinus}</span>
        </span>
      ),
      sub: 'Cộng dồn theo danh sách hiển thị',
      tone: 'text-on-surface',
      bg: 'bg-surface-container-high/80',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl p-5 border border-outline-variant/10 shadow-sm ${c.bg}`}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="material-symbols-outlined text-3xl text-primary/80">{c.icon}</span>
          </div>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant mt-3">
            {c.label}
          </p>
          <p className={`text-2xl font-extrabold mt-1 font-headline ${c.tone}`}>{c.value}</p>
          <p className="text-xs text-on-surface-variant mt-1 leading-snug">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
