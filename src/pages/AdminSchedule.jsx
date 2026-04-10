import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminShell from '../components/layout/AdminShell.jsx'
import { subscribeDutyAssignments } from '../lib/dutyAssignmentsFirestore.js'
import { subscribeDutyZones } from '../lib/dutyZonesFirestore.js'
import { buildSaoDoMemberRows, subscribeProfiles } from '../lib/userProfilesFirestore.js'
import ScheduleAssignModal from './schedule/ScheduleAssignModal.jsx'
import ScheduleGrid from './schedule/ScheduleGrid.jsx'
import ScheduleLegend from './schedule/ScheduleLegend.jsx'
import SchedulePageHeader from './schedule/SchedulePageHeader.jsx'
import ScheduleStatsCards from './schedule/ScheduleStatsCards.jsx'
import ScheduleToolbar from './schedule/ScheduleToolbar.jsx'
import ScheduleUnassignedPanel from './schedule/ScheduleUnassignedPanel.jsx'
import ScheduleZonesModal from './schedule/ScheduleZonesModal.jsx'
import { buildSchoolWeekColumns, formatWeekRangeLabel, getMondayForOffset, toDateKey } from './schedule/scheduleDateUtils.js'
import { areaKeyLabel, countAssignmentStats } from './schedule/scheduleMockData.js'

const WEEK_OFFSETS = [-1, 0, 1]

