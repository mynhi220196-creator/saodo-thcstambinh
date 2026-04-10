import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { buildSaoDoMemberRows, subscribeProfiles } from '../../lib/userProfilesFirestore.js'
import SaoDoMemberFabActions from './SaoDoMemberFabActions.jsx'
import SaoDoMemberFilterBar from './SaoDoMemberFilterBar.jsx'
import SaoDoMemberHelpFooter from './SaoDoMemberHelpFooter.jsx'
import SaoDoMemberPageHeader from './SaoDoMemberPageHeader.jsx'
import SaoDoMemberStatsCards from './SaoDoMemberStatsCards.jsx'
import SaoDoMemberTable, { SAO_DO_MEMBER_TABLE_COLUMNS, sortSaoDoMemberRowList } from './SaoDoMemberTable.jsx'
import SaoDoMemberTablePagination from './SaoDoMemberTablePagination.jsx'
import { filterSaoDoMembers } from './saoDoMemberMockData.js'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'

function downloadSaoDoCsv(rows) {
  const headers = ['uid', 'display_code', 'full_name', 'email', 'class', 'grade', 'role', 'shift', 'joined', 'phone', 'status']
  const lines = [headers.join(',')]
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  for (const m of rows) {
    lines.push(
      [
        esc(m.id),
        esc(m.code),
        esc(m.name),
        esc(m.email),
        esc(m.className),
        esc(m.grade ?? ''),
        esc(m.role),
        esc(m.shiftPref),
        esc(m.joinedAt),
        esc(m.phone),
        esc(m.status),
      ].join(','),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-red-star-members-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function SaoDoMemberManagementPage() {
  const [profilesRaw, setProfilesRaw] = useState([])
  const [loadError, setLoadError] = useState('')

  const [gradeFilter, setGradeFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)
  const [tableSortKey, setTableSortKey] = useState('name')
  const [tableSortDir, setTableSortDir] = useState('asc')

  useEffect(() => {
    const unsub = subscribeProfiles(
      (list) => {
        setLoadError('')
        setProfilesRaw(list)
      },
      (e) => setLoadError(e?.message ?? 'Không tải được danh sách.'),
    )
    return () => unsub()
  }, [])

  const memberRows = useMemo(() => buildSaoDoMemberRows(profilesRaw), [profilesRaw])

  const filtered = useMemo(
    () => filterSaoDoMembers(memberRows, gradeFilter, roleFilter, statusFilter, query),
    [memberRows, gradeFilter, roleFilter, statusFilter, query],
  )

  useEffect(() => {
    setPage(1)
  }, [gradeFilter, roleFilter, statusFilter, query, pageSize, tableSortKey, tableSortDir])

  const sortedFiltered = useMemo(
    () => sortSaoDoMemberRowList(filtered, tableSortKey, tableSortDir),
    [filtered, tableSortKey, tableSortDir],
  )

  const activeCount = useMemo(() => filtered.filter((m) => m.status === 'active').length, [filtered])
  const pendingCount = useMemo(() => filtered.filter((m) => m.status === 'pending').length, [filtered])

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => sortedFiltered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedFiltered, safePage, pageSize],
  )

  const from = sortedFiltered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, sortedFiltered.length)

  const onTableSort = useCallback(
    (key) => {
      const col = SAO_DO_MEMBER_TABLE_COLUMNS.find((c) => c.key === key)
      if (!col || col.sortable === false) return
      if (tableSortKey === key) {
        setTableSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
        return
      }
      setTableSortKey(key)
      setTableSortDir(col.numeric ? 'desc' : 'asc')
    },
    [tableSortKey],
  )

  const handleExport = useCallback(() => {
    downloadSaoDoCsv(sortedFiltered)
  }, [sortedFiltered])

  return (
    <AdminShell
      activeKey="thanh-vien"
      headerTitle="Sao Đỏ · Thành viên"
      searchPlaceholder="Tìm theo tên, email, UID, lớp…"
    >
      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
          {loadError}
        </div>
      ) : null}

      <SaoDoMemberPageHeader />
      <SaoDoMemberStatsCards
        totalFiltered={filtered.length}
        totalSystem={memberRows.length}
        activeCount={activeCount}
        pendingCount={pendingCount}
      />
      <SaoDoMemberFilterBar
        gradeFilter={gradeFilter}
        onGradeFilterChange={setGradeFilter}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        query={query}
        onQueryChange={setQuery}
        onExport={handleExport}
      />
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <SaoDoMemberTable
          rows={pageRows}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
        />
        <SaoDoMemberTablePagination
          from={from}
          to={to}
          filteredTotal={sortedFiltered.length}
          totalSystem={memberRows.length}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <SaoDoMemberHelpFooter />
      <SaoDoMemberFabActions />
    </AdminShell>
  )
}
