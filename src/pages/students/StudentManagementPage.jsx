import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { formatDateVN } from '../../lib/dateFormat.js'
import {
  buildEnrollmentKeySet,
  createStudent,
  importStudentsForClass,
  softDeleteStudent,
  subscribeClasses,
  subscribeStudents,
  updateStudent,
} from '../../lib/organizationFirestore.js'
import StudentCreateModal from './StudentCreateModal.jsx'
import StudentEditModal from './StudentEditModal.jsx'
import StudentFabActions from './StudentFabActions.jsx'
import StudentFilterBar from './StudentFilterBar.jsx'
import StudentHelpFooter from './StudentHelpFooter.jsx'
import StudentImportModal from './StudentImportModal.jsx'
import StudentPageHeader from './StudentPageHeader.jsx'
import StudentStatsCards from './StudentStatsCards.jsx'
import StudentTable, { STUDENT_TABLE_COLUMNS, sortStudentRowList } from './StudentTable.jsx'
import StudentTablePagination from './StudentTablePagination.jsx'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'

function formatDob(s) {
  return formatDateVN(s)
}

function mapStudentRow(s, classById) {
  const c = s.class_id ? classById[s.class_id] : null
  return {
    id: s.id,
    code: s.student_code,
    name: s.full_name,
    subtitle: `Sinh: ${formatDob(s.date_of_birth)}`,
    avatar: '',
    className: c?.code ?? '—',
    saoDo: false,
    parentPhone: s.guardian_phone || '—',
    status: s.is_deleted ? 'inactive' : 'active',
    _raw: s,
  }
}

