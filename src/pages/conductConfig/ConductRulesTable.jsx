import SortableTh from '../../components/SortableTh.jsx'
import ConductRuleTableRow from './ConductRuleTableRow.jsx'

export const CONDUCT_TABLE_COLUMNS = [
  { key: 'code', label: 'ID/Mã' },
  { key: 'name', label: 'Tên hành vi/Nội quy' },
  { key: 'group', label: 'Nhóm danh mục' },
  { key: 'type', label: 'Loại', align: 'center' },
  { key: 'points', label: 'Điểm', align: 'center', numeric: true },
  { key: 'desc', label: 'Mô tả' },
  { key: 'status', label: 'Trạng thái', align: 'center', numeric: true },
  { key: 'actions', label: 'Thao tác', align: 'right', sortable: false },
]

function conductSortValue(rule, key) {
  switch (key) {
    case 'code':
      return rule.code ?? ''
    case 'name':
      return rule.name ?? ''
    case 'group':
      return rule.category ?? ''
    case 'type':
      return rule.type ?? ''
    case 'points':
      return Number(rule.points) || 0
    case 'desc':
      return rule.description ?? ''
    case 'status':
      return rule.enabled ? 1 : 0
    default:
      return ''
  }
}

/** Sắp xếp toàn bộ danh sách đã lọc (dùng trước khi phân trang). */
export function sortConductRuleList(list, sortKey, sortDir) {
  const numericKeys = new Set(CONDUCT_TABLE_COLUMNS.filter((c) => c.numeric).map((c) => c.key))
  const arr = [...list]
  arr.sort((a, b) => {
    const ka = conductSortValue(a, sortKey)
    const kb = conductSortValue(b, sortKey)
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

export default function ConductRulesTable({
  rules,
  filteredTotal,
  sortKey,
  sortDir,
  onSort,
  onToggleEnabled,
  onEdit,
  onDelete,
}) {
  if (filteredTotal === 0) {
    return (
      <div className="px-6 py-14 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">gavel</span>
        <p className="font-medium text-on-surface">Không có quy định phù hợp bộ lọc</p>
        <p className="text-sm mt-1">Thử đổi tab nhóm, loại hoặc từ khóa — hoặc thêm hạng mục mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-surface-container-low/30">
            {CONDUCT_TABLE_COLUMNS.map((col) => (
              <SortableTh
                key={col.key}
                sortKey={col.key}
                activeKey={sortKey}
                dir={sortDir}
                onSort={onSort}
                align={col.align === 'right' ? 'right' : 'left'}
                disabled={col.sortable === false}
                className={`px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.05em] ${
                  col.align === 'center' ? 'text-center' : ''
                } ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.label}
              </SortableTh>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {rules.map((rule) => (
            <ConductRuleTableRow
              key={rule.id}
              rule={rule}
              onToggleEnabled={onToggleEnabled}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
