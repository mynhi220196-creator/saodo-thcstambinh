export default function StudentStatsCards({ total, active, archived, filteredCount }) {
  const cards = [
    {
      id: 'total',
      label: 'Tổng học sinh (CSDL)',
      value: String(total),
      hint: 'Gồm cả hồ sơ đã ẩn (xoá mềm)',
      icon: 'groups',
      borderClass: 'border-l-4 border-primary',
      circleClass: 'bg-primary-fixed text-primary',
      fillIcon: true,
    },
    {
      id: 'active',
      label: 'Đang học',
      value: String(active),
      hint: 'Hiển thị trong danh sách mặc định',
      icon: 'school',
      borderClass: 'border-l-4 border-secondary',
      circleClass: 'bg-secondary-fixed text-secondary',
      fillIcon: true,
    },
    {
      id: 'filter',
      label: 'Khớp bộ lọc hiện tại',
      value: String(filteredCount),
      hint: 'Theo lớp, trạng thái và từ khoá',
      icon: 'filter_alt',
      borderClass: 'border-l-4 border-tertiary',
      circleClass: 'bg-tertiary-fixed text-tertiary',
      fillIcon: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-surface-container-lowest p-6 rounded-xl flex items-center gap-5 ${card.borderClass}`}
        >
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${card.circleClass}`}>
            <span
              className="material-symbols-outlined text-3xl"
              style={card.fillIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {card.icon}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">{card.label}</p>
            <h3 className="editorial-title text-3xl font-extrabold text-on-surface">{card.value}</h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-snug">{card.hint}</p>
            {card.id === 'active' && archived > 0 ? (
              <p className="text-xs text-on-surface-variant mt-1">Đã ẩn: {archived}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
