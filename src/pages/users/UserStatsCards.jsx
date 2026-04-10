export default function UserStatsCards({ filtered, totalInDb }) {
  const active = filtered.filter((u) => u.status === 'active').length
  const pending = filtered.filter((u) => u.status === 'pending').length
  const locked = filtered.filter((u) => u.status === 'locked').length
  const teachers = filtered.filter((u) => u.roleFilterKey === 'teacher').length
  const sao = filtered.filter((u) => u.roleFilterKey === 'sao_do').length

  const cards = [
    {
      icon: 'badge',
      label: 'Khớp bộ lọc',
      value: String(filtered.length),
      sub: totalInDb != null ? `Tổng ${totalInDb} tài khoản (Firestore)` : 'Theo vai trò & trạng thái',
      bg: 'bg-primary-fixed/35 dark:bg-primary-container/20',
    },
    {
      icon: 'check_circle',
      label: 'Đang hoạt động',
      value: String(active),
      sub: 'Đăng nhập được',
      bg: 'bg-green-50 dark:bg-green-950/25',
    },
    {
      icon: 'hourglass_top',
      label: 'Chờ kích hoạt',
      value: String(pending),
      sub: 'Chưa đăng nhập lần đầu',
      bg: 'bg-amber-50 dark:bg-amber-950/25',
    },
    {
      icon: 'lock',
      label: 'Đã khóa',
      value: String(locked),
      sub: 'Tạm ngưng / vi phạm',
      bg: 'bg-slate-100 dark:bg-slate-800/50',
    },
    {
      icon: 'school',
      label: 'Giáo viên (lọc)',
      value: String(teachers),
      sub: 'Liên kết tổ CM · lớp',
      bg: 'bg-secondary-container/50 dark:bg-secondary/20',
    },
    {
      icon: 'flag',
      label: 'Sao Đỏ (lọc)',
      value: String(sao),
      sub: 'Tuần tra · ghi điểm',
      bg: 'bg-red-50 dark:bg-red-950/20',
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6 mb-8">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`rounded-2xl p-5 border border-outline-variant/10 shadow-sm ${c.bg}`}
        >
          <span className="material-symbols-outlined text-2xl text-primary/80">{c.icon}</span>
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant mt-2">
            {c.label}
          </p>
          <p className="text-2xl font-extrabold text-primary font-headline mt-1 tabular-nums">{c.value}</p>
          <p className="text-xs text-on-surface-variant mt-1 leading-snug">{c.sub}</p>
        </div>
      ))}
    </div>
  )
}
