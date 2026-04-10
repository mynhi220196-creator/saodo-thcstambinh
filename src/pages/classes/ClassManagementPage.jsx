import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import {
  createClass,
  isTeacherRole,
  setClassActive,
  subscribeClasses,
  subscribeStudents,
  updateClass,
} from '../../lib/organizationFirestore.js'
import { subscribeProfiles } from '../../lib/userProfilesFirestore.js'
import ClassCreateModal from './ClassCreateModal.jsx'
import ClassFabActions from './ClassFabActions.jsx'
import ClassFilterBar from './ClassFilterBar.jsx'
import ClassHelpFooter from './ClassHelpFooter.jsx'
import ClassPageHeader from './ClassPageHeader.jsx'
import ClassStatsCards from './ClassStatsCards.jsx'
import ClassTable, { CLASS_TABLE_COLUMNS, sortClassRowList } from './ClassTable.jsx'
import ClassTablePagination from './ClassTablePagination.jsx'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'
import { CURRENT_SCHOOL_YEAR, SCHOOL_YEAR_OPTIONS } from './classMockData.js'

function mapClassRow(c, profileById, studentCountByClass) {
  const tid = c.homeroom_teacher_id
  const p = tid ? profileById[tid] : null
  return {
    id: c.id,
    code: c.code,
    grade: c.grade,
    schoolYear: c.school_year,
    homeroomTeacher: p?.full_name ?? '—',
    email: p?.email ?? '—',
    room: c.room || '—',
    studentCount: studentCountByClass[c.id] ?? 0,
    status: c.is_active === false ? 'archived' : 'active',
    _raw: c,
  }
}

