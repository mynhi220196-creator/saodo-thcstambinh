import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'
import AdminShell from '../../components/layout/AdminShell.jsx'
import {
  createConductCriterion,
  deleteConductCriterion,
  subscribeConductCriteria,
  updateConductCriterion,
} from '../../lib/conductCriteriaFirestore.js'
import ConductFilterToolbar from './ConductFilterToolbar.jsx'
import ConductPageHeader from './ConductPageHeader.jsx'
import ConductRuleModal from './ConductRuleModal.jsx'
import ConductRulesTable, { CONDUCT_TABLE_COLUMNS, sortConductRuleList } from './ConductRulesTable.jsx'
import ConductStatsCards from './ConductStatsCards.jsx'
import ConductTablePagination from './ConductTablePagination.jsx'
import ConductTipsFooter from './ConductTipsFooter.jsx'
import { filterRules } from './conductRuleMockData.js'

function downloadConductCsv(rows) {
  const headers = ['code', 'name', 'category', 'type', 'points', 'description', 'enabled']
  const lines = [headers.join(',')]
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`
  for (const r of rows) {
    lines.push(
      [esc(r.code), esc(r.name), esc(r.category), esc(r.type), esc(r.points), esc(r.description), esc(r.enabled)].join(','),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-conduct-criteria-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function ConductConfigPage() {
  const [rules, setRules] = useState([])
  const [loadError, setLoadError] = useState('')
  const [categoryTab, setCategoryTab] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [tableSortKey, setTableSortKey] = useState('code')
  const [tableSortDir, setTableSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)

  useEffect(() => {
    const unsub = subscribeConductCriteria(
      (list) => {
        setLoadError('')
        setRules(list)
      },
      (e) => setLoadError(e?.message ?? 'Không tải được danh sách.'),
    )
    return () => unsub()
  }, [])

  const filtered = useMemo(
    () => filterRules(rules, categoryTab, typeFilter, query),
    [rules, categoryTab, typeFilter, query],
  )

  const sortedFiltered = useMemo(
    () => sortConductRuleList(filtered, tableSortKey, tableSortDir),
    [filtered, tableSortKey, tableSortDir],
  )

  useEffect(() => {
    setPage(1)
  }, [categoryTab, typeFilter, query, pageSize, tableSortKey, tableSortDir])

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => sortedFiltered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [sortedFiltered, safePage, pageSize],
  )

  const onTableSort = useCallback(
    (key) => {
      const col = CONDUCT_TABLE_COLUMNS.find((c) => c.key === key)
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

  const from = sortedFiltered.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, sortedFiltered.length)

  const stats = useMemo(() => {
    const totalRules = rules.length
    const rewardCount = rules.filter((r) => r.type === 'reward').length
    const penaltyCount = rules.filter((r) => r.type === 'penalty').length
    const enabledCount = rules.filter((r) => r.enabled).length
    const lastMs = rules.reduce((m, r) => Math.max(m, r._updatedMs || r._createdMs || 0), 0)
    let updatedLabel = 'Chưa có dữ liệu'
    if (lastMs > 0) {
      const diff = Date.now() - lastMs
      const mins = Math.floor(diff / 60000)
      if (mins < 1) updatedLabel = 'Vừa cập nhật'
      else if (mins < 60) updatedLabel = `Cập nhật ${mins} phút trước`
      else if (mins < 1440) updatedLabel = `Cập nhật ${Math.floor(mins / 60)} giờ trước`
      else updatedLabel = `Cập nhật ${Math.floor(mins / 1440)} ngày trước`
    }
    const penalties = rules.filter((r) => r.type === 'penalty')
    const topPenalty =
      penalties.length === 0
        ? null
        : [...penalties].sort((a, b) => a.points - b.points)[0]
    return { totalRules, rewardCount, penaltyCount, enabledCount, updatedLabel, topPenalty }
  }, [rules])

  const onToggleEnabled = useCallback(async (id, nextEnabled) => {
    try {
      await updateConductCriterion(id, { enabled: nextEnabled })
    } catch (e) {
      window.alert(e?.message ?? 'Không cập nhật được.')
    }
  }, [])

  const handleModalSubmit = useCallback(async (payload) => {
    if (payload._docId) {
      await updateConductCriterion(payload._docId, {
        name: payload.name,
        category: payload.category,
        type: payload.type,
        points: payload.points,
        description: payload.description,
        enabled: payload.enabled,
      })
      return
    }
    await createConductCriterion({
      code: payload.code,
      name: payload.name,
      category: payload.category,
      type: payload.type,
      points: payload.points,
      description: payload.description,
      enabled: payload.enabled,
    })
  }, [])

  const handleDelete = useCallback(async (rule) => {
    if (!window.confirm(`Xóa hạng mục "${rule.name}" (${rule.code})?`)) return
    try {
      await deleteConductCriterion(rule.id)
    } catch (e) {
      window.alert(e?.message ?? 'Không xóa được.')
    }
  }, [])

  return (
    <AdminShell
      activeKey="hang-muc-thi-dua"
      headerTitle="Thi đua · Điểm tác phong"
      searchPlaceholder="Tìm kiếm nội quy, mã hoặc nhóm danh mục..."
    >
      <ConductRuleModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingRule(null)
        }}
        onSubmit={handleModalSubmit}
        initialRule={editingRule}
      />

      {loadError ? (
        <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
          {loadError}
        </div>
      ) : null}

      <ConductPageHeader
        onAdd={() => {
          setEditingRule(null)
          setModalOpen(true)
        }}
        onExport={() => downloadConductCsv(sortedFiltered)}
      />
      <ConductStatsCards stats={stats} />

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
        <ConductFilterToolbar
          categoryTab={categoryTab}
          onCategoryTabChange={setCategoryTab}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          query={query}
          onQueryChange={setQuery}
        />
        <ConductRulesTable
          rules={pageRows}
          filteredTotal={sortedFiltered.length}
          sortKey={tableSortKey}
          sortDir={tableSortDir}
          onSort={onTableSort}
          onToggleEnabled={onToggleEnabled}
          onEdit={(r) => {
            setEditingRule(r)
            setModalOpen(true)
          }}
          onDelete={handleDelete}
        />
        <ConductTablePagination
          from={from}
          to={to}
          filteredTotal={sortedFiltered.length}
          totalInDb={rules.length}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <ConductTipsFooter />
    </AdminShell>
  )
}
