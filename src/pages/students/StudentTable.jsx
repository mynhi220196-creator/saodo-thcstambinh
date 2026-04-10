import SortableTh from '../../components/SortableTh.jsx'
import StudentTableRow from './StudentTableRow.jsx'

export const STUDENT_TABLE_COLUMNS = [
  { key: 'code', label: 'Mã HS' },
  { key: 'name', label: 'Họ và tên' },
  { key: 'class', label: 'Lớp' },
  { key: 'saodo', label: 'Sao Đỏ', numeric: true },
  { key: 'phone', label: 'Liên hệ PH' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function studentSortValue(s, key) {
  switch (key) {
    case 'code':
      return s.code ?? ''
    case 'name':
      return s.name ?? ''
    case 'class':
      return s.className ?? ''
    case 'saodo':
      return s.saoDo ? 1 : 0
    case 'phone':
      return s.parentPhone ?? ''
    case 'status':
      return s.status ?? ''
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã map (trước khi phân trang). */
export function sortStudentRowList(list, sortKey, sortDir) {
  const numericKeys = new Set(STUDENT_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = studentSortValue(a, sortKey)
    const kb = studentSortValue(b, sortKey)
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

export default function StudentTable({ rows, sortKey, sortDir, onSort, onEdit, onSoftDelete }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">person_off</span>
        <p className="font-medium text-on-surface">Không có học sinh phù hợp</p>
        <p className="text-sm mt-1">Thử đổi lớp, trạng thái hoặc từ khoá.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[860px]">
        <thead>
          <tr className="bg-surface-container-low/50">
            {STUDENT_TABLE_COLUMNS.map((col) => (
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
          {rows.map((s) => (
            <StudentTableRow key={s.id} student={s} onEdit={onEdit} onSoftDelete={onSoftDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
