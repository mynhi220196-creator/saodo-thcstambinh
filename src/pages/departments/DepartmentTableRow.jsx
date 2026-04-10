const STATUS_STYLES = {
  active: {
    dot: 'bg-green-500',
    label: 'Đang hoạt động',
    labelClass: 'text-green-700',
  },
  transition: {
    dot: 'bg-amber-500',
    label: 'Điều chỉnh / Sáp nhập',
    labelClass: 'text-amber-800',
  },
  inactive: {
    dot: 'bg-slate-400',
    label: 'Ngừng hoạt động',
    labelClass: 'text-slate-600',
  },
}

export default function DepartmentTableRow({ row }) {
  const st = STATUS_STYLES[row.status] ?? STATUS_STYLES.active

  return (
    <tr className="group hover:bg-surface-container-low/30 transition-colors">
      <td className="px-6 py-4 font-mono text-sm text-primary font-bold whitespace-nowrap">{row.code}</td>
      <td className="px-6 py-4 min-w-[200px]">
        <p className="font-bold text-on-surface">{row.name}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{row.focus}</p>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-medium text-on-surface">{row.headName}</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-on-surface tabular-nums">{row.memberCount}</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
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
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary rounded-lg transition-all"
            title="Xem chi tiết"
          >
            <span className="material-symbols-outlined text-xl">visibility</span>
          </button>
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-blue-50 hover:text-primary rounded-lg transition-all"
            title="Chỉnh sửa"
          >
            <span className="material-symbols-outlined text-xl">edit</span>
          </button>
          <button
            type="button"
            className="p-2 text-on-surface-variant hover:bg-red-50 hover:text-error rounded-lg transition-all"
            title="Xóa"
          >
            <span className="material-symbols-outlined text-xl">delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