function downloadStudentCsv(rows) {
  const headers = ['student_code', 'full_name', 'gender', 'date_of_birth', 'class_code', 'guardian_phone', 'status']
  const lines = [headers.join(',')]
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  for (const r of rows) {
    lines.push(
      [
        esc(r.code),
        esc(r.name),
        esc(r._raw?.gender),
        esc(r._raw?.date_of_birth ? r._raw.date_of_birth.split('-').reverse().join('/') : ''),
        esc(r.className),
        esc(r.parentPhone),
        esc(r.status),
      ].join(','),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-students-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function StudentManagementPage() {
  const [studentsRaw, setStudentsRaw] = useState([])
  const [classesRaw, setClassesRaw] = useState([])
  const [loadError, setLoadError] = useState('')

  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('active')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)
  const [tableSortKey, setTableSortKey] = useState('code')
  const [tableSortDir, setTableSortDir] = useState('asc')

  const [createOpen, setCreateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  useEffect(() => {
    const u1 = subscribeStudents(
      (list) => {
        setLoadError('')
        setStudentsRaw(list)
      },
      (e) => setLoadError(e?.message ?? ''),
    )
    const u2 = subscribeClasses(setClassesRaw, () => {})
    return () => {
      u1()
      u2()
    }
  }, [])

  const classById = useMemo(() => {
    const m = {}
    for (const c of classesRaw) m[c.id] = c
    return m
  }, [classesRaw])

  const classOptions = useMemo(
    () =>
      classesRaw
        .filter((c) => c.is_active !== false)
        .sort((a, b) => (a.school_year + a.code).localeCompare(b.school_year + b.code))
        .map((c) => ({
          id: c.id,
          label: `${c.code} · ${c.school_year}`,
        })),
    [classesRaw],
  )

  const classFilterOptions = useMemo(
    () => [{ id: 'all', label: 'Tất cả lớp' }, ...classOptions],
    [classOptions],
  )

  const existingEnrollmentKeys = useMemo(() => buildEnrollmentKeySet(studentsRaw), [studentsRaw])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return studentsRaw.filter((s) => {
      if (classFilter !== 'all' && s.class_id !== classFilter) return false
      if (statusFilter === 'active' && s.is_deleted) return false
      if (statusFilter === 'archived' && !s.is_deleted) return false
      if (!q) return true
      const c = s.class_id ? classById[s.class_id] : null
      const blob = [s.student_code, s.full_name, c?.code].filter(Boolean).join(' ').toLowerCase()
      return blob.includes(q)
    })
  }, [studentsRaw, classFilter, statusFilter, query, classById])

  useEffect(() => {
    setPage(1)
  }, [classFilter, statusFilter, query, pageSize, tableSortKey, tableSortDir])

  const mappedFiltered = useMemo(
    () => filtered.map((s) => mapStudentRow(s, classById)),
    [filtered, classById],
  )

  const sortedMapped = useMemo(
    () => sortStudentRowList(mappedFiltered, tableSortKey, tableSortDir),
    [mappedFiltered, tableSortKey, tableSortDir],
  )

  const totalPages = Math.max(1, Math.ceil(sortedMapped.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => sortedMapped.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedMapped, safePage, pageSize],
  )

  const onTableSort = useCallback(
    (key) => {
      const col = STUDENT_TABLE_COLUMNS.find((c) => c.key === key)
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

  const stats = useMemo(() => {
    const active = studentsRaw.filter((s) => !s.is_deleted).length
    const archived = studentsRaw.filter((s) => s.is_deleted).length
    return { total: studentsRaw.length, active, archived }
  }, [studentsRaw])

  const handleCreate = useCallback(
    async (payload) => {
      await createStudent(payload, existingEnrollmentKeys)
    },
    [existingEnrollmentKeys],
  )

  const handleUpdate = useCallback(
    async (id, payload) => {
      const current = studentsRaw.find((s) => s.id === id)
      if (!current) throw new Error('Không tìm thấy bản ghi.')
      const nextClassId = payload.class_id !== undefined ? payload.class_id : current.class_id
      if (nextClassId !== current.class_id) {
        const code = current.student_code
        const clash = studentsRaw.some(
          (s) =>
            s.id !== id &&
            !s.is_deleted &&
            s.student_code === code &&
            s.class_id === nextClassId,
        )
        if (clash) {
          throw new Error(
            'Trong lớp đích đã có bản ghi cùng mã học sinh. Không đổi lớp được; hãy thêm bản ghi mới (Thêm học sinh) hoặc xử lý bản trùng.',
          )
        }
      }
      await updateStudent(id, payload)
    },
    [studentsRaw],
  )

  const handleSoftDelete = useCallback(
    async (row) => {
      if (!window.confirm(`Ẩn học sinh ${row.name} (${row.code}) khỏi danh sách?`)) return
      try {
        await softDeleteStudent(row.id)
      } catch (e) {
        window.alert(e?.message ?? 'Lỗi.')
      }
    },
    [],
  )

  const handleImport = useCallback(
    async (classId, rows) => {
      const keys = new Set(existingEnrollmentKeys)
      return importStudentsForClass(classId, rows, keys)
    },
    [existingEnrollmentKeys],
  )

  const from = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filtered.length)

  return (
    <AdminShell
      activeKey="hoc-sinh"
      headerTitle="Tổ chức · Học sinh"
      searchPlaceholder="Tìm theo tên, mã HS hoặc lớp..."
    >
      <StudentCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        classOptions={classOptions}
      />
      <StudentImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        classOptions={classOptions}
      />
      <StudentEditModal
        open={!!editingStudent}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onSubmit={handleUpdate}
        classOptions={classOptions}
      />

      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
          {loadError}
        </div>
      ) : null}

      <StudentPageHeader onAdd={() => setCreateOpen(true)} onImport={() => setImportOpen(true)} />
      <StudentStatsCards total={stats.total} active={stats.active} archived={stats.archived} filteredCount={filtered.length} />
      <StudentFilterBar
        classFilter={classFilter}
        onClassFilterChange={setClassFilter}
        classOptions={classFilterOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        query={query}
        onQueryChange={setQuery}
        onExport={() => downloadStudentCsv(sortedMapped)}
      />
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <StudentTable
          rows={pageRows}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
          onEdit={(r) => setEditingStudent(r._raw)}
          onSoftDelete={handleSoftDelete}
        />
        <StudentTablePagination
          from={from}
          to={to}
          total={sortedMapped.length}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <StudentHelpFooter />
      <StudentFabActions onAdd={() => setCreateOpen(true)} onImport={() => setImportOpen(true)} />
    </AdminShell>
  )
}
