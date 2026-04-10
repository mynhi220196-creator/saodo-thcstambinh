import SortableTh from '../../components/SortableTh.jsx'
import UserTableRow from './UserTableRow.jsx'

export const USER_TABLE_COLUMNS = [
  { key: 'uid', label: 'UID' },
  { key: 'name', label: 'Họ tên' },
  { key: 'role', label: 'Vai trò' },
  { key: 'unit', label: 'Đơn vị / Nhóm' },
  { key: 'last', label: 'Đăng nhập cuối', numeric: true },
  { key: 'created', label: 'Ngày tạo', numeric: true },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function createdAtMillis(u) {
  const raw = u._raw
  const v = raw?.created_at
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

function userSortValue(u, key) {
  switch (key) {
    case 'uid':
      return u.id ?? ''
    case 'name':
      return u.fullName ?? ''
    case 'role':
      return u.role ?? ''
    case 'unit':
      return u.unit ?? ''
    case 'last': {
      const t = Date.parse(u.lastLoginAt || '')
      return Number.isNaN(t) ? 0 : t
    }
    case 'created':
      return createdAtMillis(u)
    case 'status':
      return u.status ?? ''
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã lọc (trước khi phân trang). */
export function sortUserRowList(list, sortKey, sortDir) {
  const numericKeys = new Set(USER_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = userSortValue(a, sortKey)
    const kb = userSortValue(b, sortKey)
    let cmp = 0
    if (numericKeys.has(sortKey)) {
      cmp = Number(ka) - Number(kb)
    } else {
      cmp = String(ka).localeCompare(String(kb), 'vi')
    }
    if (cmp === 0) {
      cmp = String(a.fullName ?? '').localeCompare(String(b.fullName ?? ''), 'vi')
    }
    return sortDir === 'asc' ? cmp : -cmp
  })
  return arr
}

export default function UserTable({ rows, sortKey, sortDir, onSort, currentUserId, onDetail, onEdit, onToggleLock }) {
  if (rows.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">person_off</span>
        <p className="font-medium text-on-surface">Không có người dùng phù hợp</p>
        <p className="text-sm mt-1">Thử đổi vai trò, trạng thái hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1024px]">
        <thead>
          <tr className="bg-surface-container-low/50">
            {USER_TABLE_COLUMNS.map((col) => (
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
          {rows.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              currentUserId={currentUserId}
              onDetail={onDetail}
              onEdit={onEdit}
              onToggleLock={onToggleLock}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