export default function AdminSchedule() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [shift, setShift] = useState('morning')
  const [areaFilter, setAreaFilter] = useState('all')

  const [dutyRows, setDutyRows] = useState([])
  const [profilesRaw, setProfilesRaw] = useState([])
  const [zonesAll, setZonesAll] = useState([])
  const [dutyError, setDutyError] = useState('')
  const [profilesError, setProfilesError] = useState('')
  const [zonesError, setZonesError] = useState('')

  const [assignModal, setAssignModal] = useState(null)
  const [zonesModalOpen, setZonesModalOpen] = useState(false)

  const today = useMemo(() => new Date(), [])
  const todayKey = toDateKey(today)

  const weekStartMonday = useMemo(() => getMondayForOffset(today, weekOffset), [today, weekOffset])
  const columns = useMemo(() => buildSchoolWeekColumns(weekStartMonday), [weekStartMonday])
  const rangeLabel = formatWeekRangeLabel(weekStartMonday)

  const weekDateKeys = useMemo(() => new Set(columns.map((c) => c.dateKey)), [columns])

  useEffect(() => {
    const u1 = subscribeDutyAssignments(
      (list) => {
        setDutyError('')
        setDutyRows(list)
      },
      (e) => setDutyError(e?.message ?? 'Không tải được lịch trực.'),
    )
    const u2 = subscribeProfiles(
      (list) => {
        setProfilesError('')
        setProfilesRaw(list)
      },
      (e) => setProfilesError(e?.message ?? 'Không tải được hồ sơ.'),
    )
    const u3 = subscribeDutyZones(
      (list) => {
        setZonesError('')
        setZonesAll(list)
      },
      (e) => setZonesError(e?.message ?? 'Không tải được danh sách khu vực.'),
    )
    return () => {
      u1()
      u2()
      u3()
    }
  }, [])

  const memberOptions = useMemo(() => buildSaoDoMemberRows(profilesRaw), [profilesRaw])

  const assignedUidsThisWeek = useMemo(() => {
    const u = new Set()
    for (const a of dutyRows) {
      if (!weekDateKeys.has(a.dateKey) || !a.memberUid) continue
      u.add(a.memberUid)
    }
    return u
  }, [dutyRows, weekDateKeys])

  const unassignedPool = useMemo(
    () =>
      memberOptions
        .filter((m) => !assignedUidsThisWeek.has(m.id))
        .map((m) => ({
          id: m.id,
          name: m.name,
          meta: [m.className !== '—' ? m.className : null, m.grade != null ? `Khối ${m.grade}` : null]
            .filter(Boolean)
            .join(' · ') || 'Sao Đỏ',
          avatarUrl: m.avatar,
        })),
    [memberOptions, assignedUidsThisWeek],
  )

  const weekOptions = useMemo(
    () =>
      WEEK_OFFSETS.map((offset) => {
        const mon = getMondayForOffset(today, offset)
        const tag =
          offset === -1 ? 'Tuần trước' : offset === 0 ? 'Tuần này' : 'Tuần sau'
        return {
          offset,
          label: `${tag} · ${formatWeekRangeLabel(mon)}`,
        }
      }),
    [today],
  )

  const weekLabelForHeader = useMemo(() => {
    const tag = weekOffset === -1 ? 'Tuần trước' : weekOffset === 0 ? 'Tuần này' : 'Tuần sau'
    return `${tag} · ${rangeLabel}`
  }, [weekOffset, rangeLabel])

  const activeZones = useMemo(() => zonesAll.filter((z) => z.is_active !== false), [zonesAll])

  const areaFilterOptions = useMemo(() => {
    const keys = [...new Set(activeZones.map((z) => z.areaId).filter(Boolean))]
    keys.sort((a, b) => a.localeCompare(b, 'vi'))
    const opts = [{ value: 'all', label: 'Tất cả khu' }]
    for (const k of keys) {
      opts.push({ value: k, label: areaKeyLabel(k) })
    }
    return opts
  }, [activeZones])

  useEffect(() => {
    setAreaFilter((cur) => {
      const allowed = new Set(areaFilterOptions.map((o) => o.value))
      return allowed.has(cur) ? cur : 'all'
    })
  }, [areaFilterOptions])

  const visibleZones = useMemo(() => {
    if (areaFilter === 'all') return activeZones
    return activeZones.filter((z) => z.areaId === areaFilter)
  }, [areaFilter, activeZones])

  const assignmentsForView = useMemo(() => {
    const zoneIds = new Set(visibleZones.map((z) => z.id))
    return dutyRows.filter(
      (a) => a.shift === shift && weekDateKeys.has(a.dateKey) && zoneIds.has(a.zoneId),
    )
  }, [dutyRows, shift, weekDateKeys, visibleZones])

  const stats = useMemo(
    () => countAssignmentStats(visibleZones, columns, assignmentsForView),
    [visibleZones, columns, assignmentsForView],
  )

  const loadError = dutyError || profilesError || zonesError

  const closeModal = useCallback(() => setAssignModal(null), [])

  const handleCellAdd = useCallback(({ zone, column }) => {
    setAssignModal({ mode: 'add', zone, column, shift })
  }, [shift])

  const handleCellEdit = useCallback(({ zone, column, assignment }) => {
    setAssignModal({ mode: 'edit', zone, column, shift, assignment })
  }, [shift])

  return (
    <AdminShell activeKey="lich-truc" headerTitle="Sao Đỏ · Lịch trực" searchPlaceholder="Tìm đội viên hoặc khu vực…">
      <ScheduleZonesModal
        open={zonesModalOpen}
        onClose={() => setZonesModalOpen(false)}
        zones={zonesAll}
        dutyAssignments={dutyRows}
      />

      <ScheduleAssignModal
        open={assignModal != null}
        onClose={closeModal}
        mode={assignModal?.mode ?? 'add'}
        zone={assignModal?.zone}
        column={assignModal?.column}
        shift={assignModal?.shift ?? shift}
        assignment={assignModal?.assignment}
        members={memberOptions}
      />

      <div className="print:shadow-none">
        {loadError ? (
          <div className="mb-6 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error font-semibold">
            {loadError}
          </div>
        ) : null}

        <SchedulePageHeader
          weekLabel={weekLabelForHeader}
          firebaseLive={!loadError}
          onManageZones={() => setZonesModalOpen(true)}
        />

        <div className="space-y-6 mb-6">
          <ScheduleToolbar
            weekOffset={weekOffset}
            onWeekOffsetChange={setWeekOffset}
            weekOptions={weekOptions}
            shift={shift}
            onShiftChange={setShift}
            areaFilter={areaFilter}
            onAreaFilterChange={setAreaFilter}
            areaFilterOptions={areaFilterOptions}
          />
          <ScheduleStatsCards filled={stats.filled} totalSlots={stats.totalSlots} empty={stats.empty} />
        </div>

        <div className="flex flex-col xl:flex-row gap-6 xl:items-start print:flex-col">
          <div className="flex-1 min-w-0 space-y-6 print:space-y-4">
            {activeZones.length === 0 && !loadError ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/40 p-8 text-center">
                <p className="font-headline text-lg font-extrabold text-primary">Chưa có khu vực trực</p>
                <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                  Thêm khu trong Firestore collection <span className="font-mono text-xs">duty_zones</span>, hoặc mở quản lý để
                  tạo thủ công / dùng bộ mẫu (cổng, khu A, sân).
                </p>
                <button
                  type="button"
                  onClick={() => setZonesModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">map</span>
                  Quản lý khu vực
                </button>
              </div>
            ) : (
              <ScheduleGrid
                zones={visibleZones}
                columns={columns}
                assignments={assignmentsForView}
                todayKey={todayKey}
                onCellAdd={handleCellAdd}
                onCellEdit={handleCellEdit}
              />
            )}
          </div>
          <aside className="w-full xl:w-[320px] shrink-0 flex flex-col gap-5 print:hidden">
            <ScheduleUnassignedPanel pool={unassignedPool} />
            <ScheduleLegend />
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
