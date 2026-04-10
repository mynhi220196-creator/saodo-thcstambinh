import { Link, useNavigate } from 'react-router-dom'

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    label: 'Đang hoạt động',
    labelClass: 'text-green-700',
  },
  archived: {
    dot: 'bg-slate-400',
    label: 'Vô hiệu',
    labelClass: 'text-slate-600',
  },
}

export default function ClassTableRow({ row, onEdit, onToggleActive }) {
  const navigate = useNavigate()
  const st = STATUS_STYLES[row.status] ?? STATUS_STYLES.active
  const detailPath = `/admin/classes/${row.id}`

  function goDetail() {
    navigate(detailPath)
  }

  return (
    <tr
      role="link"
      tabIndex={0}
      onClick={goDetail}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          goDetail()
        }
      }}
      className="group hover:bg-surface-container-low/30 transition-colors cursor-pointer"
    >
      <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">
        <Link
          to={detailPath}
          onClick={(e) => e.stopPropagation()}
          className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
        >
          {row.code}
        </Link>
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-xs font-bold rounded-full">
          Khối {row.grade}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-on-surface">{row.homeroomTeacher}</span>
        <p className="text-xs text-on-surface-variant truncate max-w-[200px]">{row.email}</p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-body text-on-surface-variant">{row.room}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-on-surface tabular-nums">{row.studentCount}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-mono text-on-surface-variant">{row.schoolYear}</span>
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
            to={detailPath}
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary rounded-lg transition-all"
            title="Xem chi tiết"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.(row)
            }}
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary rounded-lg transition-all"
            title="Chỉnh sửa"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive?.(row)
            }}
            className="p-2 text-on-surface-variant hover:bg-amber-50 hover:text-amber-800 rounded-lg transition-all"
            title={row.status === 'active' ? 'Vô hiệu lớp' : 'Kích hoạt lại'}
          >
            <span className="material-symbols-outlined text-xl">
              {row.status === 'active' ? 'block' : 'check_circle'}
            </span>
          </button>
        </div>
      </td>
    </tr>
  )
}
