import { Link } from 'react-router-dom'

const crumb =
  'text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors'
const crumbCurrent = 'text-xs font-bold uppercase tracking-widest text-primary'

export default function ClassDetailBreadcrumb({ classCode }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 mb-6">
      <span className={crumb}>Tổ chức</span>
      <span className="material-symbols-outlined text-on-surface-variant text-[14px] shrink-0">
        chevron_right
      </span>
      <Link to="/admin/classes" className={crumb}>
        Lớp học
      </Link>
      <span className="material-symbols-outlined text-on-surface-variant text-[14px] shrink-0">
        chevron_right
      </span>
      <span className={crumbCurrent} aria-current="page">
        Chi tiết · {classCode}
      </span>
    </nav>
  )
}
