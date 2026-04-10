import SortableTh from '../../components/SortableTh.jsx'
import SaoDoMemberTableRow from './SaoDoMemberTableRow.jsx'

export const SAO_DO_MEMBER_TABLE_COLUMNS = [
  { key: 'code', label: 'UID (rút gọn)' },
  { key: 'name', label: 'Họ và tên' },
  { key: 'class', label: 'Lớp' },
  { key: 'role', label: 'Vai trò' },
  { key: 'shift', label: 'Ca ưu tiên' },
  { key: 'joined', label: 'Tham gia' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function memberSortValue(m, key) {
  switch (key) {
    case 'code':
      return m.code ?? ''
    case 'name':
      return m.name ?? ''
    case 'class': {
      const cn = m.className ?? ''
      const g = m.grade != null ? ` ${m.grade}` : ''
      return `${cn}${g}`
    }
    case 'role':
      return m.role ?? ''
    case 'shift':
      return m.shiftPref ?? ''
    case 'joined':
      return m.joinedAt ?? ''
    case 'status':
      return m.status ?? ''
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã lọc (trước khi phân trang). */
export function sortSaoDoMemberRowList(list, sortKey, sortDir) {
  const numericKeys = new Set(SAO_DO_MEMBER_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = memberSortValue(a, sortKey)
    const kb = memberSortValue(b, sortKey)
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

export default function SaoDoMemberTable({ rows, sortKey, sortDir, onSort }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-red-200 dark:text-red-900 mb-2 block">flag</span>
        <p className="font-medium text-on-surface">Không có đội viên phù hợp</p>
        <p className="text-sm mt-1">Điều chỉnh bộ lọc hoặc thêm người dùng vai trò Sao Đỏ trong Quản lý người dùng.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[960px]">
        <thead>
          <tr className="bg-gradient-to-r from-red-50/80 to-surface-container-low/80 dark:from-red-950/20 dark:to-slate-800/50">
            {SAO_DO_MEMBER_TABLE_COLUMNS.map((col) => (
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
          {rows.map((m) => (
            <SaoDoMemberTableRow key={m.id} member={m} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