function downloadClassCsv(rows) {
  const headers = ['code', 'grade', 'school_year', 'homeroom_teacher', 'email', 'room', 'student_count', 'status']
  const lines = [headers.join(',')]
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`
  for (const r of rows) {
    lines.push(
      [esc(r.code), esc(r.grade), esc(r.schoolYear), esc(r.homeroomTeacher), esc(r.email), esc(r.room), esc(r.studentCount), esc(r.status)].join(
        ',',
      ),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-classes-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function ClassManagementPage() {
  const [classesRaw, setClassesRaw] = useState([])
  const [studentsRaw, setStudentsRaw] = useState([])
  const [profilesRaw, setProfilesRaw] = useState([])
  const [loadError, setLoadError] = useState('')

  const [schoolYear, setSchoolYear] = useState(CURRENT_SCHOOL_YEAR)
  const [gradeFilter, setGradeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)
  const [tableSortKey, setTableSortKey] = useState('code')
  const [tableSortDir, setTableSortDir] = useState('asc')

  const [createOpen, setCreateOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  useEffect(() => {
    const e1 = subscribeClasses(setClassesRaw, (err) => setLoadError(err?.message ?? ''))
    const e2 = subscribeStudents(setStudentsRaw, () => {})
    const e3 = subscribeProfiles(setProfilesRaw, () => {})
    return () => {
      e1()
      e2()
      e3()
    }
  }, [])

  const profileById = useMemo(() => {
    const m = {}
    for (const p of profilesRaw) {
      m[p.id] = p
    }
    return m
  }, [profilesRaw])

  const teachers = useMemo(
    () =>
      profilesRaw
        .filter((p) => isTeacherRole(p.role) && p.is_deleted !== true && p.is_active !== false)
        .map((p) => ({
          id: p.id,
          full_name: p.full_name,
          email: p.email,
        }))
        .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi')),
    [profilesRaw],
  )

  const studentCountByClass = useMemo(() => {
    const m = {}
    for (const s of studentsRaw) {
      if (s.is_deleted || !s.class_id) continue
      m[s.class_id] = (m[s.class_id] ?? 0) + 1
    }
    return m
  }, [studentsRaw])

  const existingClassKeys = useMemo(
    () => new Set(classesRaw.map((c) => `${c.code}|${c.school_year}`)),
    [classesRaw],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return classesRaw
      .filter((c) => c.school_year === schoolYear)
      .filter((c) => gradeFilter === 'all' || String(c.grade) === gradeFilter)
      .filter((c) => {
        if (!q) return true
        const tid = c.homeroom_teacher_id
        const p = tid ? profileById[tid] : null
        const blob = [c.code, c.room, p?.full_name, p?.email].filter(Boolean).join(' ').toLowerCase()
        return blob.includes(q)
      })
  }, [classesRaw, schoolYear, gradeFilter, query, profileById])

  useEffect(() => {
    setPage(1)
  }, [schoolYear, gradeFilter, query, pageSize, tableSortKey, tableSortDir])

  const mappedFiltered = useMemo(
    () => filtered.map((c) => mapClassRow(c, profileById, studentCountByClass)),
    [filtered, profileById, studentCountByClass],
  )

  const sortedMapped = useMemo(
    () => sortClassRowList(mappedFiltered, tableSortKey, tableSortDir),
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
      const col = CLASS_TABLE_COLUMNS.find((c) => c.key === key)
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

  const { totalClasses, totalStudents, avgStudents } = useMemo(() => {
    const n = filtered.length
    const sum = filtered.reduce((acc, c) => acc + (studentCountByClass[c.id] ?? 0), 0)
    const avg = n === 0 ? 0 : Math.round((sum / n) * 10) / 10
    return { totalClasses: n, totalStudents: sum, avgStudents: avg }
  }, [filtered, studentCountByClass])

  const handleCreate = useCallback(
    async (payload) => {
      await createClass(payload, classesRaw)
    },
    [classesRaw],
  )

  const handleUpdate = useCallback(
    async (id, payload) => {
      await updateClass(id, payload, classesRaw)
    },
    [classesRaw],
  )

  const openEdit = useCallback((row) => {
    setEditingClass(row._raw)
    setCreateOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setCreateOpen(false)
    setEditingClass(null)
  }, [])

  const handleToggleActive = useCallback(
    async (row) => {
      const active = row.status === 'active'
      const msg = active
        ? `Vô hiệu lớp ${row.code}? Lớp sẽ không dùng trong form ghi điểm.`
        : `Kích hoạt lại lớp ${row.code}?`
      if (!window.confirm(msg)) return
      try {
        await setClassActive(row.id, !active)
      } catch (e) {
        window.alert(e?.message ?? 'Không cập nhật được.')
      }
    },
    [],
  )

  const from = sortedMapped.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, sortedMapped.length)

  return (
    <AdminShell
      activeKey="lop-hoc"
      headerTitle="Tổ chức · Lớp học"
      searchPlaceholder="Tìm theo mã lớp, GVCN hoặc phòng..."
    >
      <ClassCreateModal
        open={createOpen}
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editingClass={editingClass}
        defaultSchoolYear={schoolYear}
        existingClassKeys={existingClassKeys}
        teachers={teachers}
      />

      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
          {loadError}
        </div>
      ) : null}

      <ClassPageHeader onAddClass={() => setCreateOpen(true)} />
      <ClassStatsCards
        totalClasses={totalClasses}
        totalStudents={totalStudents}
        avgStudents={avgStudents === 0 ? '—' : String(avgStudents)}
      />
      <ClassFilterBar
        schoolYear={schoolYear}
        onSchoolYearChange={setSchoolYear}
        gradeFilter={gradeFilter}
        onGradeFilterChange={setGradeFilter}
        query={query}
        onQueryChange={setQuery}
        onExport={() => downloadClassCsv(sortedMapped)}
      />
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <ClassTable
          rows={pageRows}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
          onEdit={openEdit}
          onToggleActive={handleToggleActive}
        />
        <ClassTablePagination
          page={safePage}
          pageSize={pageSize}
          total={sortedMapped.length}
          from={from}
          to={to}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <ClassHelpFooter />
      <ClassFabActions onAddClass={() => setCreateOpen(true)} />
    </AdminShell>
  )
}
