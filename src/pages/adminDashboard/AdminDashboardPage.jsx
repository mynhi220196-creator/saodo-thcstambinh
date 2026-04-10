import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import { subscribeAllConductClassRecords } from '../../lib/conductClassRecordsFirestore.js'
import { subscribeAllConductScoreRecords } from '../../lib/conductScoreRecordsFirestore.js'
import { buildDashboardAggregates } from './adminDashboardAggregates.js'
import DashboardAnalyticsPanels from './DashboardAnalyticsPanels.jsx'
import { rangeForPreset } from './dashboardPresets.js'

export default function AdminDashboardPage() {
  const [scoreRaw, setScoreRaw] = useState([])
  const [classRaw, setClassRaw] = useState([])
  const [hydrated, setHydrated] = useState(false)
  const [loadError, setLoadError] = useState('')
  const loadGate = useRef({ score: false, class: false })

  const [preset, setPreset] = useState('30d')
  const [dateFrom, setDateFrom] = useState(() => rangeForPreset('30d').from)
  const [dateTo, setDateTo] = useState(() => rangeForPreset('30d').to)

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

  const agg = useMemo(
    () => buildDashboardAggregates(scoreRaw, classRaw, dateFrom, dateTo, 10),
    [scoreRaw, classRaw, dateFrom, dateTo],
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

  return (
    <AdminShell
      activeKey="dashboard"
      headerTitle="Dashboard · Tác phong"
      searchPlaceholder="Xem nhanh vi phạm, khen thưởng, xếp hạng…"
    >
      <div className="max-w-7xl mx-auto">
        <DashboardAnalyticsPanels
          theme="admin"
          agg={agg}
          sectionTitle="Tổng quan tác phong"
          sectionSubtitle="Biểu đồ vi phạm theo tiêu chí, tỷ lệ phạt/thưởng, và bảng xếp hạng cá nhân — lọc theo khoảng ngày. Dữ liệu realtime từ Firestore."
          detailLink={{ to: '/admin/score-records', label: 'Mở bản ghi điểm chi tiết' }}
          preset={preset}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onPickPreset={onPickPreset}
          onFromChange={onFromChange}
          onToChange={onToChange}
          hydrated={hydrated}
          loadError={loadError}
          showClassRewardLeaderboard
        />
      </div>
    </AdminShell>
  )
}
