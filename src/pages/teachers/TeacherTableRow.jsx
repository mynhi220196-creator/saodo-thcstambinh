import { Link } from 'react-router-dom'
import AvatarDisplay from '../../components/AvatarDisplay.jsx'

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    label: 'Đang hoạt động',
    labelClass: 'text-green-700',
  },
  pending: {
    dot: 'bg-amber-500',
    label: 'Chưa đăng nhập',
    labelClass: 'text-amber-800',
  },
  locked: {
    dot: 'bg-slate-400',
    label: 'Đã khóa',
    labelClass: 'text-slate-600',
  },
}

export default function TeacherTableRow({ teacher }) {
  const st = STATUS_STYLES[teacher.status] ?? STATUS_STYLES.active

  return (
    <tr className="group hover:bg-surface-container-low/30 transition-colors">
      <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">
        <span title={teacher.id}>{teacher.codeShort}</span>
      </td>
      <td className="px-6 py-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <AvatarDisplay src={teacher.avatar} alt={teacher.name} className="w-10 h-10 shrink-0" iconClassName="text-xl" />
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate">{teacher.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{teacher.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-on-surface">{teacher.department}</span>
      </td>
      <td className="px-6 py-4 max-w-[240px]">
        {teacher.homeroomClass ? (
          <span
            className="text-xs font-semibold text-on-surface block truncate"
            title={teacher.homeroomClass}
          >
            {teacher.homeroomClass}
          </span>
        ) : (
          <span className="text-xs italic text-on-surface-variant">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-body text-on-surface-variant">{teacher.phone}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
          <span className={`text-xs font-bold uppercase ${st.labelClass}`}>{st.label}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/admin/users?q=${encodeURIComponent(teacher.email === '—' ? teacher.id : teacher.email)}`}
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary rounded-lg transition-all inline-flex"
            title="Mở trong Quản lý người dùng"
          >
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
          </Link>
        </div>
      </td>
    </tr>
  )
}
