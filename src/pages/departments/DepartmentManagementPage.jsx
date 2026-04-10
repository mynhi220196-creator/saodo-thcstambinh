import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'
import { CURRENT_SCHOOL_YEAR, DEPARTMENTS, filterDepartments } from './departmentMockData.js'
import DepartmentCreateModal from './DepartmentCreateModal.jsx'
import DepartmentFabActions from './DepartmentFabActions.jsx'
import DepartmentFilterBar from './DepartmentFilterBar.jsx'
import DepartmentHelpFooter from './DepartmentHelpFooter.jsx'
import DepartmentPageHeader from './DepartmentPageHeader.jsx'
import DepartmentStatsCards from './DepartmentStatsCards.jsx'
import DepartmentTable from './DepartmentTable.jsx'
import DepartmentTablePagination from './DepartmentTablePagination.jsx'

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState(() => DEPARTMENTS.map((d) => ({ ...d })))
  const [schoolYear, setSchoolYear] = useState(CURRENT_SCHOOL_YEAR)
  const [statusFilter, setStatusFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)
  const [tableSortKey, setTableSortKey] = useState('code')
  const [tableSortDir, setTableSortDir] = useState('asc')

  const filtered = useMemo(
    () => filterDepartments(departments, schoolYear, statusFilter),
    [departments, schoolYear, statusFilter],
  )

  useEffect(() => {
    setPage(1)
  }, [schoolYear, statusFilter, pageSize, tableSortKey, tableSortDir])

  const sortedFiltered = useMemo(
    () => sortDepartmentRowList(filtered, tableSortKey, tableSortDir),
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
      const col = DEPARTMENT_TABLE_COLUMNS.find((c) => c.key === key)
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

  const totalMembers = useMemo(
    () => filtered.reduce((acc, d) => acc + d.memberCount, 0),
    [filtered],
  )

  const activeTeams = useMemo(
    () => filtered.filter((d) => d.status === 'active').length,
    [filtered],
  )

  function handleCreateDepartment(payload) {
    setDepartments((prev) => [
      ...prev,
      {
        code: payload.code,
        name: payload.name,
        headName: payload.headName || '—',
        memberCount: 0,
        schoolYear: payload.schoolYear,
        focus: payload.focus || '—',
        status: payload.status,
      },
    ])
    setCreateOpen(false)
  }

  return (
    <AdminShell
      activeKey="to-chuyen-mon"
      headerTitle="Tổ chức · Tổ CM"
      searchPlaceholder="Tìm theo mã tổ, tên tổ hoặc trưởng tổ..."
    >
      <DepartmentCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateDepartment}
        defaultSchoolYear={schoolYear}
      />
      <DepartmentPageHeader onAddTeam={() => setCreateOpen(true)} />
      <DepartmentStatsCards
        totalTeams={filtered.length}
        totalMembers={totalMembers}
        activeTeams={activeTeams}
      />
      <DepartmentFilterBar
        schoolYear={schoolYear}
        onSchoolYearChange={setSchoolYear}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm">
        <DepartmentTable
          rows={pageRows}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
        />
        <DepartmentTablePagination
          from={from}
          to={to}
          filteredTotal={sortedFiltered.length}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <DepartmentHelpFooter />
      <DepartmentFabActions onAddTeam={() => setCreateOpen(true)} />
    </AdminShell>
  )
}
