import SortableTh from '../../components/SortableTh.jsx'
import ClassTableRow from './ClassTableRow.jsx'

export const CLASS_TABLE_COLUMNS = [
  { key: 'code', label: 'Mã lớp' },
  { key: 'grade', label: 'Khối', numeric: true },
  { key: 'gvcn', label: 'Giáo viên CN' },
  { key: 'room', label: 'Phòng' },
  { key: 'count', label: 'Sĩ số', numeric: true },
  { key: 'year', label: 'Năm học' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function classSortValue(row, key) {
  switch (key) {
    case 'code':
      return row.code ?? ''
    case 'grade':
      return Number(row.grade) || 0
    case 'gvcn':
      return row.homeroomTeacher ?? ''
    case 'room':
      return row.room ?? ''
    case 'count':
      return Number(row.studentCount) || 0
    case 'year':
      return row.schoolYear ?? ''
    case 'status':
      return row.status ?? ''
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã map (trước khi phân trang). */
export function sortClassRowList(list, sortKey, sortDir) {
  const numericKeys = new Set(CLASS_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = classSortValue(a, sortKey)
    const kb = classSortValue(b, sortKey)
    let cmp = 0
    if (numericKeys.has(sortKey)) {
      cmp = Number(ka) - Number(kb)
    } else {
      cmp = String(ka).localeCompare(String(kb), 'vi')
    }
    if (cmp === 0) {
      cmp = String(a.code ?? '').localeCompare(String(b.code ?? ''), 'vi')
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
  return arr
}

export default function ClassTable({ rows, sortKey, sortDir, onSort, onEdit, onToggleActive }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">class</span>
        <p className="font-medium text-on-surface">Không có lớp phù hợp</p>
        <p className="text-sm mt-1">Thử đổi năm học, khối hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-surface-container-low/50">
            {CLASS_TABLE_COLUMNS.map((col) => (
              <SortableTh
                key={col.key}
                sortKey={col.key}
                activeKey={sortKey}
                dir={sortDir}
                onSort={onSort}
                align={col.align === 'right' ? 'right' : 'left'}
                disabled={col.sortable === false}
                className={`px-6 py-5 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-[0.1em] ${
                  col.align === 'right' ? 'text-right' : ''
                }`}
              >
                {col.label}
              </SortableTh>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {rows.map((row) => (
            <ClassTableRow key={row.id} row={row} onEdit={onEdit} onToggleActive={onToggleActive} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
