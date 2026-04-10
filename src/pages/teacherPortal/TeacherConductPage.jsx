import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import ConductImageLightbox, { ConductRecordImageStrip } from '../../components/ConductImageLightbox.jsx'
import SaoDoShell from '../../components/layout/SaoDoShell.jsx'
import TeacherShell from '../../components/layout/TeacherShell.jsx'
import { buildSchoolYearOptions, currentSchoolYearValue } from '../../lib/academicYearOptions.js'
import { subscribeConductCriteria } from '../../lib/conductCriteriaFirestore.js'
import {
  deleteConductClassRecord,
  subscribeConductClassRecordsByTeacher,
} from '../../lib/conductClassRecordsFirestore.js'
import {
  deleteConductScoreRecord,
  subscribeConductRecordsByTeacher,
} from '../../lib/conductScoreRecordsFirestore.js'
import { subscribeClassesForSchoolYear, subscribeStudentsByClassId } from '../../lib/organizationFirestore.js'
import { formatDateTimeVN } from '../../lib/dateFormat.js'
import TeacherConductRecordModal from './TeacherConductRecordModal.jsx'
import PortalTablePagination from './PortalTablePagination.jsx'

const TAB_CLASS_LIST = 'class_list'
const TAB_RECENT = 'recent'
const PAGE_SIZE_STUDENTS = 15
const PAGE_SIZE_RECENT = 15

function mainTabBtnClass(active, pt) {
  return [
    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all border-2 whitespace-nowrap shrink-0',
    active ? pt.mainTabOn : pt.mainTabOff,
  ].join(' ')
}

