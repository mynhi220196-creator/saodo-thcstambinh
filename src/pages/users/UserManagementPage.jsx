import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { useAuth } from '../../auth/useAuth.js'
import {
  filterProfileRows,
  profileDocToRow,
  setUserActive,
  subscribeProfiles,
} from '../../lib/userProfilesFirestore.js'
import UserCreateModal from './UserCreateModal.jsx'
import UserDetailModal from './UserDetailModal.jsx'
import UserEditModal from './UserEditModal.jsx'
import UserFabActions from './UserFabActions.jsx'
import UserFilterBar from './UserFilterBar.jsx'
import UserHelpFooter from './UserHelpFooter.jsx'
import UserPageHeader from './UserPageHeader.jsx'
import UserStatsCards from './UserStatsCards.jsx'
import UserTable, { USER_TABLE_COLUMNS, sortUserRowList } from './UserTable.jsx'
import UserTablePagination from './UserTablePagination.jsx'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'

function downloadCsv(rows) {
  const headers = ['uid', 'email', 'full_name', 'role', 'unit', 'status', 'created_at']
  const lines = [headers.join(',')]
  for (const r of rows) {
    const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`
    lines.push(
      [
        esc(r.id),
        esc(r.email),
        esc(r.fullName),
        esc(r.role),
        esc(r.unit),
        esc(r.status),
        esc(r.createdAt),
      ].join(','),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-users-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function UserManagementPage() {
  const { user } = useAuth()
  const currentUserId = user?.id
  const [searchParams] = useSearchParams()

  const [rawDocs, setRawDocs] = useState([])
  const [loadError, setLoadError] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)
  const [tableSortKey, setTableSortKey] = useState('name')
  const [tableSortDir, setTableSortDir] = useState('asc')

  const [createOpen, setCreateOpen] = useState(false)
  const [detailUser, setDetailUser] = useState(null)
  const [editUser, setEditUser] = useState(null)

  useEffect(() => {
    const q = searchParams.get('q')
    if (typeof q === 'string' && q.trim()) setQuery(q.trim())
  }, [searchParams])

  useEffect(() => {
    const unsub = subscribeProfiles(
      (list) => {
        setLoadError('')
        setRawDocs(list)
      },
      (err) => {
        setLoadError(err?.message ?? 'Không tải được danh sách từ Firestore.')
      },
    )
    return () => unsub()
  }, [])

  const allRows = useMemo(() => {
    return rawDocs.map((d) => profileDocToRow(d)).filter(Boolean)
  }, [rawDocs])

  const totalInDb = allRows.length

  const filtered = useMemo(
    () => filterProfileRows(allRows, roleFilter, statusFilter, query),
    [allRows, roleFilter, statusFilter, query],
  )

  useEffect(() => {
    setPage(1)
  }, [roleFilter, statusFilter, query, pageSize, tableSortKey, tableSortDir])

  const sortedFiltered = useMemo(
    () => sortUserRowList(filtered, tableSortKey, tableSortDir),
    [filtered, tableSortKey, tableSortDir],
  )

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => sortedFiltered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedFiltered, safePage, pageSize],
  )

  const onTableSort = useCallback(
    (key) => {
      const col = USER_TABLE_COLUMNS.find((c) => c.key === key)
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

  const handleToggleLock = useCallback(
    async (u) => {
      if (u.id === currentUserId) return
      const raw = u._raw ?? {}
      const active = raw.is_active !== false
      if (!window.confirm(active ? 'Khóa tài khoản này? Họ sẽ không đăng nhập được.' : 'Mở khóa tài khoản này?')) return
      try {
        await setUserActive(u.id, !active)
      } catch (e) {
        window.alert(e?.message ?? 'Không cập nhật được.')
      }
    },
    [currentUserId],
  )

  const handleExport = useCallback(() => {
    downloadCsv(sortedFiltered)
  }, [sortedFiltered])

  const openCreate = useCallback(() => setCreateOpen(true), [])

  return (
    <AdminShell
      activeKey="nguoi-dung"
      headerTitle="Hệ thống · Người dùng"
      searchPlaceholder="Tìm theo tên, email hoặc mã đăng nhập…"
    >
      <UserPageHeader onInvite={openCreate} />

      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
          {loadError}
          <p className="mt-2 font-normal text-on-surface-variant">
            Kiểm tra Firestore đã bật, rules đã deploy, và tài khoản của bạn có role ADMIN trong{' '}
            <code className="font-mono text-xs">profiles/{'{uid}'}</code>.
          </p>
        </div>
      ) : null}

      <UserStatsCards filtered={filtered} totalInDb={totalInDb} />
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <UserFilterBar
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          query={query}
          onQueryChange={setQuery}
        />
        <UserTable
          rows={pageRows}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
          currentUserId={currentUserId}
          onDetail={setDetailUser}
          onEdit={(u) => setEditUser(u)}
          onToggleLock={handleToggleLock}
        />
        <UserTablePagination
          page={safePage}
          pageSize={pageSize}
          filteredTotal={sortedFiltered.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
      <UserHelpFooter />
      <UserFabActions onCreate={openCreate} onExport={handleExport} />

      <UserCreateModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => {}} />
      <UserDetailModal
        open={!!detailUser}
        user={detailUser}
        currentUserId={currentUserId}
        onClose={() => setDetailUser(null)}
        onRequestEdit={() => {
          if (detailUser) {
            setEditUser(detailUser)
            setDetailUser(null)
          }
        }}
        onChanged={() => {}}
      />
      <UserEditModal
        open={!!editUser}
        user={editUser}
        currentUserId={currentUserId}
        onClose={() => setEditUser(null)}
        onSaved={() => {}}
      />
    </AdminShell>
  )
}
