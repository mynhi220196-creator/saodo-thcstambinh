import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import TeacherShell from '../../components/layout/TeacherShell.jsx'
import { buildDashboardAggregates } from '../adminDashboard/adminDashboardAggregates.js'
import DashboardAnalyticsPanels from '../adminDashboard/DashboardAnalyticsPanels.jsx'
import { rangeForPreset } from '../adminDashboard/dashboardPresets.js'
import { subscribeConductClassRecordsByClassId } from '../../lib/conductClassRecordsFirestore.js'
import { subscribeConductScoreRecordsByClassId } from '../../lib/conductScoreRecordsFirestore.js'
import { subscribeHomeroomClassesForTeacher } from '../../lib/organizationFirestore.js'
import { subscribeLatestWeeklyRanking } from '../../lib/weeklyRankingFirestore.js'
import WeeklyHonorBoard from '../../components/WeeklyHonorBoard.jsx'
import RankBadge from '../../components/RankBadge.jsx'

export default function TeacherDashboardPage() {
  const { user, profile } = useAuth()
  const uid = user?.id ?? ''
  const name = profile?.full_name?.trim() || 'Thầy/Cô'

  const [weeklyRanking, setWeeklyRanking] = useState(null)
  useEffect(() => subscribeLatestWeeklyRanking(setWeeklyRanking, () => {}), [])

  const [homeroomRaw, setHomeroomRaw] = useState([])
  const [classesHydrated, setClassesHydrated] = useState(false)
  const [classesError, setClassesError] = useState('')

  const [scoreMap, setScoreMap] = useState({})
  const [classRecMap, setClassRecMap] = useState({})
  const [conductHydrated, setConductHydrated] = useState(false)
  const [conductError, setConductError] = useState('')

  const [classScope, setClassScope] = useState('all')
  const [preset, setPreset] = useState('30d')
  const [dateFrom, setDateFrom] = useState(() => rangeForPreset('30d').from)
  const [dateTo, setDateTo] = useState(() => rangeForPreset('30d').to)

  const activeHomeroom = useMemo(
    () => homeroomRaw.filter((c) => c.is_deleted !== true && c.is_active !== false),
    [homeroomRaw],
  )

  const homeroomIdsKey = useMemo(
    () => activeHomeroom.map((c) => c.id).sort().join('\0'),
    [activeHomeroom],
  )

  const homeroomIds = useMemo(() => activeHomeroom.map((c) => c.id), [activeHomeroom])

  /** Huy hiệu lớp CN đạt được trong BXH tuần đã công bố. */
  const earnedBadges = useMemo(() => {
    const ids = new Set(homeroomIds)
    return (weeklyRanking?.entries ?? []).filter((e) => ids.has(e.class_id) && e.rank_name)
  }, [weeklyRanking, homeroomIds])

  useEffect(() => {
    if (!uid) {
      setHomeroomRaw([])
      setClassesHydrated(true)
      setClassesError('')
      return undefined
    }
    setClassesHydrated(false)
    return subscribeHomeroomClassesForTeacher(
      uid,
      (list) => {
        setClassesError('')
        setHomeroomRaw(list)
        setClassesHydrated(true)
      },
      (e) => {
        setHomeroomRaw([])
        setClassesError(e?.message ?? 'Không tải được danh sách lớp chủ nhiệm.')
        setClassesHydrated(true)
      },
    )
  }, [uid])

  useEffect(() => {
    if (classScope !== 'all' && !activeHomeroom.some((c) => c.id === classScope)) {
      setClassScope('all')
    }
  }, [activeHomeroom, classScope])

  const conductGate = useRef(false)

  useEffect(() => {
    setScoreMap({})
    setClassRecMap({})
    setConductHydrated(activeHomeroom.length === 0)
    setConductError('')
    conductGate.current = false

    if (activeHomeroom.length === 0) return undefined

    const done = new Set()
    const pending = new Set()
    for (const c of activeHomeroom) {
      pending.add(`${c.id}:s`)
      pending.add(`${c.id}:c`)
    }

    const markAllReady = () => {
      if (conductGate.current) return
      conductGate.current = true
      setConductHydrated(true)
    }

    const tryMark = (tag) => {
      if (done.has(tag)) return
      done.add(tag)
      pending.delete(tag)
      if (pending.size === 0) markAllReady()
    }

    const cleanups = []
    for (const cl of activeHomeroom) {
      const id = cl.id
      cleanups.push(
        subscribeConductScoreRecordsByClassId(
          id,
          (list) => {
            setScoreMap((prev) => ({ ...prev, [id]: list }))
            tryMark(`${id}:s`)
          },
          (e) => {
            setScoreMap((prev) => ({ ...prev, [id]: [] }))
            tryMark(`${id}:s`)
            setConductError((prev) => prev || e?.message || 'Không tải được điểm cá nhân lớp.')
          },
        ),
      )
      cleanups.push(
        subscribeConductClassRecordsByClassId(
          id,
          (list) => {
            setClassRecMap((prev) => ({ ...prev, [id]: list }))
            tryMark(`${id}:c`)
          },
          (e) => {
            setClassRecMap((prev) => ({ ...prev, [id]: [] }))
            tryMark(`${id}:c`)
            setConductError((prev) => prev || e?.message || 'Không tải được điểm lớp.')
          },
        ),
      )
    }
    return () => cleanups.forEach((u) => u())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ đăng ký lại khi danh sách id lớp CN đổi
  }, [homeroomIdsKey])

  const mergedScore = useMemo(() => {
    if (classScope === 'all') return activeHomeroom.flatMap((c) => scoreMap[c.id] ?? [])
    return scoreMap[classScope] ?? []
  }, [activeHomeroom, scoreMap, classScope])

  const mergedClassRec = useMemo(() => {
    if (classScope === 'all') return activeHomeroom.flatMap((c) => classRecMap[c.id] ?? [])
    return classRecMap[classScope] ?? []
  }, [activeHomeroom, classRecMap, classScope])

  const agg = useMemo(
    () => buildDashboardAggregates(mergedScore, mergedClassRec, dateFrom, dateTo, 10),
    [mergedScore, mergedClassRec, dateFrom, dateTo],
  )

  const onPickPreset = (id) => {
    setPreset(id)
    const r = rangeForPreset(id)
    setDateFrom(r.from)
    setDateTo(r.to)
  }

  const onFromChange = (v) => {
    setPreset('custom')
    setDateFrom(v)
  }

  const onToChange = (v) => {
    setPreset('custom')
    setDateTo(v)
  }

  const cards = useMemo(
    () => [
      {
        to: '/giao-vien/lop-hoc',
        icon: 'class',
        title: 'Lớp của tôi',
        desc: 'Xem lớp chủ nhiệm và danh sách học sinh.',
        tone: 'from-emerald-600 to-teal-700',
      },
      {
        to: '/giao-vien/tac-phong',
        icon: 'fact_check',
        title: 'Ghi nhận tác phong',
        desc: 'Điểm cá nhân hoặc điểm tác phong của cả lớp (tập thể).',
        tone: 'from-teal-600 to-cyan-700',
      },
    ],
    [],
  )

  const hasHomeroom = activeHomeroom.length > 0
  const pageHydrated = classesHydrated && (!hasHomeroom || conductHydrated)
  const pageError = classesError || conductError

  const scopeSelect = hasHomeroom ? (
    <label className="flex flex-col gap-1.5 max-w-md">
      <span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Phạm vi lớp</span>
      <select
        value={classScope}
        onChange={(e) => setClassScope(e.target.value)}
        className="rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-surface-container-lowest px-3 py-2.5 text-sm font-semibold text-on-surface shadow-sm focus:ring-2 focus:ring-emerald-600/25"
        aria-label="Chọn lớp chủ nhiệm"
      >
        <option value="all">Tất cả lớp chủ nhiệm ({activeHomeroom.length})</option>
        {activeHomeroom.map((cl) => (
          <option key={cl.id} value={cl.id}>
            {cl.code?.trim() || '—'}
            {cl.school_year ? ` · ${cl.school_year}` : ''}
            {cl.name?.trim() ? ` — ${cl.name.trim()}` : ''}
          </option>
        ))}
      </select>
      <span className="text-xs text-on-surface-variant">
        Gộp số liệu nhiều lớp hoặc chỉ xem một lớp.{' '}
        {classScope !== 'all' ? (
          <Link to={`/giao-vien/lop-hoc/${classScope}`} className="font-bold text-emerald-800 dark:text-emerald-300 hover:underline">
            Mở danh sách học sinh lớp này
          </Link>
        ) : null}
      </span>
    </label>
  ) : null

  return (
    <TeacherShell activeKey="dashboard" headerTitle="Dashboard" searchPlaceholder="Tìm học sinh…">
      <div className="max-w-7xl w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100">
            Cổng Giáo viên
          </span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#0d5c3f] dark:text-emerald-300">Tổng quan</span>
        </div>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-[#0d5c3f] dark:text-emerald-100 tracking-tight">
          Xin chào, {name}
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl text-sm sm:text-base leading-relaxed">
          Đây là bảng điều khiển dành cho giáo viên: theo dõi lớp chủ nhiệm và chuẩn bị ghi nhận tác phong theo tiêu chí nhà trường.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative overflow-hidden rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 bg-surface-container-lowest p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div
                className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 bg-gradient-to-br ${c.tone}`}
                aria-hidden
              />
              <span
                className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.tone} text-white shadow-md`}
              >
                <span className="material-symbols-outlined text-[26px]">{c.icon}</span>
              </span>
              <h2 className="font-headline text-lg font-extrabold text-on-surface mt-4 group-hover:text-[#0d5c3f] dark:group-hover:text-emerald-200 transition-colors">
                {c.title}
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-snug">{c.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-4">
                Mở ngay
                <span className="material-symbols-outlined text-lg group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </span>
            </Link>
          ))}
        </div>

        {weeklyRanking ? (
          <div className="mt-14 pt-10 border-t border-emerald-100/80 dark:border-emerald-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="font-headline text-xl font-extrabold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                    trophy
                  </span>
                  Vinh danh thi đua tuần
                </h2>
                {earnedBadges.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm text-on-surface-variant">Lớp của bạn đạt:</span>
                    {earnedBadges.map((e) => (
                      <span key={e.class_id} className="inline-flex items-center gap-1.5">
                        <span className="text-sm font-bold text-on-surface">{e.class_code}</span>
                        <RankBadge name={e.rank_name} icon={e.rank_icon} color={e.rank_color} size="sm" />
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant mt-1">
                    Xếp hạng toàn trường tuần này — lớp chủ nhiệm của bạn được tô sáng.
                  </p>
                )}
              </div>
              <Link
                to="/vinh-danh"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm font-bold hover:bg-amber-50 dark:hover:bg-amber-950/30 shrink-0"
              >
                <span className="material-symbols-outlined text-lg">cast</span>
                Mở màn hình vinh danh
              </Link>
            </div>
            <WeeklyHonorBoard ranking={weeklyRanking} highlightClassIds={homeroomIds} />
          </div>
        ) : null}

        {hasHomeroom ? (
          <div className="mt-14 pt-10 border-t border-emerald-100/80 dark:border-emerald-900/40">
            <DashboardAnalyticsPanels
              theme="teacher"
              agg={agg}
              sectionTitle="Tác phong · Lớp chủ nhiệm"
              sectionSubtitle="Thống kê realtime theo (các) lớp bạn làm GVCN. Chọn một lớp trong «Phạm vi lớp» để lọc biểu đồ và bảng xếp hạng."
              detailLink={{ to: '/giao-vien/tac-phong', label: 'Ghi nhận tác phong' }}
              filterTopSlot={scopeSelect}
              dateHint="Để trống một đầu = không giới hạn phía đó. «Toàn bộ» = mọi bản ghi của (các) lớp đã tải."
              preset={preset}
              dateFrom={dateFrom}
              dateTo={dateTo}
              onPickPreset={onPickPreset}
              onFromChange={onFromChange}
              onToChange={onToChange}
              hydrated={pageHydrated}
              loadError={pageError}
              showClassRewardLeaderboard={classScope === 'all' && activeHomeroom.length > 1}
            />
          </div>
        ) : classesHydrated ? (
          <div className="mt-14 pt-10 border-t border-dashed border-emerald-200/80 dark:border-emerald-900/50">
            <div className="rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-emerald-600/60">bar_chart</span>
              <p className="font-headline text-lg font-extrabold text-on-surface mt-3">Chưa có lớp chủ nhiệm</p>
              <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                Khi quản trị gán bạn làm GVCN trong mục Lớp học, biểu đồ tác phong và bảng xếp hạng sẽ hiển thị tại đây.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </TeacherShell>
  )
}
