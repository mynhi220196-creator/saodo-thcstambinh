import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import DateInputVN from '../../components/DateInputVN.jsx'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { formatDateTimeVN } from '../../lib/dateFormat.js'
import { subscribeAllConductClassRecords } from '../../lib/conductClassRecordsFirestore.js'
import { subscribeAllConductScoreRecords } from '../../lib/conductScoreRecordsFirestore.js'
import { subscribeClasses, subscribeStudents } from '../../lib/organizationFirestore.js'
import { subscribeProfiles } from '../../lib/userProfilesFirestore.js'
import { GRADE_FILTER_OPTIONS, SCHOOL_YEAR_OPTIONS } from '../classes/classMockData.js'
import { rangeForPreset } from '../adminDashboard/dashboardPresets.js'
import {
  buildDetailExportRows,
  buildPerClassReportRows,
  buildTopViolationCriteria,
  prepareFilteredConduct,
  summarizeReportRows,
} from './adminReportsAggregates.js'
import { downloadAdminReportsExcel } from './exportAdminReportsExcel.js'

const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'Mọi loại bản ghi' },
  { value: 'penalty', label: 'Chỉ vi phạm' },
  { value: 'reward', label: 'Chỉ khen thưởng' },
]

const DATE_PRESETS = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'month', label: 'Tháng này' },
  { id: 'all', label: 'Toàn bộ' },
]

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary text-2xl shrink-0">{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
          <p className="text-2xl font-headline font-extrabold text-on-surface tabular-nums mt-1">{value}</p>
          {hint ? <p className="text-xs text-on-surface-variant mt-1">{hint}</p> : null}
        </div>
      </div>
    </div>
  )
}