function normalizeForSearch(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function TeacherConductPage({ variant = 'teacher' }) {
  const { user, profile } = useAuth()
  const teacherUid = user?.id ?? ''
  /** Lưu vào Firestore: ưu tiên full_name hồ sơ, rồi displayName Auth, rồi email — tránh recorded_by_name rỗng. */
  const recorderDisplayName = useMemo(() => {
    const fn = String(profile?.full_name ?? '').trim()
    if (fn) return fn
    const dn = String(user?.displayName ?? '').trim()
    if (dn) return dn
    return String(user?.email ?? '').trim()
  }, [profile?.full_name, user?.displayName, user?.email])
  const isSaoDo = variant === 'sao_do'
  const Shell = isSaoDo ? SaoDoShell : TeacherShell
  const pt = isSaoDo
    ? {
        portalCrumb: 'Đội Sao Đỏ',
        bcAccent: 'text-red-900 dark:text-red-200',
        h1: 'text-red-900 dark:text-red-100',
        selRing: 'focus:ring-rose-500/25',
        toast:
          'text-red-900 dark:text-red-100 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900',
        cardBar: 'bg-red-50/50 dark:bg-red-950/25',
        classCode: 'text-red-900 dark:text-red-200',
        count: 'text-red-800 dark:text-red-200',
        tabBorder: 'border-red-100/80 dark:border-red-900/40',
        tabIndOn: 'bg-red-700 text-white shadow-sm',
        tabClassOn: 'bg-red-900 text-white shadow-sm',
        thead: 'bg-red-50/80 dark:bg-red-950/40',
        btnGhi: 'bg-red-700 text-white hover:bg-red-800',
        classPanel: 'bg-red-50/40 dark:bg-red-950/25',
        classBtn: 'bg-red-800 text-white hover:bg-red-900',
        rewardPts: 'text-red-700 dark:text-red-300',
        mainTabOn:
          'border-red-700 bg-red-100/90 text-red-950 dark:bg-red-950/50 dark:text-red-50 dark:border-red-500 shadow-sm',
        mainTabOff:
          'border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
      }
    : {
        portalCrumb: 'Cổng Giáo viên',
        bcAccent: 'text-[#0d5c3f] dark:text-emerald-300',
        h1: 'text-[#0d5c3f] dark:text-emerald-100',
        selRing: 'focus:ring-emerald-500/20',
        toast:
          'text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900',
        cardBar: 'bg-emerald-50/50 dark:bg-emerald-950/20',
        classCode: 'text-[#0d5c3f] dark:text-emerald-200',
        count: 'text-emerald-800 dark:text-emerald-200',
        tabBorder: 'border-emerald-100/80 dark:border-emerald-900/40',
        tabIndOn: 'bg-emerald-600 text-white shadow-sm',
        tabClassOn: 'bg-teal-700 text-white shadow-sm',
        thead: 'bg-emerald-50/80 dark:bg-emerald-950/40',
        btnGhi: 'bg-emerald-600 text-white hover:bg-emerald-700',
        classPanel: 'bg-teal-50/40 dark:bg-teal-950/20',
        classBtn: 'bg-teal-700 text-white hover:bg-teal-800',
        rewardPts: 'text-emerald-700 dark:text-emerald-300',
        mainTabOn:
          'border-emerald-600 bg-emerald-100/90 text-emerald-950 dark:bg-emerald-950/45 dark:text-emerald-50 dark:border-emerald-500 shadow-sm',
        mainTabOff:
          'border-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
      }

  const yearOptions = useMemo(() => buildSchoolYearOptions(8), [])
  const [schoolYear, setSchoolYear] = useState(currentSchoolYearValue)

  const [classes, setClasses] = useState([])
  const [classesError, setClassesError] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')

  const [students, setStudents] = useState([])
  const [criteria, setCriteria] = useState([])
  const [criteriaError, setCriteriaError] = useState('')

  const [myRecords, setMyRecords] = useState([])
  const [myClassRecords, setMyClassRecords] = useState([])
  const [recordsError, setRecordsError] = useState('')
  const [classRecordsError, setClassRecordsError] = useState('')

  const [modalStudent, setModalStudent] = useState(null)
  const [classModalOpen, setClassModalOpen] = useState(false)
  /** Cá nhân: ghi từng em. Cả lớp: một hạng mục cho toàn lớp. */
  const [conductTarget, setConductTarget] = useState('individual')
  /** Tab cấp trang: danh sách HS vs bản ghi gần đây (lớp đang chọn). */
  const [conductPageTab, setConductPageTab] = useState(TAB_CLASS_LIST)
  const [pageStudentList, setPageStudentList] = useState(1)
  const [pageRecentList, setPageRecentList] = useState(1)
  const [studentSearchQuery, setStudentSearchQuery] = useState('')
  const [recentSearchQuery, setRecentSearchQuery] = useState('')
  const [toast, setToast] = useState('')
  const [deleteBusyId, setDeleteBusyId] = useState('')
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
    return subscribeConductCriteria(
      (list) => {
        setCriteriaError('')
        setCriteria(list)
      },
      (e) => setCriteriaError(e?.message ?? 'Không tải được hạng mục.'),
    )
  }, [])

  useEffect(() => {
    if (!teacherUid) {
      setMyRecords([])
      return undefined
    }
    return subscribeConductRecordsByTeacher(
      teacherUid,
      (list) => {
        setRecordsError('')
        setMyRecords(list)
      },
      (e) => setRecordsError(e?.message ?? 'Không tải được bản ghi.'),
    )
  }, [teacherUid])

  useEffect(() => {
    if (!teacherUid) {
      setMyClassRecords([])
      return undefined
    }
    return subscribeConductClassRecordsByTeacher(
      teacherUid,
      (list) => {
        setClassRecordsError('')
        setMyClassRecords(list)
      },
      (e) => setClassRecordsError(e?.message ?? 'Không tải được điểm lớp.'),
    )
  }, [teacherUid])

  useEffect(() => {
    if (!schoolYear) {
      setClasses([])
      return undefined
    }
    return subscribeClassesForSchoolYear(
      schoolYear,
      (list) => {
        setClassesError('')
        setClasses(list)
      },
      (e) => setClassesError(e?.message ?? 'Không tải được danh sách lớp.'),
    )
  }, [schoolYear])

  const activeClasses = useMemo(
    () => classes.filter((c) => c.is_deleted !== true && c.is_active !== false),
    [classes],
  )

  const selectedClass = useMemo(
    () => activeClasses.find((c) => c.id === selectedClassId) ?? null,
    [activeClasses, selectedClassId],
  )

  useEffect(() => {
    if (!selectedClassId) {
      setStudents([])
      return undefined
    }
    return subscribeStudentsByClassId(
      selectedClassId,
      (list) => setStudents(list),
      () => {},
    )
  }, [selectedClassId])

  useEffect(() => {
    setSelectedClassId('')
  }, [schoolYear])

  useEffect(() => {
    setClassModalOpen(false)
  }, [selectedClassId])

  useEffect(() => {
    setConductPageTab(TAB_CLASS_LIST)
    setPageStudentList(1)
    setPageRecentList(1)
    setStudentSearchQuery('')
    setRecentSearchQuery('')
  }, [selectedClassId])

  useEffect(() => {
    setPageStudentList(1)
  }, [studentSearchQuery])

  useEffect(() => {
    setPageRecentList(1)
  }, [recentSearchQuery])

  useEffect(() => {
    setPageStudentList(1)
  }, [conductTarget])

  useEffect(() => {
    if (!selectedClassId || !activeClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId('')
    }
  }, [activeClasses, selectedClassId])

  const activeStudents = useMemo(
    () => students.filter((s) => s.is_active !== false && s.is_deleted !== true),
    [students],
  )

  const studentSearchNorm = String(studentSearchQuery ?? '').trim().toLowerCase()
  const filteredStudents = useMemo(() => {
    if (!studentSearchNorm) return activeStudents
    return activeStudents.filter((s) => {
      const name = String(s.full_name ?? '').toLowerCase()
      const code = String(s.student_code ?? '').toLowerCase()
      const grade = s.grade != null ? `khối ${s.grade}` : ''
      return (
        name.includes(studentSearchNorm) ||
        code.includes(studentSearchNorm) ||
        grade.includes(studentSearchNorm)
      )
    })
  }, [activeStudents, studentSearchNorm])

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE_STUDENTS))
    setPageStudentList((p) => Math.min(p, tp))
  }, [filteredStudents.length])

  /** Cá nhân (bỏ bản ghi cũ kiểu nhân theo HS trong `conduct_score_records`). */
  const recentStudentForClass = useMemo(() => {
    if (!selectedClassId) return []
    return myRecords
      .filter((r) => r.class_id === selectedClassId && r.record_scope !== 'class')
      .map((r) => ({ kind: 'individual', t: r._createdMs, key: r.id, r }))
  }, [myRecords, selectedClassId])

  const recentClassLevelForClass = useMemo(() => {
    if (!selectedClassId) return []
    return myClassRecords
      .filter((r) => r.class_id === selectedClassId)
      .map((r) => ({ kind: 'class_level', t: r._createdMs, key: r.id, r }))
  }, [myClassRecords, selectedClassId])

  const recentForClassAll = useMemo(() => {
    const merged = [...recentStudentForClass, ...recentClassLevelForClass].sort((a, b) => b.t - a.t)
    return merged
  }, [recentStudentForClass, recentClassLevelForClass])

  const recentFiltered = useMemo(() => {
    const q = normalizeForSearch(recentSearchQuery)
    if (!q) return recentForClassAll
    return recentForClassAll.filter((row) => {
      const r = row.r
      const chunks = []
      if (row.t) chunks.push(formatDateTimeVN(row.t))
      if (row.kind === 'class_level') {
        chunks.push('diem lop', r.criterion_name, r.criterion_code)
      } else {
        chunks.push(r.student_name, r.criterion_name, r.criterion_code)
      }
      if (r.points != null) chunks.push(String(r.points))
      const blob = normalizeForSearch(chunks.filter(Boolean).join(' '))
      return blob.includes(q)
    })
  }, [recentForClassAll, recentSearchQuery])

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(recentFiltered.length / PAGE_SIZE_RECENT))
    setPageRecentList((p) => Math.min(p, tp))
  }, [recentFiltered.length])

  const totalPagesStudents = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE_STUDENTS))
  const safePageStudents = Math.min(Math.max(1, pageStudentList), totalPagesStudents)
  const studentSliceStart = (safePageStudents - 1) * PAGE_SIZE_STUDENTS
  const pagedStudents = filteredStudents.slice(studentSliceStart, studentSliceStart + PAGE_SIZE_STUDENTS)
  const studentFrom = filteredStudents.length === 0 ? 0 : studentSliceStart + 1
  const studentTo = Math.min(safePageStudents * PAGE_SIZE_STUDENTS, filteredStudents.length)

  const totalPagesRecent = Math.max(1, Math.ceil(recentFiltered.length / PAGE_SIZE_RECENT))
  const safePageRecent = Math.min(Math.max(1, pageRecentList), totalPagesRecent)
  const recentSliceStart = (safePageRecent - 1) * PAGE_SIZE_RECENT
  const pagedRecentRows = recentFiltered.slice(recentSliceStart, recentSliceStart + PAGE_SIZE_RECENT)
  const recentFrom = recentFiltered.length === 0 ? 0 : recentSliceStart + 1
  const recentTo = Math.min(safePageRecent * PAGE_SIZE_RECENT, recentFiltered.length)

  function handleRecorded(meta) {
    if (meta?.mode === 'class') {
      setToast('Đã lưu điểm tác phong của lớp.')
    } else {
      setToast('Đã ghi nhận tác phong.')
    }
    window.setTimeout(() => setToast(''), 4000)
  }

  const handleDeleteRecentRow = useCallback(
    async (row) => {
      if (!isSaoDo && row?.r?.admin_flagged) return
      if (row?.r?.recorded_by && row.r.recorded_by !== teacherUid) return
      if (!window.confirm('Xóa bản ghi này? Thao tác không thể hoàn tác.')) return
      const id = row.r.id
      setDeleteBusyId(id)
      try {
        if (row.kind === 'class_level') {
          await deleteConductClassRecord(id)
        } else {
          await deleteConductScoreRecord(id)
        }
        setToast('Đã xóa bản ghi.')
        window.setTimeout(() => setToast(''), 4000)
      } catch (e) {
        window.alert(e?.message ?? 'Không xóa được bản ghi.')
      } finally {
        setDeleteBusyId('')
      }
    },
    [isSaoDo, teacherUid],
  )

  return (
    <Shell activeKey="tac-phong" headerTitle="Ghi nhận tác phong" searchPlaceholder="Tìm học sinh…">
      <div className="w-full min-w-0 flex flex-col gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            <span>{pt.portalCrumb}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className={pt.bcAccent}>Tác phong</span>
          </div>
          <h1 className={`font-headline text-3xl font-extrabold ${pt.h1}`}>Ghi nhận tác phong</h1>
          <p className="text-on-surface-variant text-sm mt-2 max-w-3xl">
            Chọn <span className="font-semibold text-on-surface">năm học</span> và <span className="font-semibold text-on-surface">lớp</span>.
            <span className="font-semibold text-on-surface"> Cá nhân</span> lưu{' '}
            <span className="font-mono text-xs">conduct_score_records</span>.{' '}
            <span className="font-semibold text-on-surface">Điểm lớp</span> là một bản ghi cho tập thể, lưu{' '}
            <span className="font-mono text-xs">conduct_class_records</span> (không cộng vào từng học sinh).
            {isSaoDo ? (
              <>
                {' '}
                <span className="font-semibold text-red-900 dark:text-red-200">
                  Đội Sao Đỏ chỉ ghi nhận vi phạm (trừ điểm); không ghi khen.
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 items-stretch lg:items-end">
          <div className="flex flex-col gap-1.5 min-w-[200px] lg:flex-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Năm học</label>
            <select
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className={`bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 ${pt.selRing}`}
            >
              {yearOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[220px] lg:flex-[2]">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Lớp</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className={`bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 ${pt.selRing}`}
            >
              <option value="">— Chọn lớp —</option>
              {activeClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ?? c.id}
                  {c.name ? ` · ${c.name}` : ''}
                </option>
              ))}
            </select>
          </div>
          {!isSaoDo ? (
            <Link
              to="/giao-vien/lop-hoc"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 shrink-0"
            >
              <span className="material-symbols-outlined text-lg">home_work</span>
              Lớp chủ nhiệm
            </Link>
          ) : null}
        </div>

        {classesError ? (
          <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3">{classesError}</p>
        ) : null}
        {criteriaError ? (
          <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3">{criteriaError}</p>
        ) : null}
        {recordsError ? (
          <p className="text-sm font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-3">{recordsError}</p>
        ) : null}
        {classRecordsError ? (
          <p className="text-sm font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-3">{classRecordsError}</p>
        ) : null}

        {toast ? <p className={`text-sm font-bold rounded-xl px-4 py-3 ${pt.toast}`}>{toast}</p> : null}

        {!selectedClassId ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/25 bg-surface-container-low/50 p-10 text-center text-on-surface-variant text-sm">
            Chọn lớp để hiện danh sách học sinh và nút ghi nhận.
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
            <div
              className={`px-3 sm:px-4 py-3 border-b border-outline-variant/10 ${pt.cardBar} flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-3`}
              role="tablist"
              aria-label="Nội dung theo lớp"
            >
              <button
                type="button"
                role="tab"
                aria-selected={conductPageTab === TAB_CLASS_LIST}
                id="conduct-tab-class-list"
                aria-controls="conduct-panel-class-list"
                onClick={() => setConductPageTab(TAB_CLASS_LIST)}
                className={mainTabBtnClass(conductPageTab === TAB_CLASS_LIST, pt)}
              >
                <span className="material-symbols-outlined text-[22px] shrink-0">groups</span>
                <span>
                  Danh sách học sinh
                  <span className="font-extrabold tabular-nums opacity-85"> ({activeStudents.length})</span>
                </span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={conductPageTab === TAB_RECENT}
                id="conduct-tab-recent"
                aria-controls="conduct-panel-recent"
                onClick={() => setConductPageTab(TAB_RECENT)}
                className={mainTabBtnClass(conductPageTab === TAB_RECENT, pt)}
              >
                <span className="material-symbols-outlined text-[22px] shrink-0">history</span>
                <span>
                  Bản ghi gần đây của bạn
                  <span className="font-extrabold tabular-nums opacity-85"> ({recentForClassAll.length})</span>
                </span>
              </button>
              <p className="text-xs text-on-surface-variant sm:ml-auto sm:text-right max-w-md leading-snug">
                Lớp <span className={`font-bold ${pt.classCode}`}>{selectedClass?.code ?? '—'}</span>
                {selectedClass?.school_year ? (
                  <span className="text-on-surface-variant"> · {selectedClass.school_year}</span>
                ) : null}
              </p>
            </div>

            {conductPageTab === TAB_CLASS_LIST ? (
              <div id="conduct-panel-class-list" role="tabpanel" aria-labelledby="conduct-tab-class-list" className="flex flex-col min-h-0">
                <div className={`px-4 sm:px-5 py-3 border-b border-outline-variant/10 ${pt.cardBar} flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between`}>
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <span className="text-sm font-extrabold text-on-surface">Ghi nhận theo học sinh hoặc cả lớp</span>
                    <label className="flex items-center gap-2 min-w-0 max-w-md">
                      <span className="material-symbols-outlined text-on-surface-variant text-xl shrink-0" aria-hidden>
                        search
                      </span>
                      <input
                        type="search"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên hoặc mã HS…"
                        autoComplete="off"
                        className={`min-w-0 flex-1 rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 ${pt.selRing}`}
                        aria-label="Tìm học sinh trong lớp"
                      />
                    </label>
                  </div>
                  <div className={`flex rounded-xl p-1 bg-white/70 dark:bg-slate-900/50 border ${pt.tabBorder} gap-1 shrink-0`}>
                    <button
                      type="button"
                      onClick={() => setConductTarget('individual')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        conductTarget === 'individual'
                          ? pt.tabIndOn
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => setConductTarget('class')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        conductTarget === 'class' ? pt.tabClassOn : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                    >
                      Điểm lớp
                    </button>
                  </div>
                </div>
                {conductTarget === 'class' ? (
                  <div className={`px-4 sm:px-5 py-3 border-b border-outline-variant/10 ${pt.classPanel} flex flex-wrap items-center justify-between gap-3`}>
                    <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                      Ghi <span className="font-bold text-on-surface">một điểm tác phong cho cả lớp</span> (tập thể). Điểm này{' '}
                      <span className="font-bold text-on-surface">không</span> được cộng vào từng học sinh trong danh sách.
                    </p>
                    <button
                      type="button"
                      onClick={() => setClassModalOpen(true)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm shrink-0 ${pt.classBtn}`}
                    >
                      <span className="material-symbols-outlined text-lg">diversity_3</span>
                      Ghi nhận điểm lớp
                    </button>
                  </div>
                ) : null}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] table-fixed text-sm border-collapse">
                    <colgroup>
                      <col className="w-[8%]" />
                      <col className="w-[16%]" />
                      <col className={conductTarget === 'individual' ? 'w-[40%]' : 'w-[52%]'} />
                      <col className="w-[12%]" />
                      {conductTarget === 'individual' ? <col className="w-[24%]" /> : null}
                    </colgroup>
                    <thead>
                      <tr className={`text-left text-xs font-extrabold uppercase tracking-wide text-on-surface-variant ${pt.thead} border-b border-outline-variant/10`}>
                        <th className="px-4 py-3 align-middle text-center">STT</th>
                        <th className="px-4 py-3 align-middle">Mã HS</th>
                        <th className="px-4 py-3 align-middle">Họ tên</th>
                        <th className="px-4 py-3 align-middle text-center">Khối</th>
                        {conductTarget === 'individual' ? (
                          <th className="px-4 py-3 align-middle text-center">Tác phong</th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {activeStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={conductTarget === 'individual' ? 5 : 4}
                            className="px-4 py-10 text-center text-on-surface-variant"
                          >
                            Chưa có học sinh hoặc đang tải…
                          </td>
                        </tr>
                      ) : filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={conductTarget === 'individual' ? 5 : 4}
                            className="px-4 py-10 text-center text-on-surface-variant"
                          >
                            Không có học sinh khớp &quot;{String(studentSearchQuery).trim()}&quot;. Thử từ khóa khác.
                          </td>
                        </tr>
                      ) : (
                        pagedStudents.map((s, i) => (
                          <tr key={s.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50">
                            <td className="px-4 py-3 align-middle text-center text-on-surface-variant font-medium">
                              {studentSliceStart + i + 1}
                            </td>
                            <td className="px-4 py-3 align-middle font-mono text-xs truncate">{s.student_code ?? '—'}</td>
                            <td className="px-4 py-3 align-middle font-semibold truncate">{s.full_name ?? '—'}</td>
                            <td className="px-4 py-3 align-middle text-center text-on-surface-variant">
                              {s.grade != null ? `Khối ${s.grade}` : '—'}
                            </td>
                            {conductTarget === 'individual' ? (
                              <td className="px-4 py-3 align-middle text-center">
                                <button
                                  type="button"
                                  onClick={() => setModalStudent(s)}
                                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${pt.btnGhi}`}
                                >
                                  <span className="material-symbols-outlined text-base">edit_note</span>
                                  Ghi nhận
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <PortalTablePagination
                  from={studentFrom}
                  to={studentTo}
                  total={filteredStudents.length}
                  page={pageStudentList}
                  totalPages={totalPagesStudents}
                  onPageChange={setPageStudentList}
                  noun="học sinh"
                />
              </div>
            ) : (
              <div
                id="conduct-panel-recent"
                role="tabpanel"
                aria-labelledby="conduct-tab-recent"
                className="flex flex-col min-h-0"
              >
                <div className="p-4 sm:p-5 pb-2 shrink-0 space-y-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="min-w-0">
                      <h2 className="font-headline text-sm font-extrabold text-on-surface-variant uppercase tracking-wide mb-1">
                        Bản ghi gần đây của bạn (lớp này)
                      </h2>
                      <p className="text-xs text-on-surface-variant">
                        Sắp xếp mới nhất trước — toàn bộ bản ghi do bạn tạo cho lớp đang chọn.
                        {recentSearchQuery.trim() && recentFiltered.length !== recentForClassAll.length ? (
                          <span className="font-semibold text-on-surface">
                            {' '}
                            · Hiển thị {recentFiltered.length}/{recentForClassAll.length}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <label className="flex flex-col gap-1 text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    Tìm trong bản ghi
                    <div className="relative">
                      <span
                        className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none"
                        aria-hidden
                      >
                        search
                      </span>
                      <input
                        type="search"
                        value={recentSearchQuery}
                        onChange={(e) => setRecentSearchQuery(e.target.value)}
                        placeholder="Thời gian, học sinh, điểm lớp, tiêu chí, điểm…"
                        autoComplete="off"
                        className={`w-full pl-11 pr-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 ${pt.selRing}`}
                        aria-label="Tìm trong bản ghi gần đây"
                      />
                    </div>
                  </label>
                </div>
                {recentForClassAll.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-12 text-center border border-dashed border-outline-variant/25 rounded-xl mx-4 sm:mx-5 mb-4">
                    Chưa có bản ghi nào do bạn ghi cho lớp này.
                  </p>
                ) : recentFiltered.length === 0 ? (
                  <p className="text-sm text-on-surface-variant py-12 text-center border border-dashed border-outline-variant/25 rounded-xl mx-4 sm:mx-5 mb-4">
                    Không có bản ghi nào khớp «{recentSearchQuery.trim()}». Thử từ khóa khác hoặc xóa ô tìm kiếm.
                  </p>
                ) : (
                  <ul className="space-y-2 text-sm px-4 sm:px-5 pb-2">
                    {pagedRecentRows.map((row) =>
                      row.kind === 'class_level' ? (
                        <li
                          key={row.key}
                          className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-outline-variant/10 last:border-0"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-on-surface">
                              <span className="inline-flex items-center gap-1 text-teal-800 dark:text-teal-200 font-extrabold">
                                <span className="material-symbols-outlined text-base">diversity_3</span>
                                Điểm lớp
                              </span>
                              <span className="text-on-surface-variant font-normal"> · {row.r.criterion_name}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <ConductRecordImageStrip urls={row.r.image_urls} onOpen={openConductImages} />
                            <span
                              className={`font-bold tabular-nums min-w-[2.5rem] text-right ${row.r.type === 'penalty' ? 'text-rose-700 dark:text-rose-300' : pt.rewardPts}`}
                            >
                              {row.r.points > 0 ? `+${row.r.points}` : row.r.points}
                            </span>
                            <button
                              type="button"
                              disabled={(!isSaoDo && row.r.admin_flagged === true) || deleteBusyId === row.r.id}
                              title={
                                !isSaoDo && row.r.admin_flagged
                                  ? 'Đã gắn cờ — chỉ quản trị có thể xóa.'
                                  : 'Xóa bản ghi'
                              }
                              onClick={() => handleDeleteRecentRow(row)}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors disabled:opacity-40 disabled:pointer-events-none"
                              aria-label="Xóa bản ghi"
                            >
                              <span className="material-symbols-outlined text-lg leading-none">delete</span>
                            </button>
                          </div>
                        </li>
                      ) : (
                        <li
                          key={row.key}
                          className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-outline-variant/10 last:border-0"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-on-surface">
                              {row.r.student_name}
                              <span className="text-on-surface-variant font-normal"> · {row.r.criterion_name}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <ConductRecordImageStrip urls={row.r.image_urls} onOpen={openConductImages} />
                            <span
                              className={`font-bold tabular-nums min-w-[2.5rem] text-right ${row.r.type === 'penalty' ? 'text-rose-700 dark:text-rose-300' : pt.rewardPts}`}
                            >
                              {row.r.points > 0 ? `+${row.r.points}` : row.r.points}
                            </span>
                            <button
                              type="button"
                              disabled={(!isSaoDo && row.r.admin_flagged === true) || deleteBusyId === row.r.id}
                              title={
                                !isSaoDo && row.r.admin_flagged
                                  ? 'Đã gắn cờ — chỉ quản trị có thể xóa.'
                                  : 'Xóa bản ghi'
                              }
                              onClick={() => handleDeleteRecentRow(row)}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container/40 hover:text-error transition-colors disabled:opacity-40 disabled:pointer-events-none"
                              aria-label="Xóa bản ghi"
                            >
                              <span className="material-symbols-outlined text-lg leading-none">delete</span>
                            </button>
                          </div>
                        </li>
                      ),
                    )}
                  </ul>
                )}
                <PortalTablePagination
                  from={recentFrom}
                  to={recentTo}
                  total={recentFiltered.length}
                  page={pageRecentList}
                  totalPages={totalPagesRecent}
                  onPageChange={setPageRecentList}
                  noun="bản ghi"
                />
              </div>
            )}
          </div>
        )}

        <ConductImageLightbox
          open={imgLightbox.open}
          urls={imgLightbox.urls}
          startIndex={imgLightbox.startIndex}
          onClose={closeConductImages}
        />

        <TeacherConductRecordModal
          mode="individual"
          open={modalStudent != null}
          onClose={() => setModalStudent(null)}
          student={modalStudent}
          classMeta={selectedClass}
          schoolYear={schoolYear}
          criteria={criteria}
          teacherUid={teacherUid}
          teacherName={recorderDisplayName}
          onRecorded={handleRecorded}
          penaltiesOnly={isSaoDo}
        />

        <TeacherConductRecordModal
          mode="class"
          open={classModalOpen}
          onClose={() => setClassModalOpen(false)}
          classMeta={selectedClass}
          schoolYear={schoolYear}
          criteria={criteria}
          teacherUid={teacherUid}
          teacherName={recorderDisplayName}
          onRecorded={handleRecorded}
          penaltiesOnly={isSaoDo}
        />
      </div>
    </Shell>
  )
}
