import SortableTh from '../../components/SortableTh.jsx'
import DepartmentTableRow from './DepartmentTableRow.jsx'

export const DEPARTMENT_TABLE_COLUMNS = [
  { key: 'code', label: 'Mã tổ' },
  { key: 'name', label: 'Tên tổ' },
  { key: 'head', label: 'Trưởng tổ' },
  { key: 'members', label: 'Số GV', numeric: true },
  { key: 'year', label: 'Năm học' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function deptSortValue(row, key) {
  switch (key) {
    case 'code':
      return row.code ?? ''
    case 'name':
      return row.name ?? ''
    case 'head':
      return row.headName ?? ''
    case 'members':
      return Number(row.memberCount) || 0
    case 'year':
      return row.schoolYear ?? ''
    case 'status':
      return row.status ?? ''
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã lọc (trước khi phân trang). */
export function sortDepartmentRowList(list, sortKey, sortDir) {
  const numericKeys = new Set(DEPARTMENT_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = deptSortValue(a, sortKey)
    const kb = deptSortValue(b, sortKey)
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

export default function DepartmentTable({ rows, sortKey, sortDir, onSort }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">domain</span>
        <p className="font-medium text-on-surface">Không có tổ phù hợp</p>
        <p className="text-sm mt-1">Thử đổi năm học hoặc trạng thái tổ.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[880px]">
        <thead>
          <tr className="bg-surface-container-low/50">
            {DEPARTMENT_TABLE_COLUMNS.map((col) => (
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
            <DepartmentTableRow key={`${row.code}-${row.schoolYear}`} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
