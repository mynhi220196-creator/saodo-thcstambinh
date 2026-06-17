import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'
import ConductImageLightbox, { ConductRecordImageStrip } from '../../components/ConductImageLightbox.jsx'
import SaoDoShell from '../../components/layout/SaoDoShell.jsx'
import TeacherShell from '../../components/layout/TeacherShell.jsx'
import {
  deleteConductClassRecord,
  subscribeConductClassRecordsByTeacher,
} from '../../lib/conductClassRecordsFirestore.js'
import {
  RED_STAR_EDIT_WINDOW_MIN,
  canRedStarStillDelete,
  deleteConductScoreRecord,
  subscribeConductRecordsByTeacher,
} from '../../lib/conductScoreRecordsFirestore.js'
import DateInputVN from '../../components/DateInputVN.jsx'
import { formatDateTimeVN } from '../../lib/dateFormat.js'
import PortalTablePagination from './PortalTablePagination.jsx'

const PAGE_SIZE = 15

const formatWhen = formatDateTimeVN

/** YYYY-MM-DD theo giờ địa phương (khớp DateInputVN). */
function localDayKey(ms) {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function dayInRange(dayKey, from, to) {
  if (from && to) {
    const lo = from <= to ? from : to
    const hi = from <= to ? to : from
    return dayKey >= lo && dayKey <= hi
  }
  if (from) return dayKey >= from
  if (to) return dayKey <= to
  return true
}

function buildMergedRows(scoreList, classList) {
  const rows = []
  for (const r of scoreList) {
    const isLegacyClass = r.record_scope === 'class'
    rows.push({
      source: 'score',
      kind: isLegacyClass ? 'score_legacy_class' : 'individual',
      t: r._createdMs,
      key: `s-${r.id}`,
      r,
    })
  }
  for (const r of classList) {
    rows.push({
      source: 'class_doc',
      kind: 'class_level',
      t: r._createdMs,
      key: `c-${r.id}`,
      r,
    })
  }
  rows.sort((a, b) => b.t - a.t)
  return rows
}

function normalizeForSearch(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function rowMatchesQuery(row, qNorm) {
  if (!qNorm) return true
  const r = row.r
  const chunks = [
    row.t != null ? formatWhen(row.t) : '',
    r.class_code,
    r.school_year,
    r.student_name,
    r.student_id,
    r.criterion_name,
    r.criterion_code,
    r.note,
    r.recorded_by,
    r.recorded_by_name,
    r.points != null ? String(r.points) : '',
    row.kind === 'class_level' ? 'diem lop' : '',
    row.kind === 'score_legacy_class' ? 'lop cu' : '',
  ]
  const blob = normalizeForSearch(chunks.filter(Boolean).join(' '))
  return blob.includes(qNorm)
}

/**
 * Toàn bộ lịch sử ghi nhận tác phong của tài khoản (mọi lớp).
 * Dùng chung cổng Giáo viên và Đội Sao Đỏ.
 */
export default function TeacherConductHistoryPage({ variant = 'teacher' }) {
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const isSaoDo = variant === 'sao_do'
  const Shell = isSaoDo ? SaoDoShell : TeacherShell
  const accent = isSaoDo
    ? {
        h1: 'text-red-900 dark:text-red-100',
        crumb: 'text-red-900 dark:text-red-200',
        reward: 'text-red-700 dark:text-red-300',
      }
    : {
        h1: 'text-[#0d5c3f] dark:text-emerald-100',
        crumb: 'text-[#0d5c3f] dark:text-emerald-300',
        reward: 'text-emerald-700 dark:text-emerald-300',
      }

  const [scoreRecords, setScoreRecords] = useState([])
  const [classRecords, setClassRecords] = useState([])
  const [loadError, setLoadError] = useState('')
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [deleteBusyId, setDeleteBusyId] = useState('')
  const [toast, setToast] = useState('')
  const [imgLightbox, setImgLightbox] = useState({ open: false, urls: [], startIndex: 0 })

  const openConductImages = useCallback((urls, startIndex = 0) => {
    const list = Array.isArray(urls) ? urls.map((u) => String(u ?? '').trim()).filter(Boolean) : []
    if (!list.length) return
    setImgLightbox({ open: true, urls: list, startIndex })
  }, [])

  const closeConductImages = useCallback(() => {
    setImgLightbox({ open: false, urls: [], startIndex: 0 })
  }, [])

  useEffect(() => {
    if (!uid) {
      setScoreRecords([])
      return undefined
    }
    return subscribeConductRecordsByTeacher(
      uid,
      (list) => {
        setLoadError('')
        setScoreRecords(list)
      },
      (e) => setLoadError(e?.message ?? 'Không tải được bản ghi cá nhân / lớp (score).'),
    )
  }, [uid])

  useEffect(() => {
    if (!uid) {
      setClassRecords([])
      return undefined
    }
    return subscribeConductClassRecordsByTeacher(
      uid,
      (list) => {
        setLoadError('')
        setClassRecords(list)
      },
      (e) => setLoadError((prev) => prev || e?.message || 'Không tải được điểm lớp.'),
    )
  }, [uid])

  const merged = useMemo(() => buildMergedRows(scoreRecords, classRecords), [scoreRecords, classRecords])

  const dateRangeActive = Boolean(dateFrom.trim() || dateTo.trim())

  const mergedByDate = useMemo(() => {
    const from = dateFrom.trim()
    const to = dateTo.trim()
    if (!from && !to) return merged
    return merged.filter((row) => {
      if (row.t == null) return false
      const dayKey = localDayKey(row.t)
      return dayInRange(dayKey, from, to)
    })
  }, [merged, dateFrom, dateTo])

  const dateRangeSummary = useMemo(() => {
    const from = dateFrom.trim()
    const to = dateTo.trim()
    if (!from && !to) return null
    if (from && to) {
      const lo = from <= to ? from : to
      const hi = from <= to ? to : from
      if (lo === hi) return lo
      return `${lo} → ${hi}`
    }
    if (from) return `từ ${from}`
    return `đến ${to}`
  }, [dateFrom, dateTo])

  const filtered = useMemo(() => {
    const qNorm = normalizeForSearch(query)
    if (!qNorm) return mergedByDate
    return mergedByDate.filter((row) => rowMatchesQuery(row, qNorm))
  }, [mergedByDate, query])

  useEffect(() => {
    setPage(1)
  }, [query, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const sliceStart = (safePage - 1) * PAGE_SIZE
  const pagedRows = filtered.slice(sliceStart, sliceStart + PAGE_SIZE)
  const pageFrom = filtered.length === 0 ? 0 : sliceStart + 1
  const pageTo = Math.min(safePage * PAGE_SIZE, filtered.length)

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  const handleDelete = useCallback(
    async (row) => {
      if (!isSaoDo && row?.r?.admin_flagged) return
      if (row?.r?.recorded_by && row.r.recorded_by !== uid) return
      // Sao Đỏ: chỉ tự xóa bản ghi tác phong (conduct_score_records) trong cửa sổ thời gian.
      if (isSaoDo && row.kind !== 'class_level' && !canRedStarStillDelete(row.r)) {
        const reason =
          row.r.dispute_status && row.r.dispute_status !== 'none'
            ? 'Bản ghi đang/đã bị khiếu nại nên chỉ Ban giám hiệu mới được xử lý.'
            : row.r.admin_flagged
              ? 'Bản ghi đã bị Ban giám hiệu gắn cờ xử lý.'
              : `Đã quá ${RED_STAR_EDIT_WINDOW_MIN} phút kể từ khi ghi. Vui lòng báo Ban giám hiệu nếu cần chỉnh sửa.`
        window.alert(`Không thể xóa: ${reason}`)
        return
      }
      if (!window.confirm('Xóa bản ghi này? Thao tác không thể hoàn tác.')) return
      const id = row.r.id
      setDeleteBusyId(id)
      try {
        if (row.kind === 'class_level') await deleteConductClassRecord(id)
        else await deleteConductScoreRecord(id)
        setToast('Đã xóa bản ghi.')
        window.setTimeout(() => setToast(''), 4000)
      } catch (e) {
        window.alert(e?.message ?? 'Không xóa được bản ghi.')
      } finally {
        setDeleteBusyId('')
      }
    },
    [isSaoDo, uid],
  )

  function typeLabel(row) {
    if (row.kind === 'class_level') return 'Điểm lớp'
    if (row.kind === 'score_legacy_class') return 'Lớp (bản ghi cũ)'
    return 'Học sinh'
  }

  return (
    <Shell activeKey="lich-su" headerTitle="Lịch sử ghi nhận" searchPlaceholder="Lọc theo lớp, HS, tiêu chí…">
      <div className="w-full min-w-0 flex flex-col gap-6 max-w-6xl mx-auto">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            <span className={isSaoDo ? 'text-red-900/80 dark:text-red-300/90' : 'text-emerald-800/80 dark:text-emerald-300/80'}>
              {isSaoDo ? 'Đội Sao Đỏ' : 'Cổng Giáo viên'}
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className={accent.crumb}>Lịch sử</span>
          </div>
          <h1 className={`font-headline text-3xl font-extrabold ${accent.h1}`}>Lịch sử ghi nhận</h1>
          <p className="text-on-surface-variant text-sm mt-2 max-w-3xl">
            Toàn bộ bản ghi do bạn tạo: <span className="font-semibold text-on-surface">học sinh</span>,{' '}
            <span className="font-semibold text-on-surface">điểm lớp</span> (tập thể) và bản ghi lớp kiểu cũ trong{' '}
            <span className="font-mono text-xs">conduct_score_records</span>. Dữ liệu cập nhật theo thời gian thực.
          </p>
        </div>

        <details
          className={`group rounded-xl border overflow-hidden shrink-0 ${
            isSaoDo
              ? 'border-red-200/80 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/15'
              : 'border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/15'
          }`}
        >
          <summary
            className={`flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left transition-colors [&::-webkit-details-marker]:hidden ${
              isSaoDo
                ? 'hover:bg-red-100/50 dark:hover:bg-red-950/30'
                : 'hover:bg-emerald-100/50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant">
                Lọc theo khoảng ngày
              </p>
              {dateRangeActive && dateRangeSummary ? (
                <p
                  className={`text-sm font-bold tabular-nums mt-1 ${
                    isSaoDo ? 'text-red-900 dark:text-red-200' : 'text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  Đang áp dụng: {dateRangeSummary}
                </p>
              ) : (
                <p className="text-xs text-on-surface-variant mt-1">
                  Mở để chọn từ ngày / đến ngày (lọc theo thời gian ghi nhận)
                </p>
              )}
            </div>
            <span
              className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 group-open:rotate-180"
              aria-hidden
            >
              expand_more
            </span>
          </summary>
          <div className="border-t border-outline-variant/10 px-4 py-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4 bg-surface-container-lowest/40">
            <fieldset className="flex flex-col gap-2 border-0 p-0 m-0 w-full sm:w-auto">
              <legend className="sr-only">Chọn khoảng ngày</legend>
              <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                <div className="flex min-w-[11rem] flex-col gap-1 shrink-0">
                  <label htmlFor="history-date-from" className="text-[11px] font-bold text-on-surface-variant">
                    Từ ngày
                  </label>
                  <DateInputVN id="history-date-from" value={dateFrom} onChange={setDateFrom} />
                </div>
                <div className="flex min-w-[11rem] flex-col gap-1 shrink-0">
                  <label htmlFor="history-date-to" className="text-[11px] font-bold text-on-surface-variant">
                    Đến ngày
                  </label>
                  <DateInputVN id="history-date-to" value={dateTo} onChange={setDateTo} />
                </div>
              </div>
            </fieldset>
            {dateRangeActive ? (
              <button
                type="button"
                onClick={() => {
                  setDateFrom('')
                  setDateTo('')
                }}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-bold border-2 border-outline-variant/30 text-on-surface hover:bg-surface-container-high self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                Xóa lọc ngày
              </button>
            ) : null}
          </div>
        </details>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end sm:justify-between">
          <p className="text-sm font-semibold text-on-surface tabular-nums">
            <span className="text-on-surface-variant font-normal">Tổng </span>
            {merged.length}
            <span className="text-on-surface-variant font-normal"> bản ghi</span>
            {dateRangeActive ? (
              <>
                <span className="text-on-surface-variant font-normal"> · trong khoảng </span>
                {mergedByDate.length}
              </>
            ) : null}
            {query.trim() ? (
              <>
                <span className="text-on-surface-variant font-normal"> · khớp tìm kiếm </span>
                {filtered.length}
              </>
            ) : null}
          </p>
          <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant min-w-[min(100%,280px)] sm:max-w-md flex-1">
            Lọc nhanh
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lớp, năm học, tên HS, tiêu chí, ghi chú…"
                className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-10 pr-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </label>
        </div>

        {loadError ? (
          <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3">{loadError}</p>
        ) : null}
        {toast ? (
          <p
            className={`text-sm font-bold rounded-xl px-4 py-3 ${
              isSaoDo
                ? 'text-red-900 dark:text-red-100 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900'
                : 'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900'
            }`}
          >
            {toast}
          </p>
        ) : null}

        {!uid ? (
          <p className="text-sm text-on-surface-variant text-center py-12">Chưa đăng nhập.</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 p-12 text-center text-on-surface-variant text-sm">
            {merged.length === 0
              ? 'Bạn chưa có bản ghi tác phong nào.'
              : mergedByDate.length === 0
                ? 'Không có bản ghi trong khoảng ngày đã chọn.'
                : 'Không có bản ghi khớp tìm kiếm.'}
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm text-left border-collapse">
                <thead>
                  <tr className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant bg-surface-container-high/90 border-b border-outline-variant/10">
                    <th className="px-3 py-3 whitespace-nowrap">Thời gian</th>
                    <th className="px-3 py-3">Loại</th>
                    <th className="px-3 py-3">Lớp · NH</th>
                    <th className="px-3 py-3 min-w-[140px]">Học sinh</th>
                    <th className="px-3 py-3 min-w-[160px]">Tiêu chí</th>
                    <th className="px-3 py-3 text-right whitespace-nowrap">Điểm</th>
                    <th className="px-3 py-3 min-w-[120px]">Ghi chú</th>
                    <th className="px-3 py-3 text-center w-14">Ảnh</th>
                    <th className="px-3 py-3 text-right w-12"> </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {pagedRows.map((row) => {
                    const r = row.r
                    const pts = Number(r.points) || 0
                    const isPen = r.type === 'penalty'
                    return (
                      <tr key={row.key} className="hover:bg-surface-container-low/50 align-top">
                        <td className="px-3 py-2.5 text-on-surface-variant whitespace-nowrap tabular-nums">
                          {formatWhen(row.t)}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md ${
                              row.kind === 'class_level'
                                ? 'bg-teal-100 text-teal-900 dark:bg-teal-950/60 dark:text-teal-100'
                                : row.kind === 'score_legacy_class'
                                  ? 'bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-100'
                                  : 'bg-slate-200/80 text-slate-800 dark:bg-slate-700 dark:text-slate-100'
                            }`}
                          >
                            {typeLabel(row)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-bold text-on-surface">{r.class_code || '—'}</span>
                          <span className="block text-xs text-on-surface-variant mt-0.5">{r.school_year || '—'}</span>
                        </td>
                        <td className="px-3 py-2.5 text-on-surface">
                          {row.kind === 'individual' ? (
                            <>
                              <span className="font-medium">{r.student_name || '—'}</span>
                              {r.student_id ? (
                                <span className="block text-[11px] font-mono text-on-surface-variant">{r.student_id}</span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-on-surface-variant">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-medium text-on-surface leading-snug">{r.criterion_name || '—'}</span>
                          {r.criterion_code ? (
                            <span className="block text-[11px] font-mono text-on-surface-variant">{r.criterion_code}</span>
                          ) : null}
                        </td>
                        <td
                          className={`px-3 py-2.5 text-right font-extrabold tabular-nums ${
                            isPen ? 'text-rose-700 dark:text-rose-300' : accent.reward
                          }`}
                        >
                          {isPen ? '−' : '+'}
                          {Math.abs(pts)}
                        </td>
                        <td className="px-3 py-2.5 text-on-surface-variant text-xs max-w-[200px]">
                          <span className="line-clamp-3" title={r.note || ''}>
                            {r.note?.trim() ? r.note : '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <ConductRecordImageStrip urls={r.image_urls} onOpen={openConductImages} />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            disabled={(!isSaoDo && r.admin_flagged === true) || deleteBusyId === r.id}
                            title={
                              !isSaoDo && r.admin_flagged ? 'Đã gắn cờ — chỉ quản trị có thể xóa.' : 'Xóa bản ghi'
                            }
                            onClick={() => handleDelete(row)}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors disabled:opacity-40 disabled:pointer-events-none"
                            aria-label="Xóa bản ghi"
                          >
                            <span className="material-symbols-outlined text-lg leading-none">delete</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <PortalTablePagination
              from={pageFrom}
              to={pageTo}
              total={filtered.length}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              noun="bản ghi"
            />
          </div>
        )}

        <ConductImageLightbox
          open={imgLightbox.open}
          urls={imgLightbox.urls}
          startIndex={imgLightbox.startIndex}
          onClose={closeConductImages}
        />
      </div>
    </Shell>
  )
}
