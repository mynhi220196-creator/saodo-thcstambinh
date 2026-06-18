import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import ConductImageLightbox, { ConductRecordImageStrip } from '../../components/ConductImageLightbox.jsx'
import { subscribeClassDoc, subscribeStudentsByClassId } from '../../lib/organizationFirestore.js'
import { subscribeConductClassRecordsByClassId } from '../../lib/conductClassRecordsFirestore.js'
import {
  raiseConductDispute,
  subscribeConductScoreRecordsByClassId,
} from '../../lib/conductScoreRecordsFirestore.js'
import { notifyDisputeRaised } from '../../lib/notificationsFirestore.js'
import DateInputVN from '../../components/DateInputVN.jsx'
import ConductDisputeModal from './ConductDisputeModal.jsx'
import { formatDateTimeVN } from '../../lib/dateFormat.js'
import PortalTablePagination from './PortalTablePagination.jsx'

const TAB_STUDENTS = 'students'
const PAGE_SIZE_STUDENTS = 15
const PAGE_SIZE_CONDUCT = 15
const TAB_CONDUCT = 'conduct'

const formatWhen = formatDateTimeVN

/** YYYY-MM-DD theo giờ địa phương (để khớp `<input type="date">`). */
function localDayKey(ms) {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Chuỗi YYYY-MM-DD so sánh được theo thứ tự từ điển. */
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

/** Cột «Ai ghi nhận»: tên hiển thị + UID (Firestore) khi có. */
function RecorderColumnCell({ r }) {
  const name = String(r?.recorded_by_name ?? '').trim()
  const uid = String(r?.recorded_by ?? '').trim()
  if (!name && !uid) {
    return <td className="px-4 py-3 text-on-surface-variant text-sm align-top">—</td>
  }
  return (
    <td className="px-4 py-3 align-top min-w-[148px] max-w-[240px]">
      {name ? (
        <>
          <p className="font-semibold text-on-surface text-sm leading-snug break-words">{name}</p>
          {uid ? (
            <p className="text-[11px] font-mono text-on-surface-variant mt-1 truncate" title={uid}>
              {uid}
            </p>
          ) : null}
        </>
      ) : (
        <div>
          <p className="font-mono text-xs text-on-surface truncate" title={uid}>
            {uid}
          </p>
          <p className="text-[11px] text-on-surface-variant mt-1 leading-snug max-w-[14rem]">
            Chỉ lưu UID — lúc ghi nhận chưa có họ tên trên hồ sơ hoặc phiên đăng nhập.
          </p>
        </div>
      )}
    </td>
  )
}

function tabBtnClass(active) {
  return [
    'inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 whitespace-nowrap shrink-0',
    active
      ? 'border-emerald-600 bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100 dark:border-emerald-500'
      : 'border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
  ].join(' ')
}

function normalizeForSearch(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function TeacherClassStudentsPage() {
  const { classId } = useParams()
  const { user, profile } = useAuth()
  const uid = user?.id ?? ''
  const disputerName = useMemo(() => {
    const fn = String(profile?.full_name ?? '').trim()
    if (fn) return fn
    return String(user?.displayName ?? user?.email ?? '').trim()
  }, [profile?.full_name, user?.displayName, user?.email])

  const [classData, setClassData] = useState(null)
  const [classLoadDone, setClassLoadDone] = useState(false)
  const [classError, setClassError] = useState('')

  const [students, setStudents] = useState([])
  const [tab, setTab] = useState(TAB_STUDENTS)
  const [conductDateFrom, setConductDateFrom] = useState('')
  const [conductDateTo, setConductDateTo] = useState('')
  const [scoreRecords, setScoreRecords] = useState([])
  const [classRecords, setClassRecords] = useState([])
  const [conductLoadError, setConductLoadError] = useState('')
  const [pageStudents, setPageStudents] = useState(1)
  const [pageConduct, setPageConduct] = useState(1)
  const [imgLightbox, setImgLightbox] = useState({ open: false, urls: [], startIndex: 0 })
  /** `<details defaultOpen>` không ổn định với React — dùng controlled, mặc định mở. */
  const [conductStatsOpen, setConductStatsOpen] = useState(true)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [conductSearchQuery, setConductSearchQuery] = useState('')
  /** Khiếu nại (GVCN): bản ghi đang khiếu nại + trạng thái gửi + thông báo. */
  const [disputeRecord, setDisputeRecord] = useState(null)
  const [disputeBusy, setDisputeBusy] = useState(false)
  const [disputeToast, setDisputeToast] = useState('')

  const handleSubmitDispute = useCallback(
    async (reason) => {
      if (!disputeRecord) return
      setDisputeBusy(true)
      try {
        await raiseConductDispute(disputeRecord.id, {
          reason,
          disputed_by: uid,
          disputed_by_name: disputerName,
        })
        notifyDisputeRaised({
          classCode: disputeRecord.class_code,
          studentName: disputeRecord.student_name,
          createdBy: uid,
          createdByName: disputerName,
        }).catch(() => {})
        setDisputeRecord(null)
        setDisputeToast('Đã gửi khiếu nại lên Ban giám hiệu để phân xử.')
        window.setTimeout(() => setDisputeToast(''), 5000)
      } catch (e) {
        window.alert(e?.message ?? 'Không gửi được khiếu nại.')
      } finally {
        setDisputeBusy(false)
      }
    },
    [disputeRecord, uid, disputerName],
  )

  const openConductImages = useCallback((urls, startIndex = 0) => {
    const list = Array.isArray(urls) ? urls.map((u) => String(u ?? '').trim()).filter(Boolean) : []
    if (!list.length) return
    setImgLightbox({ open: true, urls: list, startIndex })
  }, [])

  const closeConductImages = useCallback(() => {
    setImgLightbox({ open: false, urls: [], startIndex: 0 })
  }, [])

  useEffect(() => {
    if (!classId) {
      setClassData(null)
      setClassLoadDone(true)
      return undefined
    }
    setClassLoadDone(false)
    setClassError('')
    return subscribeClassDoc(
      classId,
      (doc) => {
        setClassData(doc)
        setClassLoadDone(true)
      },
      (e) => {
        setClassError(e?.message ?? 'Không tải được lớp.')
        setClassLoadDone(true)
      },
    )
  }, [classId])

  const allowed = useMemo(() => {
    if (!classLoadDone || !classData) return false
    if (classData.is_deleted === true || classData.is_active === false) return false
    return classData.homeroom_teacher_id === uid
  }, [classLoadDone, classData, uid])

  useEffect(() => {
    if (!classId || !allowed) {
      setStudents([])
      return undefined
    }
    return subscribeStudentsByClassId(
      classId,
      (list) => setStudents(list),
      () => {},
    )
  }, [classId, allowed])

  useEffect(() => {
    if (!classId || !allowed) {
      setScoreRecords([])
      setClassRecords([])
      setConductLoadError('')
      return undefined
    }
    setConductLoadError('')
    const unsub1 = subscribeConductScoreRecordsByClassId(
      classId,
      setScoreRecords,
      (e) => setConductLoadError(e?.message ?? 'Không tải được bản ghi cá nhân.'),
    )
    const unsub2 = subscribeConductClassRecordsByClassId(
      classId,
      setClassRecords,
      (e) => setConductLoadError((prev) => prev || e?.message || 'Không tải được điểm lớp.'),
    )
    return () => {
      unsub1()
      unsub2()
    }
  }, [classId, allowed])

  const activeStudents = useMemo(
    () => students.filter((s) => s.is_active !== false && s.is_deleted !== true),
    [students],
  )

  const studentsFiltered = useMemo(() => {
    const q = normalizeForSearch(studentSearchQuery)
    if (!q) return activeStudents
    return activeStudents.filter((s) => {
      const code = normalizeForSearch(s.student_code)
      const name = normalizeForSearch(s.full_name)
      const grade = s.grade != null ? normalizeForSearch(`khoi ${s.grade}`) : ''
      return code.includes(q) || name.includes(q) || grade.includes(q)
    })
  }, [activeStudents, studentSearchQuery])

  const conductRowsMerged = useMemo(() => {
    const rows = []
    for (const r of scoreRecords) {
      if (r.record_scope === 'class') continue
      rows.push({
        kind: 'individual',
        key: `s-${r.id}`,
        t: r._createdMs,
        r,
      })
    }
    for (const r of classRecords) {
      rows.push({
        kind: 'class_level',
        key: `c-${r.id}`,
        t: r._createdMs,
        r,
      })
    }
    rows.sort((a, b) => b.t - a.t)
    return rows
  }, [scoreRecords, classRecords])

  const conductRangeActive = Boolean(conductDateFrom.trim() || conductDateTo.trim())

  const conductRowsFiltered = useMemo(() => {
    const from = conductDateFrom.trim()
    const to = conductDateTo.trim()
    if (!from && !to) return conductRowsMerged
    return conductRowsMerged.filter((row) => {
      if (!row.t) return false
      const dayKey = localDayKey(row.t)
      return dayInRange(dayKey, from, to)
    })
  }, [conductRowsMerged, conductDateFrom, conductDateTo])

  const conductRowsSearchFiltered = useMemo(() => {
    const q = normalizeForSearch(conductSearchQuery)
    if (!q) return conductRowsFiltered
    return conductRowsFiltered.filter((row) => {
      const r = row.r
      const chunks = []
      if (row.t) chunks.push(formatWhen(row.t))
      if (row.kind === 'class_level') {
        chunks.push('diem lop', r.criterion_name, r.criterion_code, r.recorded_by_name, r.recorded_by)
      } else {
        chunks.push(r.student_name, r.criterion_name, r.criterion_code, r.recorded_by_name, r.recorded_by)
      }
      if (r.points != null) chunks.push(String(r.points))
      const blob = normalizeForSearch(chunks.filter(Boolean).join(' '))
      return blob.includes(q)
    })
  }, [conductRowsFiltered, conductSearchQuery])

  useEffect(() => {
    setPageStudents(1)
    setPageConduct(1)
    setConductStatsOpen(true)
    setStudentSearchQuery('')
    setConductSearchQuery('')
  }, [classId])

  useEffect(() => {
    setPageConduct(1)
  }, [conductDateFrom, conductDateTo])

  useEffect(() => {
    setPageStudents(1)
  }, [studentSearchQuery])

  useEffect(() => {
    setPageConduct(1)
  }, [conductSearchQuery])

  const totalPagesStudents = Math.max(1, Math.ceil(studentsFiltered.length / PAGE_SIZE_STUDENTS))
  const safePageStudents = Math.min(Math.max(1, pageStudents), totalPagesStudents)
  const studentSliceStart = (safePageStudents - 1) * PAGE_SIZE_STUDENTS
  const pagedStudents = studentsFiltered.slice(studentSliceStart, studentSliceStart + PAGE_SIZE_STUDENTS)
  const studentFrom = studentsFiltered.length === 0 ? 0 : studentSliceStart + 1
  const studentTo = Math.min(safePageStudents * PAGE_SIZE_STUDENTS, studentsFiltered.length)

  useEffect(() => {
    setPageStudents((p) => Math.min(p, totalPagesStudents))
  }, [totalPagesStudents])

  const totalPagesConduct = Math.max(1, Math.ceil(conductRowsSearchFiltered.length / PAGE_SIZE_CONDUCT))
  const safePageConduct = Math.min(Math.max(1, pageConduct), totalPagesConduct)
  const conductSliceStart = (safePageConduct - 1) * PAGE_SIZE_CONDUCT
  const pagedConductRows = conductRowsSearchFiltered.slice(conductSliceStart, conductSliceStart + PAGE_SIZE_CONDUCT)
  const conductFrom = conductRowsSearchFiltered.length === 0 ? 0 : conductSliceStart + 1
  const conductTo = Math.min(safePageConduct * PAGE_SIZE_CONDUCT, conductRowsSearchFiltered.length)

  useEffect(() => {
    setPageConduct((p) => Math.min(p, totalPagesConduct))
  }, [totalPagesConduct])

  const conductRangeSummary = useMemo(() => {
    const from = conductDateFrom.trim()
    const to = conductDateTo.trim()
    if (!from && !to) return null
    if (from && to) {
      const lo = from <= to ? from : to
      const hi = from <= to ? to : from
      if (lo === hi) return lo
      return `${lo} → ${hi}`
    }
    if (from) return `từ ${from}`
    return `đến ${to}`
  }, [conductDateFrom, conductDateTo])

  const conductDetailStats = useMemo(() => {
    const rows = conductRowsFiltered
    let count = 0
    let sumReward = 0
    let sumPenaltyMag = 0
    let individualCount = 0
    let classCount = 0
    let indReward = 0
    let indPenalty = 0
    let classReward = 0
    let classPenalty = 0

    const byCriterion = new Map()
    const byStudent = new Map()

    for (const row of rows) {
      count++
      const p = Number(row.r.points) || 0
      const isPen = row.r.type === 'penalty'
      const plus = isPen ? 0 : p
      const minus = isPen ? Math.abs(p) : 0

      sumReward += plus
      sumPenaltyMag += minus

      const isClass = row.kind === 'class_level'
      if (isClass) {
        classCount++
        classReward += plus
        classPenalty += minus
      } else {
        individualCount++
        indReward += plus
        indPenalty += minus
        const sk = String(row.r.student_id || '').trim() || `name:${row.r.student_name || '—'}`
        if (!byStudent.has(sk)) {
          byStudent.set(sk, {
            key: sk,
            name: row.r.student_name || '—',
            count: 0,
            plus: 0,
            minus: 0,
          })
        }
        const st = byStudent.get(sk)
        st.count++
        st.plus += plus
        st.minus += minus
      }

      const ck = String(row.r.criterion_id || '').trim() || row.r.criterion_code || row.r.criterion_name || '—'
      if (!byCriterion.has(ck)) {
        byCriterion.set(ck, {
          key: ck,
          name: row.r.criterion_name || '—',
          code: row.r.criterion_code || '',
          count: 0,
          plus: 0,
          minus: 0,
        })
      }
      const c = byCriterion.get(ck)
      c.count++
      c.plus += plus
      c.minus += minus
    }

    const criterionRows = [...byCriterion.values()].sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return (a.name || '').localeCompare(b.name || '', 'vi')
    })
    const studentRows = [...byStudent.values()].sort((a, b) => {
      const ba = a.plus - a.minus
      const bb = b.plus - b.minus
      if (bb !== ba) return bb - ba
      return (a.name || '').localeCompare(b.name || '', 'vi')
    })

    return {
      count,
      sumReward,
      sumPenaltyMag,
      balance: sumReward - sumPenaltyMag,
      individualCount,
      classCount,
      indReward,
      indPenalty,
      classReward,
      classPenalty,
      criterionRows,
      studentRows,
    }
  }, [conductRowsFiltered])

  if (!classId) {
    return null
  }

  return (
    <div className="w-full min-w-0 flex flex-col h-full">
      <nav
        className="flex flex-wrap items-center gap-1 text-sm text-on-surface-variant mb-4 shrink-0"
        aria-label="Breadcrumb"
      >
        <Link
          to="/giao-vien/lop-hoc"
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Lớp của tôi
        </Link>
        <span className="material-symbols-outlined text-base text-outline opacity-60">chevron_right</span>
        <span className="font-bold text-on-surface truncate min-w-0">
          {allowed && classData
            ? `Lớp ${classData.code ?? '—'} · ${classData.school_year ?? '—'}`
            : 'Chi tiết lớp'}
        </span>
      </nav>

      {!classLoadDone ? (
        <p className="text-sm text-on-surface-variant shrink-0">Đang tải…</p>
      ) : null}

      {classError ? (
        <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3 shrink-0">{classError}</p>
      ) : null}

      {classLoadDone && !classError && !classData ? (
        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low p-6 text-center shrink-0">
          <p className="font-semibold text-on-surface">Không tìm thấy lớp.</p>
          <Link to="/giao-vien/lop-hoc" className="inline-block mt-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            ← Quay lại danh sách lớp
          </Link>
        </div>
      ) : null}

      {classLoadDone && classData && !allowed ? (
        <div className="rounded-2xl border border-error/20 bg-error-container/15 p-6 text-center shrink-0">
          <p className="font-semibold text-error">Bạn không có quyền xem lớp này (không phải GVCN).</p>
          <Link to="/giao-vien/lop-hoc" className="inline-block mt-4 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            ← Quay lại danh sách lớp
          </Link>
        </div>
      ) : null}

      {allowed && classData ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4 shrink-0">
            <div className="min-w-0">
              <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-[#0d5c3f] dark:text-emerald-100">
                Lớp {classData.code ?? '—'}
              </h1>
              {classData.name ? (
                <p className="text-on-surface-variant text-sm mt-1">{classData.name}</p>
              ) : null}
              <p className="text-xs text-on-surface-variant mt-1.5">
                Năm học <span className="font-semibold">{classData.school_year ?? '—'}</span>
                {classData.room ? (
                  <>
                    {' '}
                    · Phòng <span className="font-semibold">{classData.room}</span>
                  </>
                ) : null}
              </p>
            </div>
            <div
              className="flex flex-nowrap items-center gap-2 shrink-0 overflow-x-auto pb-0.5 -mx-0.5 px-0.5 md:justify-end"
              role="tablist"
              aria-label="Chi tiết lớp"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === TAB_STUDENTS}
                className={tabBtnClass(tab === TAB_STUDENTS)}
                onClick={() => setTab(TAB_STUDENTS)}
              >
                <span className="material-symbols-outlined text-lg sm:text-[22px] shrink-0">groups</span>
                <span>
                  Danh sách học sinh
                  <span className="font-extrabold tabular-nums opacity-80"> ({activeStudents.length})</span>
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === TAB_CONDUCT}
                className={tabBtnClass(tab === TAB_CONDUCT)}
                onClick={() => setTab(TAB_CONDUCT)}
              >
                <span className="material-symbols-outlined text-lg sm:text-[22px] shrink-0">history_edu</span>
                <span>
                  Ghi nhận tác phong
                  <span className="font-extrabold tabular-nums opacity-80"> ({conductRowsMerged.length})</span>
                </span>
              </button>
            </div>
          </div>

          <details className="group mt-6 rounded-xl border border-outline-variant/15 bg-surface-container-low/25 shrink-0 overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-container-high/30 transition-colors [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant">Lọc theo khoảng ngày (tác phong)</p>
                {conductRangeActive && conductRangeSummary ? (
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200 mt-1 tabular-nums">
                    Đang áp dụng: {conductRangeSummary}
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant mt-1">Mở để chọn từ ngày / đến ngày (ảnh hưởng thống kê & tab ghi nhận)</p>
                )}
              </div>
              <span
                className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              >
                expand_more
              </span>
            </summary>
            <div className="border-t border-outline-variant/10 px-4 py-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4">
              <fieldset className="flex flex-col gap-2 border-0 p-0 m-0 w-full sm:w-auto">
                <legend className="sr-only">Chọn khoảng ngày</legend>
                <div className="flex flex-wrap items-end gap-3 sm:gap-4">
                  <div className="flex min-w-[11rem] flex-col gap-1 shrink-0">
                    <label htmlFor="conduct-date-from" className="text-[11px] font-bold text-on-surface-variant">
                      Từ ngày
                    </label>
                    <DateInputVN id="conduct-date-from" value={conductDateFrom} onChange={setConductDateFrom} />
                  </div>
                  <div className="flex min-w-[11rem] flex-col gap-1 shrink-0">
                    <label htmlFor="conduct-date-to" className="text-[11px] font-bold text-on-surface-variant">
                      Đến ngày
                    </label>
                    <DateInputVN id="conduct-date-to" value={conductDateTo} onChange={setConductDateTo} />
                  </div>
                </div>
              </fieldset>
              {conductRangeActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setConductDateFrom('')
                    setConductDateTo('')
                  }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-sm font-bold border-2 border-outline-variant/30 text-on-surface hover:bg-surface-container-high self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                  Xóa lọc
                </button>
              ) : null}
            </div>
          </details>

          {conductLoadError ? (
            <p className="mt-4 text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3 shrink-0">
              {conductLoadError}
            </p>
          ) : null}

          {tab === TAB_STUDENTS ? (
            <div className="mt-4 flex-1 min-h-0 flex flex-col gap-4 min-h-0">
              <section
                className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden shrink-0"
                aria-labelledby="conduct-stats-heading"
              >
                <details
                  className="group/stats-outer"
                  open={conductStatsOpen}
                  onToggle={(e) => setConductStatsOpen(e.currentTarget.open)}
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 sm:px-5 py-3 bg-teal-50/60 dark:bg-teal-950/25 hover:bg-teal-100/70 dark:hover:bg-teal-950/40 transition-colors [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0 flex-1">
                      <h2
                        id="conduct-stats-heading"
                        className="font-headline text-sm font-extrabold text-on-surface-variant uppercase tracking-wide"
                      >
                        Thống kê điểm chi tiết
                      </h2>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Áp dụng cho các bản ghi trong phạm vi đã chọn
                        {conductRangeActive ? ` (${conductRangeSummary})` : ' (toàn thời gian)'}.
                      </p>
                    </div>
                    <span
                      className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5 transition-transform duration-200 group-open/stats-outer:rotate-180"
                      aria-hidden
                    >
                      expand_more
                    </span>
                  </summary>

                  <div className="border-t border-outline-variant/10">
                    <div className="p-4 sm:p-5 space-y-4">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="rounded-xl border border-outline-variant/15 bg-surface-container-low/50 p-4">
                          <p className="text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">Số bản ghi</p>
                          <p className="text-2xl font-extrabold tabular-nums text-on-surface mt-1">{conductDetailStats.count}</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                          <p className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-900/80 dark:text-emerald-200/90">
                            Tổng điểm cộng
                          </p>
                          <p className="text-2xl font-extrabold tabular-nums text-emerald-800 dark:text-emerald-200 mt-1">
                            +{conductDetailStats.sumReward}
                          </p>
                        </div>
                        <div className="rounded-xl border border-rose-200/60 dark:border-rose-800/40 bg-rose-50/40 dark:bg-rose-950/20 p-4">
                          <p className="text-[11px] font-extrabold uppercase tracking-wide text-rose-900/80 dark:text-rose-200/90">
                            Tổng điểm trừ
                          </p>
                          <p className="text-2xl font-extrabold tabular-nums text-rose-800 dark:text-rose-200 mt-1">
                            −{conductDetailStats.sumPenaltyMag}
                          </p>
                        </div>
                        <div className="rounded-xl border border-outline-variant/15 bg-primary-fixed/15 dark:bg-primary-container/15 p-4">
                          <p className="text-[11px] font-extrabold uppercase tracking-wide text-on-surface-variant">Cân (+ − −)</p>
                          <p
                            className={`text-2xl font-extrabold tabular-nums mt-1 ${
                              conductDetailStats.balance >= 0
                                ? 'text-emerald-800 dark:text-emerald-200'
                                : 'text-rose-800 dark:text-rose-200'
                            }`}
                          >
                            {conductDetailStats.balance > 0 ? '+' : ''}
                            {conductDetailStats.balance}
                          </p>
                        </div>
                      </div>

                      <details className="group/stats-inner rounded-xl border border-outline-variant/15 bg-surface-container-low/30 overflow-hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-surface-container-high/40 transition-colors [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-on-surface">Chi tiết phân tích</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Cá nhân / điểm lớp · bảng theo tiêu chí & học sinh
                        </p>
                      </div>
                      <span
                        className="material-symbols-outlined text-on-surface-variant shrink-0 transition-transform duration-200 group-open/stats-inner:rotate-180"
                        aria-hidden
                      >
                        expand_more
                      </span>
                    </summary>
                    <div className="border-t border-outline-variant/10 px-4 pb-4 pt-3 space-y-5">
                      {conductDetailStats.count === 0 ? (
                        <p className="text-sm text-center text-on-surface-variant py-4">
                          Chưa có dữ liệu để thống kê chi tiết trong phạm vi đã chọn.
                        </p>
                      ) : (
                        <>
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 px-4 py-3">
                              <p className="text-xs font-extrabold uppercase text-on-surface-variant tracking-wide mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">person</span>
                                Cá nhân
                              </p>
                              <ul className="space-y-1 text-on-surface-variant tabular-nums">
                                <li>
                                  <span className="font-medium text-on-surface">{conductDetailStats.individualCount}</span> bản ghi · cộng{' '}
                                  <span className="font-bold text-emerald-700 dark:text-emerald-300">+{conductDetailStats.indReward}</span> · trừ{' '}
                                  <span className="font-bold text-rose-700 dark:text-rose-300">−{conductDetailStats.indPenalty}</span>
                                </li>
                              </ul>
                            </div>
                            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest/80 px-4 py-3">
                              <p className="text-xs font-extrabold uppercase text-on-surface-variant tracking-wide mb-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">diversity_3</span>
                                Điểm lớp
                              </p>
                              <ul className="space-y-1 text-on-surface-variant tabular-nums">
                                <li>
                                  <span className="font-medium text-on-surface">{conductDetailStats.classCount}</span> bản ghi · cộng{' '}
                                  <span className="font-bold text-emerald-700 dark:text-emerald-300">+{conductDetailStats.classReward}</span> · trừ{' '}
                                  <span className="font-bold text-rose-700 dark:text-rose-300">−{conductDetailStats.classPenalty}</span>
                                </li>
                              </ul>
                            </div>
                          </div>

                          <div className="grid xl:grid-cols-2 gap-5">
                            <div className="min-w-0">
                              <h3 className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant mb-2">Theo tiêu chí</h3>
                              <div className="rounded-xl border border-outline-variant/10 overflow-hidden max-h-64 overflow-y-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                  <thead className="sticky top-0 bg-emerald-50/95 dark:bg-emerald-950/50 z-10">
                                    <tr className="text-[11px] font-extrabold uppercase text-on-surface-variant">
                                      <th className="px-3 py-2 border-b border-outline-variant/10">Tiêu chí</th>
                                      <th className="px-3 py-2 border-b border-outline-variant/10 text-center w-14">Lần</th>
                                      <th className="px-3 py-2 border-b border-outline-variant/10 text-right w-16">+</th>
                                      <th className="px-3 py-2 border-b border-outline-variant/10 text-right w-16">−</th>
                                      <th className="px-3 py-2 border-b border-outline-variant/10 text-right w-16">Cân</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-outline-variant/10">
                                    {conductDetailStats.criterionRows.map((c) => {
                                      const bal = c.plus - c.minus
                                      return (
                                        <tr key={c.key} className="hover:bg-surface-container-low/40">
                                          <td className="px-3 py-2 align-top">
                                            <span className="font-medium text-on-surface leading-snug">{c.name}</span>
                                            {c.code ? (
                                              <span className="block text-[11px] font-mono text-on-surface-variant mt-0.5">{c.code}</span>
                                            ) : null}
                                          </td>
                                          <td className="px-3 py-2 text-center tabular-nums font-semibold text-on-surface">{c.count}</td>
                                          <td className="px-3 py-2 text-right tabular-nums text-emerald-700 dark:text-emerald-300 font-bold">
                                            {c.plus > 0 ? `+${c.plus}` : '—'}
                                          </td>
                                          <td className="px-3 py-2 text-right tabular-nums text-rose-700 dark:text-rose-300 font-bold">
                                            {c.minus > 0 ? `−${c.minus}` : '—'}
                                          </td>
                                          <td
                                            className={`px-3 py-2 text-right tabular-nums font-extrabold ${
                                              bal >= 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'
                                            }`}
                                          >
                                            {bal > 0 ? '+' : ''}
                                            {bal}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant mb-2">Theo học sinh</h3>
                              {conductDetailStats.studentRows.length === 0 ? (
                                <p className="text-sm text-on-surface-variant rounded-xl border border-outline-variant/10 px-4 py-6 text-center">
                                  Không có bản ghi cá nhân trong phạm vi này.
                                </p>
                              ) : (
                                <div className="rounded-xl border border-outline-variant/10 overflow-hidden max-h-64 overflow-y-auto">
                                  <table className="w-full text-sm text-left border-collapse">
                                    <thead className="sticky top-0 bg-emerald-50/95 dark:bg-emerald-950/50 z-10">
                                      <tr className="text-[11px] font-extrabold uppercase text-on-surface-variant">
                                        <th className="px-3 py-2 border-b border-outline-variant/10">Họ tên</th>
                                        <th className="px-3 py-2 border-b border-outline-variant/10 text-center w-14">Lần</th>
                                        <th className="px-3 py-2 border-b border-outline-variant/10 text-right w-16">+</th>
                                        <th className="px-3 py-2 border-b border-outline-variant/10 text-right w-16">−</th>
                                        <th className="px-3 py-2 border-b border-outline-variant/10 text-right w-16">Cân</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10">
                                      {conductDetailStats.studentRows.map((s) => {
                                        const bal = s.plus - s.minus
                                        return (
                                          <tr key={s.key} className="hover:bg-surface-container-low/40">
                                            <td className="px-3 py-2 font-medium text-on-surface">{s.name}</td>
                                            <td className="px-3 py-2 text-center tabular-nums font-semibold text-on-surface">{s.count}</td>
                                            <td className="px-3 py-2 text-right tabular-nums text-emerald-700 dark:text-emerald-300 font-bold">
                                              {s.plus > 0 ? `+${s.plus}` : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums text-rose-700 dark:text-rose-300 font-bold">
                                              {s.minus > 0 ? `−${s.minus}` : '—'}
                                            </td>
                                            <td
                                              className={`px-3 py-2 text-right tabular-nums font-extrabold ${
                                                bal >= 0 ? 'text-emerald-800 dark:text-emerald-200' : 'text-rose-800 dark:text-rose-200'
                                              }`}
                                            >
                                              {bal > 0 ? '+' : ''}
                                              {bal}
                                            </td>
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                      </details>
                    </div>
                  </div>
                </details>
              </section>

              <div className="flex-1 min-h-0 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 sm:px-5 py-3 border-b border-outline-variant/10 bg-emerald-50/50 dark:bg-emerald-950/20 shrink-0 space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <span className="text-sm font-extrabold text-on-surface-variant uppercase tracking-wide">Danh sách</span>
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-200 tabular-nums">
                    {studentSearchQuery.trim() && studentsFiltered.length !== activeStudents.length
                      ? `${studentsFiltered.length} / ${activeStudents.length} học sinh`
                      : `${activeStudents.length} học sinh`}
                  </span>
                </div>
                <div className="relative">
                  <span
                    className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none"
                    aria-hidden
                  >
                    search
                  </span>
                  <input
                    type="search"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Tìm mã HS, họ tên, khối…"
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/35"
                    aria-label="Tìm trong danh sách học sinh"
                  />
                </div>
              </div>
              <div className="overflow-x-auto flex-1 min-h-0">
                <table className="w-full min-w-[720px] table-fixed text-sm border-collapse">
                  <colgroup>
                    <col className="w-[8%]" />
                    <col className="w-[18%]" />
                    <col className="w-[54%]" />
                    <col className="w-[20%]" />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-on-surface-variant bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-outline-variant/10">
                      <th className="px-4 py-3.5 align-middle text-center">STT</th>
                      <th className="px-4 py-3.5 align-middle">Mã HS</th>
                      <th className="px-4 py-3.5 align-middle">Họ tên</th>
                      <th className="px-4 py-3.5 align-middle text-center">Khối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-on-surface-variant">
                          Chưa có học sinh trong lớp hoặc đang tải…
                        </td>
                      </tr>
                    ) : studentsFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-10 text-center text-on-surface-variant">
                          Không có học sinh nào khớp «{studentSearchQuery.trim()}». Thử từ khóa khác hoặc xóa ô tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      pagedStudents.map((s, i) => (
                        <tr
                          key={s.id}
                          className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50"
                        >
                          <td className="px-4 py-3 align-middle text-center text-on-surface-variant font-medium">
                            {studentSliceStart + i + 1}
                          </td>
                          <td className="px-4 py-3 align-middle font-mono text-xs truncate" title={s.student_code ?? ''}>
                            {s.student_code ?? '—'}
                          </td>
                          <td className="px-4 py-3 align-middle font-semibold truncate" title={s.full_name ?? ''}>
                            {s.full_name ?? '—'}
                          </td>
                          <td className="px-4 py-3 align-middle text-center text-on-surface-variant">
                            {s.grade != null ? `Khối ${s.grade}` : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <PortalTablePagination
                from={studentFrom}
                to={studentTo}
                total={studentsFiltered.length}
                page={pageStudents}
                totalPages={totalPagesStudents}
                onPageChange={setPageStudents}
                noun="học sinh"
              />
            </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-4 pb-4">
              <div className="flex flex-wrap justify-end shrink-0">
                <Link
                  to="/giao-vien/tac-phong"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">add_circle</span>
                  Ghi nhận mới
                </Link>
              </div>

              <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 sm:px-5 py-3 border-b border-outline-variant/10 bg-emerald-50/50 dark:bg-emerald-950/20 shrink-0 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className="text-sm font-extrabold text-on-surface-variant uppercase tracking-wide">
                      {conductRangeActive
                        ? `Bản ghi ${conductRangeSummary}${
                            conductSearchQuery.trim() && conductRowsSearchFiltered.length !== conductRowsFiltered.length
                              ? ` (${conductRowsSearchFiltered.length}/${conductRowsFiltered.length})`
                              : ` (${conductRowsFiltered.length})`
                          }`
                        : conductSearchQuery.trim() && conductRowsSearchFiltered.length !== conductRowsFiltered.length
                          ? `Kết quả (${conductRowsSearchFiltered.length}/${conductRowsFiltered.length})`
                          : `Tất cả bản ghi (${conductRowsFiltered.length})`}
                    </span>
                  </div>
                  <div className="relative">
                    <span
                      className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none"
                      aria-hidden
                    >
                      search
                    </span>
                    <input
                      type="search"
                      value={conductSearchQuery}
                      onChange={(e) => setConductSearchQuery(e.target.value)}
                      placeholder="Tìm thời gian, học sinh, điểm lớp, tiêu chí, người ghi…"
                      className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/35"
                      aria-label="Tìm trong bản ghi tác phong"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-sm border-collapse text-left">
                    <thead>
                      <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-on-surface-variant bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-outline-variant/10">
                        <th className="px-4 py-3 align-middle whitespace-nowrap">Thời gian</th>
                        <th className="px-4 py-3 align-middle">Đối tượng</th>
                        <th className="px-4 py-3 align-middle min-w-[160px]">Tiêu chí</th>
                        <th className="px-4 py-3 align-middle text-center">Điểm</th>
                        <th className="px-4 py-3 align-middle whitespace-normal max-w-[13rem] leading-snug">
                          <span className="block text-on-surface">Người ghi nhận</span>
                          <span className="block text-[10px] font-bold normal-case tracking-normal text-on-surface-variant mt-0.5">
                            Tên · mã người ghi (UID)
                          </span>
                        </th>
                        <th className="px-4 py-3 align-middle w-[148px]">Ảnh</th>
                        <th className="px-4 py-3 align-middle text-center w-[120px]">Khiếu nại</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {conductRowsFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">
                            {conductRowsMerged.length === 0
                              ? 'Chưa có bản ghi tác phong cho lớp này.'
                              : 'Không có bản ghi trong khoảng ngày đã chọn.'}
                          </td>
                        </tr>
                      ) : conductRowsSearchFiltered.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-on-surface-variant">
                            Không có bản ghi nào khớp «{conductSearchQuery.trim()}». Thử từ khóa khác hoặc xóa ô tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        pagedConductRows.map((row) =>
                          row.kind === 'class_level' ? (
                            <tr key={row.key} className="hover:bg-surface-container-low/40 align-top">
                              <td className="px-4 py-3 whitespace-nowrap tabular-nums text-on-surface-variant text-xs">
                                {formatWhen(row.t)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center gap-1 font-bold text-teal-800 dark:text-teal-200">
                                  <span className="material-symbols-outlined text-base">diversity_3</span>
                                  Điểm lớp
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-on-surface leading-snug">{row.r.criterion_name}</p>
                                {row.r.criterion_code ? (
                                  <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">{row.r.criterion_code}</p>
                                ) : null}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex min-w-[2.5rem] justify-center px-2 py-1 rounded-lg text-sm font-extrabold tabular-nums ${
                                    row.r.type === 'penalty'
                                      ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                                      : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                  }`}
                                >
                                  {row.r.points > 0 ? `+${row.r.points}` : row.r.points}
                                </span>
                              </td>
                              <RecorderColumnCell r={row.r} />
                              <td className="px-4 py-3 align-middle">
                                <ConductRecordImageStrip urls={row.r.image_urls} onOpen={openConductImages} />
                              </td>
                              <td className="px-4 py-3 align-middle text-center text-on-surface-variant text-xs">—</td>
                            </tr>
                          ) : (
                            <tr key={row.key} className="hover:bg-surface-container-low/40 align-top">
                              <td className="px-4 py-3 whitespace-nowrap tabular-nums text-on-surface-variant text-xs">
                                {formatWhen(row.t)}
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-semibold text-on-surface">{row.r.student_name || '—'}</p>
                              </td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-on-surface leading-snug">{row.r.criterion_name}</p>
                                {row.r.criterion_code ? (
                                  <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">{row.r.criterion_code}</p>
                                ) : null}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span
                                  className={`inline-flex min-w-[2.5rem] justify-center px-2 py-1 rounded-lg text-sm font-extrabold tabular-nums ${
                                    row.r.type === 'penalty'
                                      ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                                      : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                  }`}
                                >
                                  {row.r.points > 0 ? `+${row.r.points}` : row.r.points}
                                </span>
                              </td>
                              <RecorderColumnCell r={row.r} />
                              <td className="px-4 py-3 align-middle">
                                <ConductRecordImageStrip urls={row.r.image_urls} onOpen={openConductImages} />
                              </td>
                              <td className="px-4 py-3 align-middle text-center">
                                {row.r.type !== 'penalty' ? (
                                  <span className="text-on-surface-variant text-xs">—</span>
                                ) : row.r.dispute_status === 'open' ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                                    title={row.r.dispute_reason || ''}
                                  >
                                    <span className="material-symbols-outlined text-sm">hourglass_top</span>
                                    Chờ phân xử
                                  </span>
                                ) : row.r.dispute_status === 'rejected' ? (
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    title={row.r.dispute_resolution_note || 'Khiếu nại đã bị bác'}
                                  >
                                    <span className="material-symbols-outlined text-sm">gavel</span>
                                    Đã bác
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setDisputeRecord(row.r)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">gavel</span>
                                    Khiếu nại
                                  </button>
                                )}
                              </td>
                            </tr>
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <PortalTablePagination
                  from={conductFrom}
                  to={conductTo}
                  total={conductRowsSearchFiltered.length}
                  page={pageConduct}
                  totalPages={totalPagesConduct}
                  onPageChange={setPageConduct}
                  noun="bản ghi"
                />
              </div>
            </div>
          )}
        </div>
      ) : null}

      {disputeToast ? (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-lg">
          {disputeToast}
        </div>
      ) : null}

      <ConductDisputeModal
        open={disputeRecord != null}
        onClose={() => setDisputeRecord(null)}
        record={disputeRecord}
        onSubmit={handleSubmitDispute}
        busy={disputeBusy}
      />

      <ConductImageLightbox
        open={imgLightbox.open}
        urls={imgLightbox.urls}
        startIndex={imgLightbox.startIndex}
        onClose={closeConductImages}
      />
    </div>
  )
}
