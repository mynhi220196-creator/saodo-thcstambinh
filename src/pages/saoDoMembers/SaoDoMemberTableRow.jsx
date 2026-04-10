import { Link } from 'react-router-dom'
import AvatarDisplay from '../../components/AvatarDisplay.jsx'
import { ROLE_LABELS, SHIFT_LABELS } from './saoDoMemberMockData.js'

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
  suspended: {
    dot: 'bg-slate-400',
    label: 'Tạm dừng / Khóa',
    labelClass: 'text-slate-600',
  },
}

const ROLE_BADGE = {
  lead: 'bg-red-600 text-white',
  deputy: 'bg-primary text-white',
  member: 'bg-surface-container-high text-on-surface',
}

export default function SaoDoMemberTableRow({ member }) {
  const st = STATUS_STYLES[member.status] ?? STATUS_STYLES.active
  const roleBadge = ROLE_BADGE[member.role] ?? ROLE_BADGE.member
  const q = member.email && member.email !== '—' ? member.email : member.id

  return (
    <tr className="group hover:bg-red-50/40 dark:hover:bg-red-950/10 transition-colors">
      <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">
        <span title={member.id}>{member.code}</span>
      </td>
      <td className="px-6 py-4 min-w-[220px]">
        <div className="flex items-center gap-3">
          <AvatarDisplay
            src={member.avatar}
            alt={member.name}
            className="w-10 h-10 shrink-0 ring-2 ring-red-100 dark:ring-red-900/40"
            iconClassName="text-xl"
          />
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate">{member.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{member.phone}</p>
            {member.email && member.email !== '—' ? (
              <p className="text-[11px] text-on-surface-variant/80 truncate">{member.email}</p>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-semibold text-on-surface">{member.className}</span>
        {member.grade != null ? (
          <span className="text-xs text-on-surface-variant ml-1">(Khối {member.grade})</span>
        ) : null}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${roleBadge}`}>
          {ROLE_LABELS[member.role]}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-on-surface-variant">{SHIFT_LABELS[member.shiftPref]}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-on-surface-variant">{member.joinedAt}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
          <span className={`text-xs font-bold uppercase ${st.labelClass}`}>{st.label}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/admin/users?q=${encodeURIComponent(q)}`}
            className="p-2 text-on-surface-variant hover:bg-white hover:text-primary rounded-lg transition-all inline-flex"
            title="Quản lý người dùng"
          >
            <span className="material-symbols-outlined text-xl">manage_accounts</span>
          </Link>
        </div>
      </td>
    </tr>
  )
}
