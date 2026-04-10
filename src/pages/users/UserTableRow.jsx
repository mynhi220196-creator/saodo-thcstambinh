import AvatarDisplay from '../../components/AvatarDisplay.jsx'
import { formatLastLogin, ROLE_LABEL } from './userMockData.js'

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    label: 'Hoạt động',
    labelClass: 'text-green-700 dark:text-green-400',
  },
  pending: {
    dot: 'bg-amber-500',
    label: 'Chờ kích hoạt',
    labelClass: 'text-amber-800 dark:text-amber-200',
  },
  locked: {
    dot: 'bg-slate-400',
    label: 'Đã khóa',
    labelClass: 'text-slate-600 dark:text-slate-300',
  },
}

const ROLE_PILL = {
  ADMIN: 'bg-violet-100 text-violet-900 dark:bg-violet-950/40 dark:text-violet-200',
  TEACHER: 'bg-primary-fixed/60 text-on-primary-fixed',
  TEACHER_SUBJECT: 'bg-primary-fixed/60 text-on-primary-fixed',
  TEACHER_HOMEROOM: 'bg-primary-fixed/60 text-on-primary-fixed',
  RED_STAR: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-200',
}

export default function UserTableRow({ user, currentUserId, onDetail, onEdit, onToggleLock }) {
  const st = STATUS_STYLES[user.status] ?? STATUS_STYLES.active
  const rolePill = ROLE_PILL[user.role] ?? 'bg-surface-container-high text-on-surface'
  const isSelf = user.id === currentUserId
  const raw = user._raw ?? {}
  const isActive = raw.is_active !== false

  return (
    <tr className="group hover:bg-surface-container-low/30 transition-colors">
      <td className="px-6 py-4 font-mono text-xs text-primary font-bold whitespace-nowrap max-w-[120px] truncate" title={user.id}>
        {user.id.slice(0, 8)}…
      </td>
      <td className="px-6 py-4 min-w-[240px]">
        <div className="flex items-center gap-3">
          <AvatarDisplay src={user.avatar} alt="" className="w-10 h-10 shrink-0" iconClassName="text-xl" />
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate">{user.fullName}</p>
            <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-extrabold ${rolePill}`}>
          {ROLE_LABEL[user.role] ?? user.role}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-on-surface line-clamp-2">{user.unit}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-body text-on-surface-variant tabular-nums">{formatLastLogin(user.lastLoginAt)}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-mono text-on-surface-variant">{user.createdAt}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
          <span className={`text-xs font-bold uppercase ${st.labelClass}`}>{st.label}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary dark:hover:bg-slate-800 rounded-lg transition-all"
            title="Chi tiết"
            onClick={() => onDetail?.(user)}
          >
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
          </button>
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary dark:hover:bg-slate-800 rounded-lg transition-all"
            title="Chỉnh sửa"
            onClick={() => onEdit?.(user)}
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            type="button"
            disabled={isSelf}
            className="p-2 text-on-surface-variant hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-slate-800 rounded-lg transition-all disabled:opacity-30"
            title={isSelf ? 'Không thể khóa chính mình' : isActive ? 'Khóa' : 'Mở khóa'}
            onClick={() => onToggleLock?.(user)}
          >
            <span className="material-symbols-outlined text-xl">{isActive ? 'lock' : 'lock_open'}</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
