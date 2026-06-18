import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ConductImageLightbox from '../../components/ConductImageLightbox.jsx'
import AdminShell from '../../components/layout/AdminShell.jsx'
import {
  deleteConductClassRecord,
  setConductClassAdminFlagged,
  subscribeAllConductClassRecords,
} from '../../lib/conductClassRecordsFirestore.js'
import {
  deleteConductScoreRecord,
  rejectConductDispute,
  setConductScoreAdminFlagged,
  subscribeAllConductScoreRecords,
} from '../../lib/conductScoreRecordsFirestore.js'
import { useAuth } from '../../auth/useAuth.js'
import { notifyDisputeResolved } from '../../lib/notificationsFirestore.js'
import {
  mapConductClassRecordForAdmin,
  mapConductScoreRecordForAdmin,
} from './adminFirestoreScoreRecordsMap.js'
import { subscribeClasses } from '../../lib/organizationFirestore.js'
import {
  filterScoreRecords,
  summarizeRecords,
} from './scoreRecordMockData.js'
import ScoreRecordsFilterBar from './ScoreRecordsFilterBar.jsx'
import ScoreRecordsHelpStrip from './ScoreRecordsHelpStrip.jsx'
import AdminQuickScoreModal from './AdminQuickScoreModal.jsx'
import ScoreRecordsPageHeader from './ScoreRecordsPageHeader.jsx'
import ScoreRecordsStatsCards from './ScoreRecordsStatsCards.jsx'
import { downloadScoreRecordsCsv } from './scoreRecordsCsv.js'
import { DEFAULT_ORG_PAGE_SIZE } from '../../components/OrgTablePageSizeSelect.jsx'
import ScoreRecordsTable from './ScoreRecordsTable.jsx'
import ScoreRecordsTableFooter from './ScoreRecordsTableFooter.jsx'

function parseConductRowKey(rowKey) {
  const s = String(rowKey ?? '')
  const i = s.indexOf(':')
  if (i <= 0) return null
  const kind = s.slice(0, i)
  const id = s.slice(i + 1)
  if (!id || (kind !== 'score' && kind !== 'class')) return null
  return { kind, id }
}

