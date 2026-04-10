import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDateTimeVN } from '../../lib/dateFormat.js'
import { sourceLabel } from '../scoreRecords/scoreRecordMockData.js'
import ClassDetailPagination from './ClassDetailPagination.jsx'

const STUDENT_PAGE_SIZE = 10
const CONDUCT_PAGE_SIZE = 6

const TAB_STUDENTS = 'students'
const TAB_CONDUCT = 'conduct'

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
  approved: 'bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-100',
  rejected: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  flagged: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-100',
}

const STATUS_LABEL = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  flagged: 'Cần xử lý',
}

const formatWhen = formatDateTimeVN

function normalizeForSearch(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function tabBtnClass(active) {
  return [
    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2',
    active
      ? 'border-primary bg-primary-fixed/40 text-primary dark:bg-primary-container/25 dark:text-white'
      : 'border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  ].join(' ')
}

export default function ClassDetailTabs({ roster, conductLogs }) {
  const [tab, setTab] = useState(TAB_STUDENTS)
  const [studentPage, setStudentPage] = useState(1)
  const [conductPage, setConductPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRoster = useMemo(() => {
    const q = normalizeForSearch(searchQuery)
    if (!q) return roster
    return roster.filter((s) => {
      const blob = normalizeForSearch([s.studentCode, s.fullName, s.gender, s.conductAvg].filter(Boolean).join(' '))
      return blob.includes(q)
    })
  }, [roster, searchQuery])

  const filteredConductLogs = useMemo(() => {
    const q = normalizeForSearch(searchQuery)
    if (!q) return conductLogs
    return conductLogs.filter((r) => {
      const blob = normalizeForSearch(
        [
          r.id,
          r.studentName,
          r.studentCode,
          r.ruleName,
          r.ruleCode,
          r.category,
          r.recordedBy,
          r.status,
          r.points,
          formatWhen(r.at),
          sourceLabel(r.source),
        ]
          .filter(Boolean)
          .join(' '),
      )
      return blob.includes(q)
    })
  }, [conductLogs, searchQuery])

  useEffect(() => {
    setStudentPage(1)
    setConductPage(1)
  }, [searchQuery])

  const studentTotalPages = useMemo(() => {
    if (filteredRoster.length === 0) return 1
    return Math.ceil(filteredRoster.length / STUDENT_PAGE_SIZE)
  }, [filteredRoster.length])

  const conductTotalPages = useMemo(() => {
    if (filteredConductLogs.length === 0) return 1
    return Math.ceil(filteredConductLogs.length / CONDUCT_PAGE_SIZE)
  }, [filteredConductLogs.length])

  const safeStudentPage = Math.min(Math.max(1, studentPage), studentTotalPages)
  const safeConductPage = Math.min(Math.max(1, conductPage), conductTotalPages)

  const studentSlice = useMemo(() => {
    const start = (safeStudentPage - 1) * STUDENT_PAGE_SIZE
    return filteredRoster.slice(start, start + STUDENT_PAGE_SIZE)
  }, [filteredRoster, safeStudentPage])

  const conductSlice = useMemo(() => {
    const start = (safeConductPage - 1) * CONDUCT_PAGE_SIZE
    return filteredConductLogs.slice(start, start + CONDUCT_PAGE_SIZE)
  }, [filteredConductLogs, safeConductPage])

  const searchPlaceholder =
    tab === TAB_STUDENTS
      ? 'Tìm theo mã HS, tên, giới tính…'
      : 'Tìm theo học sinh, tiêu chí, người ghi, trạng thái…'

  const studentZeroMessage =
    roster.length > 0 && searchQuery.trim() && filteredRoster.length === 0
      ? 'Không có học sinh khớp tìm kiếm.'
      : null
  const conductZeroMessage =
    conductLogs.length > 0 && searchQuery.trim() && filteredConductLogs.length === 0
      ? 'Không có bản ghi khớp tìm kiếm.'
      : null

  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-outline-variant/10 bg-surface-container-low/40">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chi tiết lớp">
          <button
            type="button"
            role="tab"
            aria-selected={tab === TAB_STUDENTS}
            className={tabBtnClass(tab === TAB_STUDENTS)}
            onClick={() => setTab(TAB_STUDENTS)}
          >
            <span className="material-symbols-outlined text-[22px]">groups</span>
            Danh sách học sinh
            <span className="text-xs font-extrabold tabular-nums opacity-80">({roster.length})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === TAB_CONDUCT}
            className={tabBtnClass(tab === TAB_CONDUCT)}
            onClick={() => setTab(TAB_CONDUCT)}
          >
            <span className="material-symbols-outlined text-[22px]">history_edu</span>
            Ghi nhận tác phong
            <span className="text-xs font-extrabold tabular-nums opacity-80">({conductLogs.length})</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            to="/admin/students"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-xl">open_in_new</span>
            Quản lý học sinh
          </Link>
          <Link
            to="/admin/score-records"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-outline-variant/30 text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">fact_check</span>
            Toàn bộ bản ghi điểm
          </Link>
        </div>
      </div>

      <div className="px-5 py-3 border-b border-outline-variant/10 bg-surface-container-lowest">
        <div className="relative max-w-xl">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low pl-10 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      {tab === TAB_STUDENTS ? (
        <div role="tabpanel">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Mã HS
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Họ và tên
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Giới tính
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider text-right">
                    ĐTB tác phong
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {studentSlice.map((s, i) => (
                  <tr key={s.studentCode} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-5 py-3 text-sm text-on-surface-variant tabular-nums font-medium">
                      {(safeStudentPage - 1) * STUDENT_PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-5 py-3 font-mono text-sm text-primary font-semibold whitespace-nowrap">
                      {s.studentCode}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-on-surface">{s.fullName}</td>
                    <td className="px-5 py-3 text-sm text-on-surface-variant">{s.gender}</td>
                    <td className="px-5 py-3 text-sm font-bold tabular-nums text-right text-on-surface">
                      {s.conductAvg}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ClassDetailPagination
            page={studentPage}
            pageSize={STUDENT_PAGE_SIZE}
            total={filteredRoster.length}
            onPageChange={setStudentPage}
            noun="học sinh"
            zeroStateMessage={studentZeroMessage}
          />
        </div>
      ) : (
        <div role="tabpanel">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Học sinh
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Tiêu chí
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider text-center">
                    Điểm
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Người ghi
                  </th>
                  <th className="px-5 py-3 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {conductSlice.map((r) => {
                  const reward = r.type === 'reward'
                  const stClass = STATUS_BADGE[r.status] ?? STATUS_BADGE.pending
                  return (
                    <tr key={r.id} className="hover:bg-surface-container-low/30 transition-colors align-top">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="text-xs font-mono text-on-surface-variant">{r.id}</span>
                        <p className="text-sm text-on-surface mt-0.5 tabular-nums">{formatWhen(r.at)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-on-surface">{r.studentName}</p>
                        <p className="text-xs font-mono text-on-surface-variant mt-0.5">{r.studentCode}</p>
                      </td>
                      <td className="px-5 py-3 min-w-[180px]">
                        <p className="text-sm font-medium text-on-surface leading-snug">{r.ruleName}</p>
                        <p className="text-[11px] text-on-surface-variant font-mono mt-1">
                          {r.ruleCode} · {r.category}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex min-w-[2.75rem] justify-center px-2 py-1 rounded-lg text-sm font-extrabold tabular-nums ${
                            reward
                              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
                              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200'
                          }`}
                        >
                          {reward ? '+' : ''}
                          {r.points}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-on-surface">{r.recordedBy}</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{sourceLabel(r.source)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${stClass}`}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <ClassDetailPagination
            page={conductPage}
            pageSize={CONDUCT_PAGE_SIZE}
            total={filteredConductLogs.length}
            onPageChange={setConductPage}
            noun="bản ghi"
            zeroStateMessage={conductZeroMessage}
          />
        </div>
      )}
    </section>
  )
}
