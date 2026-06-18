import AvatarDisplay from '../../components/AvatarDisplay.jsx'

const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    label: 'Đang học',
    labelClass: 'text-green-700',
  },
  inactive: {
    dot: 'bg-slate-400',
    label: 'Đã ẩn',
    labelClass: 'text-slate-600',
  },
}

export default function StudentTableRow({ student, onEdit, onSoftDelete, onShowQr }) {
  const st = STATUS_STYLES[student.status] ?? STATUS_STYLES.active

  return (
    <tr className="group hover:bg-surface-container-low/30 transition-colors">
      <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">{student.code}</td>
      <td className="px-6 py-4 min-w-[200px]">
        <div className="flex items-center gap-3">
          <AvatarDisplay src={student.avatar} alt="" className="w-10 h-10 shrink-0" iconClassName="text-xl" />
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate">{student.name}</p>
            <p className="text-xs text-on-surface-variant truncate">{student.subtitle}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-on-surface">{student.className}</span>
      </td>
      <td className="px-6 py-4">
        {student.saoDo ? (
          <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-xs font-bold rounded-full">Có</span>
        ) : (
          <span className="text-xs italic text-on-surface-variant">—</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm font-body text-on-surface-variant">{student.parentPhone}</span>
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
            onClick={() => onShowQr?.(student)}
            className="p-2 text-on-surface-variant hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-all"
            title="Xem & in mã QR"
          >
            <span className="material-symbols-outlined text-xl">qr_code_2</span>
          </button>
          <button
            type="button"
            onClick={() => onEdit?.(student)}
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary rounded-lg transition-all"
            title="Chỉnh sửa"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          {student.status === 'active' ? (
            <button
              type="button"
              onClick={() => onSoftDelete?.(student)}
              className="p-2 text-on-surface-variant hover:bg-red-50 hover:text-error rounded-lg transition-all"
              title="Xoá mềm"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  )
}
