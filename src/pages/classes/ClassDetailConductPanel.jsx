import { Link } from 'react-router-dom'

const TREND = {
  up: { icon: 'trending_up', label: 'Tăng nhẹ', class: 'text-green-700 dark:text-green-400' },
  down: { icon: 'trending_down', label: 'Giảm', class: 'text-error' },
  flat: { icon: 'trending_flat', label: 'Ổn định', class: 'text-on-surface-variant' },
}

export default function ClassDetailConductPanel({ detail }) {
  const trend = TREND[detail.conductTrend] ?? TREND.flat
  const hasScore = typeof detail.conductMonthAvg === 'number'

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="font-headline font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-2xl">military_tech</span>
            Điểm tác phong (tháng)
          </h3>
          <Link
            to="/admin/conduct-criteria"
            className="text-xs font-bold text-primary hover:underline shrink-0"
          >
            Tiêu chí
          </Link>
        </div>
        {hasScore ? (
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-on-surface-variant tracking-wider">
                Điểm TB lớp
              </p>
              <p className="text-4xl font-extrabold text-primary tabular-nums leading-none mt-1">
                {detail.conductMonthAvg}
              </p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${trend.class}`}>
              <span className="material-symbols-outlined text-xl">{trend.icon}</span>
              {trend.label}
            </div>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">Chưa có tổng hợp điểm tháng.</p>
        )}
        {detail.positivePointsMonth != null && detail.minusPointsMonth != null ? (
          <div className="mt-4 pt-4 border-t border-outline-variant/15 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase">Tổng điểm +</p>
              <p className="font-bold text-green-700 dark:text-green-400 tabular-nums text-lg">
                +{detail.positivePointsMonth}
              </p>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs font-bold uppercase">Tổng điểm −</p>
              <p className="font-bold text-error tabular-nums text-lg">−{detail.minusPointsMonth}</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
        <h3 className="font-headline font-bold text-primary flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-2xl">volunteer_activism</span>
          Sao Đỏ · Trực nhật
        </h3>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-on-surface-variant text-xs font-bold uppercase tracking-wide">
              Phụ trách Sao Đỏ
            </dt>
            <dd className="font-medium text-on-surface mt-0.5">
              {detail.saoDoLeadName ?? 'Chưa gán'}
            </dd>
          </div>
          <div>
            <dt className="text-on-surface-variant text-xs font-bold uppercase tracking-wide">
              Trực nhật tuần này
            </dt>
            <dd className="font-medium text-on-surface mt-0.5">{detail.dutyStudentThisWeek}</dd>
          </div>
        </dl>
        <Link
          to="/admin/sao-do/members"
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          Danh sách thành viên Sao Đỏ
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-outline-variant/15 bg-primary-fixed/30 dark:bg-primary-container/20 p-5">
        <h3 className="font-headline font-bold text-primary flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-2xl">sticky_note_2</span>
          Ghi chú nội bộ
        </h3>
        <p className="text-sm text-on-surface leading-relaxed">{detail.internalNotes}</p>
      </div>
    </div>
  )
}