export default function ScoreRecordsPage() {
  const { user, profile } = useAuth()
  const [scoreRaw, setScoreRaw] = useState([])
  const [classRaw, setClassRaw] = useState([])
  const [classesRaw, setClassesRaw] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [loadError, setLoadError] = useState('')
  const loadGate = useRef({ score: false, class: false })

  const [adminActionBusy, setAdminActionBusy] = useState(false)
  const [actionBanner, setActionBanner] = useState({ kind: '', message: '' })
  const [imgLightbox, setImgLightbox] = useState({ open: false, urls: [], startIndex: 0 })
  const [quickScoreOpen, setQuickScoreOpen] = useState(false)

  const openConductImages = useCallback((urls, startIndex = 0) => {
    const list = Array.isArray(urls) ? urls.map((u) => String(u ?? '').trim()).filter(Boolean) : []
    if (!list.length) return
    setImgLightbox({ open: true, urls: list, startIndex })
  }, [])

  const closeConductImages = useCallback(() => {
    setImgLightbox({ open: false, urls: [], startIndex: 0 })
  }, [])

  const bumpHydrated = useCallback(() => {
    if (loadGate.current.score && loadGate.current.class) setHydrated(true)
  }, [])

  useEffect(() => {
    loadGate.current = { score: false, class: false }
    setHydrated(false)
    const u1 = subscribeAllConductScoreRecords(
      (d) => {
        setScoreRaw(d)
        setLoadError('')
        if (!loadGate.current.score) {
          loadGate.current.score = true
          bumpHydrated()
        }
      },
      (e) => {
        setScoreRaw([])
        setLoadError((prev) => prev || e?.message || 'Không tải được conduct_score_records.')
        if (!loadGate.current.score) {
          loadGate.current.score = true
          bumpHydrated()
        }
      },
    )
    const u2 = subscribeAllConductClassRecords(
      (d) => {
        setClassRaw(d)
        setLoadError('')
        if (!loadGate.current.class) {
          loadGate.current.class = true
          bumpHydrated()
        }
      },
      (e) => {
        setClassRaw([])
        setLoadError((prev) => prev || e?.message || 'Không tải được conduct_class_records.')
        if (!loadGate.current.class) {
          loadGate.current.class = true
          bumpHydrated()
        }
      },
    )
    return () => {
      u1()
      u2()
    }
  }, [bumpHydrated])

  useEffect(() => {
    const u = subscribeClasses(setClassesRaw, () => {})
    return () => u()
  }, [])

  const mergedBase = useMemo(() => {
    const a = scoreRaw.map(mapConductScoreRecordForAdmin)
    const b = classRaw.map(mapConductClassRecordForAdmin)
    return [...a, ...b].sort((x, y) => new Date(y.at).getTime() - new Date(x.at).getTime())
  }, [scoreRaw, classRaw])

  const classCodeOptions = useMemo(() => {
    const codes = new Set()
    for (const c of classesRaw) {
      if (c.is_deleted === true || c.is_active === false) continue
      const code = String(c.code ?? '').trim()
      if (code) codes.add(code)
    }
    for (const r of mergedBase) {
      const code = String(r.classCode ?? '').trim()
      if (code && code !== '—') codes.add(code)
    }
    const hasUnknown = mergedBase.some((r) => {
      const code = String(r.classCode ?? '').trim()
      return !code || r.classCode === '—'
    })
    const opts = [{ value: 'all', label: 'Mọi lớp' }]
    if (hasUnknown) opts.push({ value: '__unknown__', label: 'Chưa rõ lớp' })
    for (const c of [...codes].sort((a, b) => a.localeCompare(b, 'vi'))) {
      opts.push({ value: c, label: c })
    }
    return opts
  }, [classesRaw, mergedBase])

  const [dateRange, setDateRange] = useState('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')
  const [singleDateYmd, setSingleDateYmd] = useState('')
  const [classCode, setClassCode] = useState('all')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_ORG_PAGE_SIZE)

  useEffect(() => {
    const ok = classCodeOptions.some((o) => o.value === classCode)
    if (!ok) setClassCode('all')
  }, [classCodeOptions, classCode])

  const filters = useMemo(
    () => ({
      dateRange,
      customDateFrom,
      customDateTo,
      singleDateYmd,
      classCode,
      status,
      type,
      query,
    }),
    [dateRange, customDateFrom, customDateTo, singleDateYmd, classCode, status, type, query],
  )

  const visible = useMemo(() => filterScoreRecords(mergedBase, filters), [mergedBase, filters])

  useEffect(() => {
    setPage(1)
  }, [filters, pageSize])

  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = useMemo(
    () => visible.slice((safePage - 1) * pageSize, safePage * pageSize),
    [visible, safePage, pageSize],
  )

  const pageFrom = visible.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const pageTo = Math.min(safePage * pageSize, visible.length)

  const stats = useMemo(() => summarizeRecords(visible), [visible])

  /** Số khiếu nại đang chờ phân xử (toàn bộ, không phụ thuộc bộ lọc). */
  const openDisputeCount = useMemo(
    () => mergedBase.filter((r) => r.disputeStatus === 'open').length,
    [mergedBase],
  )

  const showBanner = useCallback((kind, message) => {
    setActionBanner({ kind, message })
    if (message) window.setTimeout(() => setActionBanner({ kind: '', message: '' }), 5000)
  }, [])

  const onApprove = useCallback(() => {}, [])
  const onReject = useCallback(() => {}, [])

  const onFlag = useCallback(
    async (rowKey) => {
      const p = parseConductRowKey(rowKey)
      if (!p) return
      setAdminActionBusy(true)
      setActionBanner({ kind: '', message: '' })
      try {
        if (p.kind === 'score') await setConductScoreAdminFlagged(p.id, true)
        else await setConductClassAdminFlagged(p.id, true)
        showBanner('ok', 'Đã gắn cờ xử lý nghiêm (đã lưu Firestore).')
      } catch (e) {
        showBanner('err', e?.message ?? 'Không gắn cờ được. Kiểm tra quyền ADMIN và rules.')
      } finally {
        setAdminActionBusy(false)
      }
    },
    [showBanner],
  )

  const onClearAdminFlag = useCallback(
    async (rowKey) => {
      const p = parseConductRowKey(rowKey)
      if (!p) return
      setAdminActionBusy(true)
      setActionBanner({ kind: '', message: '' })
      try {
        if (p.kind === 'score') await setConductScoreAdminFlagged(p.id, false)
        else await setConductClassAdminFlagged(p.id, false)
        showBanner('ok', 'Đã gỡ cờ (đã lưu Firestore).')
      } catch (e) {
        showBanner('err', e?.message ?? 'Không gỡ cờ được.')
      } finally {
        setAdminActionBusy(false)
      }
    },
    [showBanner],
  )

  const onExportCsv = useCallback(() => {
    if (!visible.length) {
      showBanner('err', 'Không có bản ghi nào khớp bộ lọc hiện tại để xuất CSV.')
      return
    }
    try {
      downloadScoreRecordsCsv(visible)
      showBanner('ok', `Đã tải CSV (${visible.length} dòng).`)
    } catch (e) {
      showBanner('err', e?.message ?? 'Xuất CSV thất bại.')
    }
  }, [visible, showBanner])

  const onDeleteRecord = useCallback(
    async (rowKey) => {
      const p = parseConductRowKey(rowKey)
      if (!p) return
      if (
        !window.confirm(
          'Xóa vĩnh viễn bản ghi này khỏi Firestore? Thao tác không thể hoàn tác.',
        )
      ) {
        return
      }
      setAdminActionBusy(true)
      setActionBanner({ kind: '', message: '' })
      try {
        if (p.kind === 'score') await deleteConductScoreRecord(p.id)
        else await deleteConductClassRecord(p.id)
        showBanner('ok', 'Đã xóa bản ghi.')
      } catch (e) {
        showBanner('err', e?.message ?? 'Không xóa được. Kiểm tra quyền ADMIN và rules.')
      } finally {
        setAdminActionBusy(false)
      }
    },
    [showBanner],
  )

  /** Phân xử khiếu nại — CHẤP NHẬN: xóa bản ghi điểm trừ (trả lại công bằng cho học sinh). */
  const onAcceptDispute = useCallback(
    async (rowKey) => {
      const p = parseConductRowKey(rowKey)
      if (!p || p.kind !== 'score') return
      if (!window.confirm('Chấp nhận khiếu nại và XÓA điểm trừ này? Thao tác không thể hoàn tác.')) return
      const row = mergedBase.find((r) => r.rowKey === rowKey)
      setAdminActionBusy(true)
      setActionBanner({ kind: '', message: '' })
      try {
        await deleteConductScoreRecord(p.id)
        if (row?.disputedBy) {
          notifyDisputeResolved({
            recipientUid: row.disputedBy,
            classCode: row.classCode,
            studentName: row.studentName,
            outcome: 'accepted',
            createdBy: user?.id ?? '',
            createdByName: profile?.full_name?.trim() || user?.email || '',
          }).catch(() => {})
        }
        showBanner('ok', 'Đã chấp nhận khiếu nại và xóa điểm trừ.')
      } catch (e) {
        showBanner('err', e?.message ?? 'Không xử lý được. Kiểm tra quyền ADMIN và rules.')
      } finally {
        setAdminActionBusy(false)
      }
    },
    [showBanner, mergedBase, user, profile],
  )

  /** Phân xử khiếu nại — BÁC: giữ nguyên điểm, đánh dấu đã xử lý. */
  const onRejectDispute = useCallback(
    async (rowKey) => {
      const p = parseConductRowKey(rowKey)
      if (!p || p.kind !== 'score') return
      const note = window.prompt('Bác khiếu nại — ghi chú lý do (tuỳ chọn):', '') ?? ''
      const row = mergedBase.find((r) => r.rowKey === rowKey)
      setAdminActionBusy(true)
      setActionBanner({ kind: '', message: '' })
      try {
        await rejectConductDispute(p.id, {
          resolved_by: user?.id ?? '',
          note,
        })
        if (row?.disputedBy) {
          notifyDisputeResolved({
            recipientUid: row.disputedBy,
            classCode: row.classCode,
            studentName: row.studentName,
            outcome: 'rejected',
            createdBy: user?.id ?? '',
            createdByName: profile?.full_name?.trim() || user?.email || '',
          }).catch(() => {})
        }
        showBanner('ok', 'Đã bác khiếu nại, giữ nguyên điểm.')
      } catch (e) {
        showBanner('err', e?.message ?? 'Không xử lý được. Kiểm tra quyền ADMIN và rules.')
      } finally {
        setAdminActionBusy(false)
      }
    },
    [showBanner, mergedBase, user, profile],
  )

  return (
    <AdminShell
      activeKey="ban-ghi-diem"
      headerTitle="Tác phong · Bản ghi điểm"
      searchPlaceholder="Tìm theo mã, học sinh, lớp, tiêu chí, năm học…"
    >
      <ScoreRecordsPageHeader
        onExportCsv={onExportCsv}
        exportDisabled={!hydrated}
        onQuickScore={() => setQuickScoreOpen(true)}
        quickDisabled={!hydrated}
      />

      {!hydrated ? (
        <p className="text-sm text-on-surface-variant mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg animate-pulse">hourglass_empty</span>
          Đang tải toàn bộ bản ghi từ Firestore…
        </p>
      ) : null}
      {loadError ? (
        <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3 mb-4">{loadError}</p>
      ) : null}
      {actionBanner.message ? (
        <p
          className={`text-sm font-semibold rounded-xl px-4 py-3 mb-4 ${
            actionBanner.kind === 'err'
              ? 'text-error bg-error-container/30'
              : 'text-green-800 bg-green-50 dark:bg-green-950/30 dark:text-green-200'
          }`}
        >
          {actionBanner.message}
        </p>
      ) : null}

      {openDisputeCount > 0 ? (
        <p className="text-sm font-bold rounded-xl px-4 py-3 mb-4 flex items-center gap-2 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 border border-amber-200 dark:border-amber-900">
          <span className="material-symbols-outlined text-lg">gavel</span>
          Có {openDisputeCount} khiếu nại từ GVCN đang chờ phân xử. Tìm dòng có nhãn «GVCN khiếu nại» để xử lý.
        </p>
      ) : null}

      <ScoreRecordsStatsCards
        total={stats.total}
        pending={stats.pending}
        flagged={stats.flagged}
        sumPlus={stats.sumPlus}
        sumMinus={stats.sumMinus}
      />

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <ScoreRecordsFilterBar
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          customDateFrom={customDateFrom}
          customDateTo={customDateTo}
          onCustomDateFromChange={setCustomDateFrom}
          onCustomDateToChange={setCustomDateTo}
          singleDateYmd={singleDateYmd}
          onSingleDateYmdChange={setSingleDateYmd}
          classCode={classCode}
          onClassCodeChange={setClassCode}
          classCodeOptions={classCodeOptions}
          status={status}
          onStatusChange={setStatus}
          type={type}
          onTypeChange={setType}
          query={query}
          onQueryChange={setQuery}
        />
        <ScoreRecordsTable
          records={pageRows}
          onApprove={onApprove}
          onReject={onReject}
          onFlag={onFlag}
          onClearAdminFlag={onClearAdminFlag}
          onDeleteRecord={onDeleteRecord}
          onAcceptDispute={onAcceptDispute}
          onRejectDispute={onRejectDispute}
          onOpenConductImages={openConductImages}
          actionsDisabled={adminActionBusy}
        />
        <ScoreRecordsTableFooter
          from={pageFrom}
          to={pageTo}
          filteredTotal={visible.length}
          totalInDb={mergedBase.length}
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <ConductImageLightbox
        open={imgLightbox.open}
        urls={imgLightbox.urls}
        startIndex={imgLightbox.startIndex}
        onClose={closeConductImages}
      />

      <AdminQuickScoreModal
        open={quickScoreOpen}
        onClose={() => setQuickScoreOpen(false)}
        onRecorded={() => showBanner('ok', 'Đã lưu bản ghi tác phong.')}
      />

      <ScoreRecordsHelpStrip />
    </AdminShell>
  )
}
