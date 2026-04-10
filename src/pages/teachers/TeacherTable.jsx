import SortableTh from '../../components/SortableTh.jsx'
import TeacherTableRow from './TeacherTableRow.jsx'

export const TEACHER_TABLE_COLUMNS = [
  { key: 'code', label: 'UID (rút gọn)' },
  { key: 'name', label: 'Họ và tên' },
  { key: 'dept', label: 'Tổ / đơn vị' },
  { key: 'cn', label: 'Chủ nhiệm' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function teacherSortValue(t, key) {
  switch (key) {
    case 'code':
      return t.codeShort ?? ''
    case 'name':
      return t.name ?? ''
    case 'dept':
      return t.department ?? ''
    case 'cn':
      return t.homeroomClass ?? ''
    case 'phone':
      return t.phone ?? ''
    case 'status':
      return t.status ?? ''
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã lọc (trước khi phân trang). */
export function sortTeacherRowList(list, sortKey, sortDir) {
  const numericKeys = new Set(TEACHER_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = teacherSortValue(a, sortKey)
    const kb = teacherSortValue(b, sortKey)
    let cmp = 0
    if (numericKeys.has(sortKey)) {
      cmp = Number(ka) - Number(kb)
    } else {
      cmp = String(ka).localeCompare(String(kb), 'vi')
    }
    if (cmp === 0) {
      cmp = String(a.name ?? '').localeCompare(String(b.name ?? ''), 'vi')
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
  return arr
}

export default function TeacherTable({ rows, sortKey, sortDir, onSort }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">person_search</span>
        <p className="font-medium text-on-surface">Không có giáo viên phù hợp</p>
        <p className="text-sm mt-1">Thử đổi tổ / đơn vị, trạng thái hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[920px]">
        <thead>
          <tr className="bg-surface-container-low/50">
            {TEACHER_TABLE_COLUMNS.map((col) => (
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
          {rows.map((t) => (
            <TeacherTableRow key={t.id} teacher={t} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
