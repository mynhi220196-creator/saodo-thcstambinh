const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    label: 'Đang hoạt động',
    pill: 'bg-green-50 text-green-800 dark:bg-green-950/40 dark:text-green-200',
  },
  archived: {
    dot: 'bg-slate-400',
    label: 'Đã khóa (năm cũ)',
    pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
}

function InfoCard({ icon, title, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-2xl shrink-0">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant mb-1">
            {title}
          </p>
          <div className="text-sm text-on-surface font-medium">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function ClassDetailOverview({ detail }) {
  const st = STATUS_STYLES[detail.status] ?? STATUS_STYLES.active

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8">
      <InfoCard icon="person" title="Giáo viên chủ nhiệm">
        <p className="font-semibold text-base">{detail.homeroomTeacher}</p>
        <p className="text-on-surface-variant font-normal text-sm mt-0.5 break-all">{detail.email}</p>
        <p className="text-on-surface-variant font-normal text-sm mt-1">
          Điện thoại: <span className="text-on-surface tabular-nums">{detail.phoneGvcn}</span>
        </p>
        {detail.viceHomeroom ? (
          <p className="text-on-surface-variant font-normal text-sm mt-2 pt-2 border-t border-outline-variant/20">
            GVCN phụ: <span className="text-on-surface">{detail.viceHomeroom}</span>
          </p>
        ) : null}
      </InfoCard>

      <InfoCard icon="domain" title="Tổ chuyên môn · Phòng học">
        <p>{detail.departmentName}</p>
        <p className="text-on-surface-variant font-normal text-sm mt-2">
          Phòng học cố định:{' '}
          <span className="font-mono text-on-surface font-semibold">{detail.room}</span>
        </p>
        <p className="text-on-surface-variant font-normal text-sm mt-1">
          Họp lớp: <span className="text-on-surface">{detail.weekdayMeeting}</span>
        </p>
      </InfoCard>

      <InfoCard icon="calendar_month" title="Năm học &amp; khối" className="sm:col-span-2 xl:col-span-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-on-surface font-bold">{detail.schoolYear}</span>
          <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-xs font-bold rounded-full">
            Khối {detail.grade}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${st.pill}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
          </span>
        </div>
        <p className="text-on-surface-variant font-normal text-sm mt-3">
          Sĩ số:{' '}
          <span className="text-on-surface font-bold tabular-nums text-lg">{detail.studentCount}</span>{' '}
          học sinh
        </p>
      </InfoCard>
    </div>
  )
}
