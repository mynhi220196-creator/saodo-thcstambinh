import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { subscribeClasses } from '../../lib/organizationFirestore.js'
import {
  buildTeacherDisplayRows,
  countTeachersCreatedThisMonth,
  subscribeProfiles,
} from '../../lib/userProfilesFirestore.js'
import TeacherFabActions from './TeacherFabActions.jsx'
import TeacherFilterBar from './TeacherFilterBar.jsx'
import TeacherHelpFooter from './TeacherHelpFooter.jsx'
import TeacherPageHeader from './TeacherPageHeader.jsx'
import TeacherStatsCards from './TeacherStatsCards.jsx'
import TeacherTable, { TEACHER_TABLE_COLUMNS, sortTeacherRowList } from './TeacherTable.jsx'
import TeacherTablePagination from './TeacherTablePagination.jsx'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'

function filterTeacherRows(rows, department, statusFilter, query) {
  const q = query.trim().toLowerCase()
  return rows.filter((t) => {
    if (department !== 'all' && t.department !== department) return false
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (!q) return true
    const blob = [t.id, t.codeShort, t.name, t.email, t.department, t.homeroomClass, t.phone]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return blob.includes(q)
  })
}

function downloadTeacherCsv(rows) {
  const headers = ['uid', 'full_name', 'email', 'unit', 'phone', 'homeroom_classes', 'status']
  const lines = [headers.join(',')]
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  for (const t of rows) {
    lines.push(
      [
        esc(t.id),
        esc(t.name),
        esc(t.email),
        esc(t.department),
        esc(t.phone),
        esc(t.homeroomClass ?? ''),
        esc(t.status),
      ].join(','),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-teachers-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function TeacherManagementPage() {
  const [profilesRaw, setProfilesRaw] = useState([])
  const [classesRaw, setClassesRaw] = useState([])
  const [loadError, setLoadError] = useState('')

  const [department, setDepartment] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)
  const [tableSortKey, setTableSortKey] = useState('name')
  const [tableSortDir, setTableSortDir] = useState('asc')

  useEffect(() => {
    const u1 = subscribeProfiles(
      (list) => {
        setLoadError('')
        setProfilesRaw(list)
      },
      (e) => setLoadError(e?.message ?? ''),
    )
    const u2 = subscribeClasses(setClassesRaw, () => {})
    return () => {
      u1()
      u2()
    }
  }, [])

  const teacherRows = useMemo(
    () => buildTeacherDisplayRows(profilesRaw, classesRaw),
    [profilesRaw, classesRaw],
  )

  const departmentOptions = useMemo(() => {
    const units = new Set()
    for (const t of teacherRows) {
      if (t.department && t.department !== '—') units.add(t.department)
    }
    const sorted = [...units].sort((a, b) => a.localeCompare(b, 'vi'))
    return [{ value: 'all', label: 'Tất cả tổ / đơn vị' }, ...sorted.map((u) => ({ value: u, label: u }))]
  }, [teacherRows])

  const filtered = useMemo(
    () => filterTeacherRows(teacherRows, department, statusFilter, query),
    [teacherRows, department, statusFilter, query],
  )

  useEffect(() => {
    setPage(1)
  }, [department, statusFilter, query, pageSize, tableSortKey, tableSortDir])

  const homeroomCount = useMemo(
    () => filtered.filter((t) => t.homeroomClass != null).length,
    [filtered],
  )

  const newThisMonth = useMemo(() => countTeachersCreatedThisMonth(profilesRaw), [profilesRaw])

  const sortedFiltered = useMemo(
    () => sortTeacherRowList(filtered, tableSortKey, tableSortDir),
    [filtered, tableSortKey, tableSortDir],
  )

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
      const col = TEACHER_TABLE_COLUMNS.find((c) => c.key === key)
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
    downloadTeacherCsv(sortedFiltered)
  }, [sortedFiltered])

  return (
    <AdminShell
      activeKey="giao-vien"
      headerTitle="Tổ chức · Giáo viên"
      searchPlaceholder="Tìm theo tên, email, tổ CM…"
    >
      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
          {loadError}
        </div>
      ) : null}

      <TeacherPageHeader />
      <TeacherStatsCards
        totalFiltered={filtered.length}
        totalSystem={teacherRows.length}
        homeroomCount={homeroomCount}
        newThisMonth={newThisMonth}
      />
      <TeacherFilterBar
        department={department}
        onDepartmentChange={setDepartment}
        departmentOptions={departmentOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        query={query}
        onQueryChange={setQuery}
        onExport={handleExport}
      />
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <TeacherTable
          rows={pageRows}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
        />
        <TeacherTablePagination
          from={from}
          to={to}
          filteredTotal={sortedFiltered.length}
          totalSystem={teacherRows.length}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <TeacherHelpFooter />
      <TeacherFabActions />
    </AdminShell>
  )
}
