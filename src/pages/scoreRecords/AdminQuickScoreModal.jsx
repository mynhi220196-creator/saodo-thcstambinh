import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'
import { buildSchoolYearOptions, currentSchoolYearValue } from '../../lib/academicYearOptions.js'
import { subscribeConductCriteria } from '../../lib/conductCriteriaFirestore.js'
import { addConductClassBulkRewardsForClasses } from '../../lib/conductClassRecordsFirestore.js'
import { subscribeClassesForSchoolYear, subscribeStudentsByClassId } from '../../lib/organizationFirestore.js'
import TeacherConductRecordModal from '../teacherPortal/TeacherConductRecordModal.jsx'

export default function AdminQuickScoreModal({ open, onClose, onRecorded }) {
  const { user, profile } = useAuth()
  const adminUid = user?.id ?? ''
  const adminName = useMemo(() => {
    const fn = String(profile?.full_name ?? '').trim()
    if (fn) return fn
    const dn = String(user?.displayName ?? '').trim()
    if (dn) return dn
    const em = String(user?.email ?? '').trim()
    if (em) return em
    return 'Quản trị'
  }, [profile?.full_name, user?.displayName, user?.email])

  const yearOptions = useMemo(() => buildSchoolYearOptions(8), [])
  const [schoolYear, setSchoolYear] = useState(currentSchoolYearValue)

  const [classes, setClasses] = useState([])
  const [classesError, setClassesError] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('')

  const [students, setStudents] = useState([])
  const [criteria, setCriteria] = useState([])
  const [criteriaError, setCriteriaError] = useState('')

  /** `single_class`: chọn một lớp. `all_classes`: cộng điểm lớp cho mọi lớp của năm học. */
  const [scopeMode, setScopeMode] = useState('single_class')
  const [conductTarget, setConductTarget] = useState('individual')
  const [modalStudent, setModalStudent] = useState(null)
  const [classModalOpen, setClassModalOpen] = useState(false)

  const [allClassesTitle, setAllClassesTitle] = useState('')
  const [allClassesPoints, setAllClassesPoints] = useState('')
  const [allClassesBusy, setAllClassesBusy] = useState(false)
  const [allClassesError, setAllClassesError] = useState('')

  useEffect(() => {
    if (!open) return
    setSchoolYear(currentSchoolYearValue())
    setSelectedClassId('')
    setScopeMode('single_class')
    setConductTarget('individual')
    setModalStudent(null)
    setClassModalOpen(false)
    setClassesError('')
    setCriteriaError('')
    setAllClassesTitle('')
    setAllClassesPoints('')
    setAllClassesBusy(false)
    setAllClassesError('')
  }, [open, yearOptions])

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
    return subscribeStudentsByClassId(selectedClassId, setStudents, () => {})
  }, [selectedClassId])

  useEffect(() => {
    setSelectedClassId('')
  }, [schoolYear])

  useEffect(() => {
    setClassModalOpen(false)
  }, [selectedClassId])

  useEffect(() => {
    if (!selectedClassId || !activeClasses.some((c) => c.id === selectedClassId)) {
      setSelectedClassId('')
    }
  }, [activeClasses, selectedClassId])

  const activeStudents = useMemo(
    () => students.filter((s) => s.is_active !== false && s.is_deleted !== true),
    [students],
  )

  const handleRecorded = useCallback(() => {
    onRecorded?.()
  }, [onRecorded])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape' && !modalStudent && !classModalOpen && !allClassesBusy) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, modalStudent, classModalOpen, allClassesBusy])

  async function handleApplyAllClassesReward() {
    setAllClassesError('')
    const title = allClassesTitle.trim()
    const pts = Number(String(allClassesPoints).replace(',', '.'))
    if (!title) {
      setAllClassesError('Nhập tiêu đề.')
      return
    }
    if (!Number.isFinite(pts) || pts <= 0) {
      setAllClassesError('Số điểm phải là số dương.')
      return
    }
    if (!adminUid) {
      setAllClassesError('Chưa đăng nhập.')
      return
    }
    const n = activeClasses.length
    if (n === 0) {
      setAllClassesError('Không có lớp hoạt động cho năm học này.')
      return
    }
    const ok = window.confirm(
      `Tạo ${n} bản ghi điểm lớp (mỗi lớp +${pts} điểm) với tiêu đề:\n«${title}»\n\nTiếp tục?`,
    )
    if (!ok) return
    setAllClassesBusy(true)
    try {
      await addConductClassBulkRewardsForClasses(
        activeClasses.map((c) => ({ id: c.id, code: c.code })),
        {
          school_year: schoolYear,
          title,
          points: pts,
          recorded_by: adminUid,
          recorded_by_name: adminName,
        },
      )
      handleRecorded()
      onClose()
    } catch (e) {
      setAllClassesError(e?.message ?? 'Không ghi được. Kiểm tra quyền và kết nối.')
    } finally {
      setAllClassesBusy(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[115] flex items-center justify-center p-3 sm:p-4">
        <button
          type="button"
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm disabled:cursor-not-allowed"
          aria-label="Đóng"
          disabled={allClassesBusy}
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-quick-score-title"
          className="relative w-full max-w-3xl max-h-[min(92vh,720px)] overflow-hidden flex flex-col rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl"
        >
          <div className="px-4 py-3 border-b border-outline-variant/10 shrink-0 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 id="admin-quick-score-title" className="font-headline text-lg font-extrabold text-primary">
                Ghi điểm nhanh
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Theo lớp: ghi học sinh hoặc điểm tập thể. Hoặc cộng điểm lớp (+) cùng lúc cho mọi lớp của năm học.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={allClassesBusy}
              className="shrink-0 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high disabled:opacity-40"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
            <div className="flex rounded-xl p-1 bg-surface-container-high border border-outline-variant/15 gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setScopeMode('single_class')}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-extrabold transition-all ${
                  scopeMode === 'single_class'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Theo một lớp
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('all_classes')}
                className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg text-xs font-extrabold transition-all ${
                  scopeMode === 'all_classes'
                    ? 'bg-amber-700 text-white shadow-sm dark:bg-amber-600'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Mọi lớp trong năm
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Năm học</label>
                <select
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  disabled={allClassesBusy}
                  className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-primary/25 disabled:opacity-50"
                >
                  {yearOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              {scopeMode === 'single_class' ? (
                <div className="flex flex-col gap-1 flex-[2] min-w-0">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Lớp</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="bg-surface-container-high border border-outline-variant/20 rounded-xl text-sm font-semibold px-3 py-2.5 focus:ring-2 focus:ring-primary/25"
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
              ) : (
                <div className="flex flex-col gap-1 flex-[2] min-w-0 justify-end pb-0.5">
                  <p className="text-xs font-semibold text-on-surface-variant">
                    <span className="tabular-nums text-primary font-extrabold">{activeClasses.length}</span> lớp hoạt động
                    trong năm này
                  </p>
                </div>
              )}
            </div>

            {scopeMode === 'all_classes' ? (
              <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-3">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Tạo <span className="font-bold text-on-surface">một bản ghi điểm lớp (+)</span> cho{' '}
                  <span className="font-bold text-on-surface">từng lớp</span> (điểm tập thể — không cộng vào từng học
                  sinh), cùng tiêu đề và số điểm.
                </p>
                <div className="space-y-1.5">
                  <label htmlFor="admin-bulk-all-title" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Tiêu đề
                  </label>
                  <input
                    id="admin-bulk-all-title"
                    type="text"
                    value={allClassesTitle}
                    onChange={(e) => setAllClassesTitle(e.target.value)}
                    disabled={allClassesBusy}
                    placeholder="Ví dụ: Thi đua 20/11 — toàn trường"
                    maxLength={200}
                    className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-amber-500/25 disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5 max-w-[200px]">
                  <label htmlFor="admin-bulk-all-points" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    Điểm cộng (+)
                  </label>
                  <input
                    id="admin-bulk-all-points"
                    type="number"
                    inputMode="decimal"
                    min={0.01}
                    step="any"
                    value={allClassesPoints}
                    onChange={(e) => setAllClassesPoints(e.target.value)}
                    disabled={allClassesBusy}
                    placeholder="5"
                    className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3 py-2.5 text-sm font-extrabold tabular-nums focus:ring-2 focus:ring-amber-500/25 disabled:opacity-50"
                  />
                </div>
                {allClassesError ? (
                  <p className="text-xs font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{allClassesError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={handleApplyAllClassesReward}
                  disabled={allClassesBusy || !adminUid}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-extrabold bg-amber-700 text-white hover:bg-amber-800 disabled:opacity-50"
                >
                  {allClassesBusy ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-pulse">hourglass_empty</span>
                      Đang ghi…
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">playlist_add</span>
                      Áp dụng cho tất cả lớp
                    </>
                  )}
                </button>
              </div>
            ) : null}

            {classesError ? (
              <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{classesError}</p>
            ) : null}
            {criteriaError ? (
              <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{criteriaError}</p>
            ) : null}

            {scopeMode === 'single_class' && !selectedClassId ? (
              <p className="text-sm text-on-surface-variant text-center py-8 border border-dashed border-outline-variant/25 rounded-xl">
                Chọn lớp để hiện danh sách học sinh.
              </p>
            ) : scopeMode === 'single_class' && selectedClassId ? (
              <div className="rounded-xl border border-outline-variant/15 overflow-hidden">
                <div className="px-3 py-2.5 bg-surface-container-high/80 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-on-surface">
                    Lớp <span className="text-primary">{selectedClass?.code ?? '—'}</span>
                    <span className="text-on-surface-variant font-semibold ml-2">{activeStudents.length} học sinh</span>
                  </span>
                  <div className="flex rounded-lg p-0.5 bg-surface-container-lowest border border-outline-variant/15 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setConductTarget('individual')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold ${
                        conductTarget === 'individual'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-on-surface-variant'
                      }`}
                    >
                      Cá nhân
                    </button>
                    <button
                      type="button"
                      onClick={() => setConductTarget('class')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold ${
                        conductTarget === 'class' ? 'bg-teal-700 text-white shadow-sm' : 'text-on-surface-variant'
                      }`}
                    >
                      Điểm lớp
                    </button>
                  </div>
                </div>
                {conductTarget === 'class' ? (
                  <div className="px-3 py-3 bg-teal-50/50 dark:bg-teal-950/20 border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-on-surface-variant max-w-xl">
                      Một bản ghi cho <span className="font-bold text-on-surface">cả lớp</span> — không cộng vào từng học sinh.
                    </p>
                    <button
                      type="button"
                      onClick={() => setClassModalOpen(true)}
                      disabled={!adminUid}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">diversity_3</span>
                      Ghi nhận điểm lớp
                    </button>
                  </div>
                ) : null}
                <div className="overflow-x-auto max-h-[min(40vh,320px)] overflow-y-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead className="sticky top-0 bg-surface-container-high/95 text-xs font-extrabold uppercase text-on-surface-variant border-b border-outline-variant/10">
                      <tr>
                        <th className="px-3 py-2 text-center w-10">#</th>
                        <th className="px-3 py-2 text-left">Mã HS</th>
                        <th className="px-3 py-2 text-left">Họ tên</th>
                        {conductTarget === 'individual' ? <th className="px-3 py-2 text-center w-28">Thao tác</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {activeStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={conductTarget === 'individual' ? 4 : 3}
                            className="px-3 py-8 text-center text-on-surface-variant"
                          >
                            Chưa có học sinh hoặc đang tải…
                          </td>
                        </tr>
                      ) : (
                        activeStudents.map((s, i) => (
                          <tr key={s.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/40">
                            <td className="px-3 py-2 text-center text-on-surface-variant">{i + 1}</td>
                            <td className="px-3 py-2 font-mono text-xs">{s.student_code ?? '—'}</td>
                            <td className="px-3 py-2 font-medium truncate max-w-[200px]">{s.full_name ?? '—'}</td>
                            {conductTarget === 'individual' ? (
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => setModalStudent(s)}
                                  disabled={!adminUid}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                                >
                                  Ghi
                                </button>
                              </td>
                            ) : null}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
            {!adminUid ? (
              <p className="text-xs font-semibold text-amber-800 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
                Chưa đăng nhập — không thể ghi điểm.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <TeacherConductRecordModal
        mode="individual"
        open={modalStudent != null}
        onClose={() => setModalStudent(null)}
        student={modalStudent}
        classMeta={selectedClass}
        schoolYear={schoolYear}
        criteria={criteria}
        teacherUid={adminUid}
        teacherName={adminName}
        onRecorded={handleRecorded}
      />

      <TeacherConductRecordModal
        mode="class"
        open={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        classMeta={selectedClass}
        schoolYear={schoolYear}
        criteria={criteria}
        teacherUid={adminUid}
        teacherName={adminName}
        onRecorded={handleRecorded}
      />
    </>
  )
}