function SortableHead({ sortKey, activeKey, dir, onSort, className = '', align = 'left', children }) {
  const active = activeKey === sortKey
  const icon = active ? (dir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'
  const justify = align === 'right' ? 'justify-end text-right' : 'justify-start text-left'
  return (
    <th className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex w-full items-start gap-1 leading-snug ${justify}`}
        title="Sắp xếp"
      >
        <span className="min-w-0">{children}</span>
        <span
          className={`material-symbols-outlined text-sm leading-none mt-0.5 ${
            active ? 'opacity-100 text-on-surface' : 'opacity-30 group-hover:opacity-70'
          }`}
          aria-hidden
        >
          {icon}
        </span>
      </button>
    </th>
  )
}

export default function AdminReportsPage() {
  const [scoreRaw, setScoreRaw] = useState([])
  const [classConductRaw, setClassConductRaw] = useState([])
  const [classesRaw, setClassesRaw] = useState([])
  const [studentsRaw, setStudentsRaw] = useState([])
  const [profilesRaw, setProfilesRaw] = useState([])

  const [hydrated, setHydrated] = useState(false)
  const [loadError, setLoadError] = useState('')
  const gate = useRef({ score: false, classC: false, classes: false, students: false })

  const bump = useCallback(() => {
    const g = gate.current
    if (g.score && g.classC && g.classes && g.students) setHydrated(true)
  }, [])

  useEffect(() => {
    gate.current = { score: false, classC: false, classes: false, students: false }
    setHydrated(false)
    const u1 = subscribeAllConductScoreRecords(
      (d) => {
        setScoreRaw(d)
        setLoadError('')
        if (!gate.current.score) {
          gate.current.score = true
          bump()
        }
      },
      (e) => {
        setScoreRaw([])
        setLoadError((prev) => prev || e?.message || 'Không tải conduct_score_records.')
        if (!gate.current.score) {
          gate.current.score = true
          bump()
        }
      },
    )
    const u2 = subscribeAllConductClassRecords(
      (d) => {
        setClassConductRaw(d)
        if (!gate.current.classC) {
          gate.current.classC = true
          bump()
        }
      },
      (e) => {
        setClassConductRaw([])
        setLoadError((prev) => prev || e?.message || 'Không tải conduct_class_records.')
        if (!gate.current.classC) {
          gate.current.classC = true
          bump()
        }
      },
    )
    const u3 = subscribeClasses(
      (d) => {
        setClassesRaw(d)
        if (!gate.current.classes) {
          gate.current.classes = true
          bump()
        }
      },
      (e) => {
        setClassesRaw([])
        setLoadError((prev) => prev || e?.message || 'Không tải classes.')
        if (!gate.current.classes) {
          gate.current.classes = true
          bump()
        }
      },
    )
    const u4 = subscribeStudents(
      (d) => {
        setStudentsRaw(d)
        if (!gate.current.students) {
          gate.current.students = true
          bump()
        }
      },
      () => {
        if (!gate.current.students) {
          gate.current.students = true
          bump()
        }
      },
    )
    const u5 = subscribeProfiles(setProfilesRaw, () => {})
    return () => {
      u1()
      u2()
      u3()
      u4()
      u5()
    }
  }, [bump])

  const profileById = useMemo(() => {
    const m = {}
    for (const p of profilesRaw) m[p.id] = p
    return m
  }, [profilesRaw])

  const [schoolYear, setSchoolYear] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [classIdFilter, setClassIdFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [datePreset, setDatePreset] = useState('30d')
  const [dateFrom, setDateFrom] = useState(() => rangeForPreset('30d').from)
  const [dateTo, setDateTo] = useState(() => rangeForPreset('30d').to)
  const [sortKey, setSortKey] = useState('classCode')
  const [sortDir, setSortDir] = useState('asc')

  const schoolYearOptions = useMemo(
    () => [{ value: 'all', label: 'Tất cả năm học' }, ...SCHOOL_YEAR_OPTIONS],
    [],
  )

  const classesActive = useMemo(
    () => classesRaw.filter((c) => c.is_deleted !== true && c.is_active !== false),
    [classesRaw],
  )

  const classesForFilters = useMemo(() => {
    return classesActive
      .filter((c) => schoolYear === 'all' || c.school_year === schoolYear)
      .filter((c) => gradeFilter === 'all' || String(c.grade) === gradeFilter)
      .sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? ''), 'vi'))
  }, [classesActive, schoolYear, gradeFilter])

  useEffect(() => {
    if (classIdFilter !== 'all' && !classesForFilters.some((c) => c.id === classIdFilter)) {
      setClassIdFilter('all')
    }
  }, [classesForFilters, classIdFilter])

  const classesInReport = useMemo(() => {
    if (classIdFilter === 'all') return classesForFilters
    return classesForFilters.filter((c) => c.id === classIdFilter)
  }, [classesForFilters, classIdFilter])

  const { scoreFiltered, classRecFiltered } = useMemo(
    () => prepareFilteredConduct(scoreRaw, classConductRaw, dateFrom, dateTo, typeFilter),
    [scoreRaw, classConductRaw, dateFrom, dateTo, typeFilter],
  )

  const reportRows = useMemo(
    () => buildPerClassReportRows(classesInReport, studentsRaw, scoreFiltered, classRecFiltered, profileById),
    [classesInReport, studentsRaw, scoreFiltered, classRecFiltered, profileById],
  )

  const sortedReportRows = useMemo(() => {
    const numericKeys = new Set([
      'grade',
      'studentCount',
      'indivPenaltyCount',
      'indivRewardCount',
      'indivPenaltyPoints',
      'indivRewardPoints',
      'classPenaltyCount',
      'classRewardCount',
      'classPenaltyPoints',
      'classRewardPoints',
      'finalConductPoints',
      'flaggedCount',
    ])
    const rows = [...reportRows]
    rows.sort((a, b) => {
      const av = a?.[sortKey]
      const bv = b?.[sortKey]
      let cmp = 0
      if (numericKeys.has(sortKey)) {
        cmp = Number(av ?? 0) - Number(bv ?? 0)
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'vi')
      }
      if (cmp === 0) {
        cmp = String(a.classCode ?? '').localeCompare(String(b.classCode ?? ''), 'vi')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [reportRows, sortDir, sortKey])

  const summary = useMemo(() => summarizeReportRows(reportRows), [reportRows])

  const topViolations = useMemo(
    () => buildTopViolationCriteria(scoreFiltered, classRecFiltered, 10),
    [scoreFiltered, classRecFiltered],
  )

  const maxVio = topViolations[0]?.count ?? 1

  const onPickDatePreset = (id) => {
    setDatePreset(id)
    const r = rangeForPreset(id)
    setDateFrom(r.from)
    setDateTo(r.to)
  }

  const onDateFrom = (v) => {
    setDatePreset('custom')
    setDateFrom(v)
  }

  const onDateTo = (v) => {
    setDatePreset('custom')
    setDateTo(v)
  }

  const exportMeta = useMemo(() => {
    const typeLabel = TYPE_FILTER_OPTIONS.find((t) => t.value === typeFilter)?.label ?? typeFilter
    const sy = schoolYearOptions.find((o) => o.value === schoolYear)?.label ?? schoolYear
    const gr = GRADE_FILTER_OPTIONS.find((o) => o.value === gradeFilter)?.label ?? gradeFilter
    const cl =
      classIdFilter === 'all'
        ? 'Tất cả lớp (theo năm/khối)'
        : classesActive.find((c) => c.id === classIdFilter)?.code ?? classIdFilter
    return {
      Ngay_xuat: formatDateTimeVN(Date.now()),
      Nam_hoc: sy,
      Khoi: gr,
      Lop: cl,
      Loai_ban_ghi: typeLabel,
      Tu_ngay: dateFrom || '(không giới hạn)',
      Den_ngay: dateTo || '(không giới hạn)',
      So_lop_trong_bang: String(reportRows.length),
    }
  }, [
    typeFilter,
    schoolYear,
    gradeFilter,
    classIdFilter,
    dateFrom,
    dateTo,
    reportRows.length,
    schoolYearOptions,
    classesActive,
  ])

  const handleExportExcel = () => {
    const detailResult = buildDetailExportRows(scoreFiltered, classRecFiltered, 8000)
    downloadAdminReportsExcel({
      reportRows,
      detailResult,
      meta: {
        ...exportMeta,
        So_ban_ghi_chi_tiet_xuat: String(detailResult.rows.length),
        Tong_ban_ghi_chi_tiet: String(detailResult.total),
        Cat_bo_neu_qua_han_muc: detailResult.truncated ? 'Có (tối đa 8000 dòng)' : 'Không',
      },
    })
  }

  const onSort = (nextKey) => {
    if (sortKey === nextKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(nextKey)
    const preferDesc = [
      'grade',
      'studentCount',
      'indivPenaltyCount',
      'indivRewardCount',
      'indivPenaltyPoints',
      'indivRewardPoints',
      'classPenaltyCount',
      'classRewardCount',
      'classPenaltyPoints',
      'classRewardPoints',
      'finalConductPoints',
      'flaggedCount',
    ].includes(nextKey)
    setSortDir(preferDesc ? 'desc' : 'asc')
  }

  const selectClass =
    'rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm font-semibold text-on-surface py-2.5 pl-3 pr-8 shadow-sm focus:ring-2 focus:ring-primary/20 min-w-[200px]'

  return (
    <AdminShell
      activeKey="bao-cao"
      headerTitle="Báo cáo & Thống kê"
      searchPlaceholder="Lọc nhanh theo lớp, năm học…"
      contentClassName="px-4 py-6 sm:px-5 sm:py-8 lg:px-6"
    >
      <div className="w-full min-w-0 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Tác phong theo lớp</h2>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Thống kê gộp từ điểm học sinh và điểm tập thể lớp. Lọc theo năm học, khối, một lớp cụ thể, khoảng thời gian và loại bản ghi.
              Xuất Excel gồm bảng theo lớp, sheet bộ lọc và chi tiết bản ghi (tối đa 8000 dòng).
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={!hydrated}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none shrink-0"
          >
            <span className="material-symbols-outlined text-xl">table_view</span>
            Xuất Excel (.xlsx)
          </button>
        </div>

        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 p-4 sm:p-6 space-y-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Bộ lọc</p>
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
              Năm học
              <select className={selectClass} value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)}>
                {schoolYearOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
              Khối
              <select className={selectClass} value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
                {GRADE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
              Lớp
              <select className={selectClass} value={classIdFilter} onChange={(e) => setClassIdFilter(e.target.value)}>
                <option value="all">Tất cả lớp (trong năm/khối)</option>
                {classesForFilters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ?? '—'}
                    {c.school_year ? ` · ${c.school_year}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold text-on-surface-variant">
              Loại bản ghi
              <select className={selectClass} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                {TYPE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="border-t border-outline-variant/10 pt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Thời gian ghi nhận</p>
            <div className="flex flex-wrap gap-2">
              {DATE_PRESETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onPickDatePreset(b.id)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                    datePreset === b.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <label className="flex min-w-[11rem] shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant">
                Từ ngày
                <DateInputVN value={dateFrom} onChange={onDateFrom} />
              </label>
              <label className="flex min-w-[11rem] shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant">
                Đến ngày
                <DateInputVN value={dateTo} onChange={onDateTo} />
              </label>
              <p className="text-xs text-on-surface-variant pb-2 max-w-md">
                Áp dụng theo thời điểm tạo bản ghi. Để trống một đầu = không giới hạn phía đó.
              </p>
            </div>
          </div>
        </div>

        {!hydrated ? (
          <p className="text-sm text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined animate-pulse">hourglass_empty</span>
            Đang tải dữ liệu…
          </p>
        ) : null}
        {loadError ? (
          <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3">{loadError}</p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="class" label="Lớp trong bảng" value={summary.totalClasses} />
          <StatCard
            icon="fact_check"
            label="Bản ghi (sau lọc)"
            value={summary.totalConduct}
            hint="Theo lớp + loại + thời gian"
          />
          <StatCard
            icon="gavel"
            label="Lần vi phạm"
            value={summary.sumPenaltyN}
            hint={`Tổng điểm trừ (|điểm|): ${summary.sumPenaltyPts}`}
          />
          <StatCard
            icon="verified"
            label="Lần khen thưởng"
            value={summary.sumRewardN}
            hint={`Tổng điểm cộng: ${summary.sumRewardPts}`}
          />
        </div>

        {summary.sumFlagged > 0 ? (
          <p className="text-sm font-semibold text-error bg-error-container/20 rounded-xl px-4 py-3 border border-error/20">
            Có {summary.sumFlagged} bản ghi đang gắn cờ xử lý nghiêm trong phạm vi lọc (xem chi tiết ở sheet Excel hoặc{' '}
            <Link to="/admin/score-records" className="underline font-bold">
              Bản ghi điểm
            </Link>
            ).
          </p>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">analytics</span>
              Tiêu chí vi phạm phổ biến
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">Trong phạm vi lọc hiện tại (mọi lớp đã chọn).</p>
            {topViolations.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-6 text-center">Không có vi phạm trong bộ lọc.</p>
            ) : (
              <ul className="space-y-3">
                {topViolations.map(({ label, count }) => (
                  <li key={label}>
                    <div className="flex justify-between gap-2 text-sm mb-1">
                      <span className="text-on-surface font-medium truncate" title={label}>
                        {label}
                      </span>
                      <span className="tabular-nums font-bold text-error shrink-0">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-error/80 transition-all"
                        style={{ width: `${Math.max(8, (count / maxVio) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/30 p-5 flex flex-col justify-center">
            <h3 className="font-headline font-bold text-on-surface text-sm">Gợi ý đọc báo cáo</h3>
            <ul className="mt-3 text-sm text-on-surface-variant space-y-2 list-disc pl-5">
              <li>
                <strong className="text-on-surface">Theo lớp:</strong> chọn năm học + khối, so sánh các lớp; hoặc chọn một lớp để xuất
                riêng.
              </li>
              <li>
                <strong className="text-on-surface">HS vs tập thể:</strong> cột «HS_*» là bản ghi cá nhân; «Lop_*» là điểm lớp
                (Firestore <code className="text-xs bg-surface-container-high px-1 rounded">conduct_class_records</code>).
              </li>
              <li>
                <strong className="text-on-surface">Điểm final:</strong> trong phạm vi lọc, bằng (tổng điểm cộng HS + lớp) − (tổng điểm
                trừ HS + lớp); cùng cột <span className="font-mono text-xs bg-surface-container-high px-1 rounded">Diem_final_can_tac_phong</span>{' '}
                ở sheet Excel «Theo_lop».
              </li>
              <li>
                <strong className="text-on-surface">Excel:</strong> sheet «Chi_tiet_ban_ghi» giới hạn 8000 dòng; nếu đủ dài, thu hẹp
                ngày hoặc lọc một lớp rồi xuất nhiều lần.
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-headline font-bold text-on-surface">Bảng chi tiết theo lớp</h3>
            <span className="text-xs font-semibold text-on-surface-variant">{reportRows.length} dòng</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs font-extrabold text-on-surface-variant bg-surface-container-high/80 border-b border-outline-variant/10">
                  <SortableHead
                    sortKey="classCode"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    className="px-3 py-3 sticky left-0 bg-surface-container-high/95 z-10 uppercase tracking-wide"
                  >
                    Lớp
                  </SortableHead>
                  <SortableHead sortKey="grade" activeKey={sortKey} dir={sortDir} onSort={onSort} className="px-3 py-3 uppercase tracking-wide">
                    Khối
                  </SortableHead>
                  <SortableHead sortKey="schoolYear" activeKey={sortKey} dir={sortDir} onSort={onSort} className="px-3 py-3 uppercase tracking-wide">
                    Năm học
                  </SortableHead>
                  <SortableHead sortKey="homeroomTeacher" activeKey={sortKey} dir={sortDir} onSort={onSort} className="px-3 py-3 uppercase tracking-wide">
                    GVCN
                  </SortableHead>
                  <SortableHead
                    sortKey="studentCount"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right uppercase tracking-wide"
                  >
                    Sĩ số
                  </SortableHead>
                  <SortableHead
                    sortKey="indivPenaltyCount"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right border-l border-outline-variant/10 whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Lần phạt học sinh</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Số bản ghi vi phạm (cá nhân)
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="indivRewardCount"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Lần khen học sinh</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Số bản ghi khen thưởng (cá nhân)
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="indivPenaltyPoints"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Tổng điểm trừ HS</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Cộng |điểm| các lần phạt cá nhân
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="indivRewardPoints"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Tổng điểm cộng HS</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Cộng |điểm| các lần khen cá nhân
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="classPenaltyCount"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right border-l border-outline-variant/10 whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Lần phạt tập thể lớp</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Điểm lớp + bản ghi lớp cũ (score)
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="classRewardCount"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Lần khen tập thể lớp</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Như trên, loại khen thưởng
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="classPenaltyPoints"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Tổng điểm trừ lớp</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Cộng |điểm| phạt tập thể
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="classRewardPoints"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right whitespace-normal max-w-[8.5rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Tổng điểm cộng lớp</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Cộng |điểm| khen tập thể
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="finalConductPoints"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right border-l border-outline-variant/10 whitespace-normal max-w-[8rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Điểm final</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Cân (+−): tổng cộng − tổng trừ
                    </span>
                  </SortableHead>
                  <SortableHead
                    sortKey="flaggedCount"
                    activeKey={sortKey}
                    dir={sortDir}
                    onSort={onSort}
                    align="right"
                    className="px-3 py-3 text-right border-l border-outline-variant/10 whitespace-normal max-w-[7rem] leading-snug align-bottom"
                  >
                    <span className="block text-on-surface">Gắn cờ nghiêm</span>
                    <span className="block text-[10px] font-bold text-on-surface-variant normal-case tracking-normal mt-0.5">
                      Số bản ghi admin_flagged
                    </span>
                  </SortableHead>
                </tr>
              </thead>
              <tbody>
                {reportRows.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-10 text-center text-on-surface-variant">
                      Không có lớp nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  sortedReportRows.map((r) => (
                    <tr key={r.classId} className="border-b border-outline-variant/5 hover:bg-surface-container-low/50">
                      <td className="px-3 py-2.5 font-bold sticky left-0 bg-surface-container-lowest z-10">
                        <span className="text-on-surface">{r.classCode}</span>
                        {r.className !== '—' ? (
                          <span className="block text-xs font-normal text-on-surface-variant truncate max-w-[140px]">
                            {r.className}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2.5 tabular-nums">{r.grade}</td>
                      <td className="px-3 py-2.5">{r.schoolYear}</td>
                      <td className="px-3 py-2.5 max-w-[160px] truncate" title={r.homeroomTeacher}>
                        {r.homeroomTeacher}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.studentCount}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums border-l border-outline-variant/10">{r.indivPenaltyCount}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.indivRewardCount}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.indivPenaltyPoints}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.indivRewardPoints}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums border-l border-outline-variant/10">
                        {r.classPenaltyCount}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.classRewardCount}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.classPenaltyPoints}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{r.classRewardPoints}</td>
                      <td
                        className={`px-3 py-2.5 text-right tabular-nums border-l border-outline-variant/10 font-extrabold ${
                          r.finalConductPoints > 0
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : r.finalConductPoints < 0
                              ? 'text-rose-700 dark:text-rose-300'
                              : 'text-on-surface-variant'
                        }`}
                      >
                        {r.finalConductPoints > 0 ? '+' : ''}
                        {r.finalConductPoints}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums border-l border-outline-variant/10 font-semibold text-error">
                        {r.flaggedCount || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
