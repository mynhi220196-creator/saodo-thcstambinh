import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DateInputVN from '../../components/DateInputVN.jsx'
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { DASHBOARD_PRESET_BTNS } from './dashboardPresets.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)
const LEADERBOARD_PAGE_SIZE = 5

function StatTile({ icon, label, value, sub, theme }) {
  const iconTone =
    theme === 'teacher'
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-primary'
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={`material-symbols-outlined text-2xl shrink-0 ${iconTone}`}>{icon}</span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{label}</p>
          <p className="text-2xl font-headline font-extrabold text-on-surface tabular-nums mt-1">{value}</p>
          {sub ? <p className="text-xs text-on-surface-variant mt-1">{sub}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default function DashboardAnalyticsPanels({
  theme = 'admin',
  agg,
  sectionTitle,
  sectionSubtitle,
  detailLink,
  filterTopSlot = null,
  dateHint = 'Để trống một đầu = không giới hạn phía đó. Toàn bộ = mọi bản ghi đã tải.',
  preset,
  dateFrom,
  dateTo,
  onPickPreset,
  onFromChange,
  onToChange,
  hydrated,
  loadError,
  showClassRewardLeaderboard = true,
}) {
  const [pageLow, setPageLow] = useState(1)
  const [pageExcellent, setPageExcellent] = useState(1)
  const [pageClass, setPageClass] = useState(1)

  const presetActive =
    theme === 'teacher'
      ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
      : 'bg-primary text-white shadow-sm'
  const presetIdle =
    theme === 'teacher'
      ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50'
      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
  const ringFocus =
    theme === 'teacher' ? 'focus:ring-2 focus:ring-emerald-600/25' : 'focus:ring-2 focus:ring-primary/20'
  const rankHeaderClass =
    theme === 'teacher'
      ? 'bg-primary-fixed/40 border-emerald-100/50 dark:border-emerald-900/30'
      : 'bg-primary-fixed/40'

  const violationsChartData = useMemo(() => {
    const rows = agg.topViolations
    return {
      labels: rows.map((v) => (v.label.length > 44 ? `${v.label.slice(0, 42)}…` : v.label)),
      datasets: [
        {
          label: 'Số lần',
          data: rows.map((v) => v.count),
          backgroundColor: 'rgba(186, 26, 26, 0.82)',
          borderRadius: 8,
          maxBarThickness: 22,
        },
      ],
    }
  }, [agg.topViolations])

  const splitChartData = useMemo(
    () => ({
      labels: ['Bản ghi vi phạm', 'Bản ghi khen thưởng'],
      datasets: [
        {
          data: [agg.totals.penaltyCount, agg.totals.rewardCount],
          backgroundColor: ['#c62828', '#2e7d32'],
          borderWidth: 0,
        },
      ],
    }),
    [agg.totals.penaltyCount, agg.totals.rewardCount],
  )

  const barOptions = useMemo(
    () => ({
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Vi phạm thường gặp (theo tiêu chí)',
          font: { size: 14, weight: '600' },
          color: '#434651',
        },
        tooltip: {
          callbacks: {
            title(items) {
              const i = items[0]?.dataIndex
              if (i == null) return ''
              return agg.topViolations[i]?.label ?? ''
            },
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, precision: 0 },
          grid: { color: 'rgba(0,0,0,0.06)' },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } },
        },
      },
    }),
    [agg.topViolations],
  )

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 12, padding: 16, font: { size: 12 } },
        },
        title: {
          display: true,
          text: 'Cơ cấu bản ghi trong khoảng',
          font: { size: 14, weight: '600' },
          color: '#434651',
        },
      },
    }),
    [],
  )

  const hasAnyRecords = agg.totals.recordCount > 0
  const hasViolationsChart = agg.topViolations.length > 0

  useEffect(() => {
    setPageLow(1)
    setPageExcellent(1)
    setPageClass(1)
  }, [preset, dateFrom, dateTo])

  const lowTotalPages = Math.max(1, Math.ceil(agg.topLowIndividuals.length / LEADERBOARD_PAGE_SIZE))
  const lowSafePage = Math.min(Math.max(1, pageLow), lowTotalPages)
  const lowStart = (lowSafePage - 1) * LEADERBOARD_PAGE_SIZE
  const lowRows = agg.topLowIndividuals.slice(lowStart, lowStart + LEADERBOARD_PAGE_SIZE)

  const excellentTotalPages = Math.max(1, Math.ceil(agg.topExcellentIndividuals.length / LEADERBOARD_PAGE_SIZE))
  const excellentSafePage = Math.min(Math.max(1, pageExcellent), excellentTotalPages)
  const excellentStart = (excellentSafePage - 1) * LEADERBOARD_PAGE_SIZE
  const excellentRows = agg.topExcellentIndividuals.slice(excellentStart, excellentStart + LEADERBOARD_PAGE_SIZE)

  const classTotalPages = Math.max(1, Math.ceil(agg.topRewardClasses.length / LEADERBOARD_PAGE_SIZE))
  const classSafePage = Math.min(Math.max(1, pageClass), classTotalPages)
  const classStart = (classSafePage - 1) * LEADERBOARD_PAGE_SIZE
  const classRows = agg.topRewardClasses.slice(classStart, classStart + LEADERBOARD_PAGE_SIZE)

  useEffect(() => {
    setPageLow((p) => Math.min(p, lowTotalPages))
  }, [lowTotalPages])
  useEffect(() => {
    setPageExcellent((p) => Math.min(p, excellentTotalPages))
  }, [excellentTotalPages])
  useEffect(() => {
    setPageClass((p) => Math.min(p, classTotalPages))
  }, [classTotalPages])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-on-surface">{sectionTitle}</h2>
          {sectionSubtitle ? (
            <p className="text-sm text-on-surface-variant mt-1 max-w-xl">{sectionSubtitle}</p>
          ) : null}
        </div>
        {detailLink ? (
          <Link
            to={detailLink.to}
            className={`inline-flex items-center gap-2 text-sm font-bold shrink-0 ${
              theme === 'teacher'
                ? 'text-emerald-800 dark:text-emerald-300 hover:underline'
                : 'text-primary hover:underline'
            }`}
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            {detailLink.label}
          </Link>
        ) : null}
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 sm:p-5 shadow-sm space-y-4">
        {filterTopSlot ? (
          <div className="space-y-2 pb-2 border-b border-outline-variant/10">{filterTopSlot}</div>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">Khoảng thời gian</p>
        <div className="flex flex-wrap gap-2">
          {DASHBOARD_PRESET_BTNS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => onPickPreset(b.id)}
              className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-colors ${
                preset === b.id ? presetActive : presetIdle
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex min-w-[11rem] shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            Từ ngày
            <DateInputVN value={dateFrom} onChange={onFromChange} />
          </label>
          <label className="flex min-w-[11rem] shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant">
            Đến ngày
            <DateInputVN value={dateTo} onChange={onToChange} />
          </label>
          <p className="text-xs text-on-surface-variant pb-2">{dateHint}</p>
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
        <StatTile theme={theme} icon="lists" label="Bản ghi trong khoảng" value={agg.totals.recordCount} />
        <StatTile
          theme={theme}
          icon="gavel"
          label="Lần vi phạm (ghi nhận)"
          value={agg.totals.penaltyCount}
          sub={`Tổng điểm trừ (giá trị tuyệt đối): ${agg.totals.sumPenaltyPoints}`}
        />
        <StatTile
          theme={theme}
          icon="verified"
          label="Lần khen thưởng"
          value={agg.totals.rewardCount}
          sub={`Tổng điểm cộng: ${agg.totals.sumRewardPoints}`}
        />
        <StatTile
          theme={theme}
          icon="school"
          label="Lớp có điểm thưởng"
          value={agg.totals.rewardClassCount}
          sub="Số lớp có ít nhất một lần cộng điểm"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 sm:p-6 shadow-sm min-h-[320px]">
          {hasViolationsChart ? (
            <div className="h-[min(420px,55vh)]">
              <Bar data={violationsChartData} options={barOptions} />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-on-surface-variant text-sm px-4">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-40">bar_chart</span>
              {hasAnyRecords
                ? 'Không có bản ghi vi phạm trong khoảng đã chọn.'
                : 'Chưa có bản ghi nào trong khoảng đã chọn.'}
            </div>
          )}
        </div>
        <div className="xl:col-span-2 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 sm:p-6 shadow-sm min-h-[280px]">
          {agg.totals.penaltyCount + agg.totals.rewardCount > 0 ? (
            <div className="h-[min(360px,50vh)] max-w-sm mx-auto">
              <Doughnut data={splitChartData} options={doughnutOptions} />
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-40">pie_chart</span>
              Chưa có dữ liệu để vẽ biểu đồ cơ cấu.
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${showClassRewardLeaderboard ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}
      >
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-outline-variant/10 bg-error-container/15">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-error">trending_down</span>
              Cá nhân điểm tổng thấp
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Theo tổng điểm có dấu (+/−) từ bản ghi cá nhân.</p>
          </div>
          <ul className="divide-y divide-outline-variant/10">
            {agg.topLowIndividuals.length === 0 ? (
              <li className="px-5 py-8 text-sm text-on-surface-variant text-center">Không có dữ liệu.</li>
            ) : (
              lowRows.map((s, i) => (
                <li key={s.key} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-xs font-black text-on-surface-variant w-6 tabular-nums">{lowStart + i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-on-surface truncate">{s.name}</p>
                    <p className="text-xs text-on-surface-variant">{s.classCode}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-error shrink-0">{s.netPoints}</span>
                </li>
              ))
            )}
          </ul>
          {lowTotalPages > 1 ? (
            <div className="px-5 py-2.5 border-t border-outline-variant/10 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={lowSafePage <= 1}
                onClick={() => setPageLow((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-lg text-xs font-bold border border-outline-variant/25 disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-xs font-mono tabular-nums text-on-surface-variant">
                {lowSafePage}/{lowTotalPages}
              </span>
              <button
                type="button"
                disabled={lowSafePage >= lowTotalPages}
                onClick={() => setPageLow((p) => Math.min(lowTotalPages, p + 1))}
                className="px-2 py-1 rounded-lg text-xs font-bold border border-outline-variant/25 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          ) : null}
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-outline-variant/10 bg-green-50 dark:bg-green-950/20">
            <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-green-800 dark:text-green-300">emoji_events</span>
              Cá nhân xuất sắc
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">Tổng điểm cộng từ các lần khen thưởng.</p>
          </div>
          <ul className="divide-y divide-outline-variant/10">
            {agg.topExcellentIndividuals.length === 0 ? (
              <li className="px-5 py-8 text-sm text-on-surface-variant text-center">Không có dữ liệu.</li>
            ) : (
              excellentRows.map((s, i) => (
                <li key={s.key} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-xs font-black text-on-surface-variant w-6 tabular-nums">{excellentStart + i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-on-surface truncate">{s.name}</p>
                    <p className="text-xs text-on-surface-variant">{s.classCode}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-green-800 dark:text-green-300 shrink-0">
                    +{s.rewardSum}
                  </span>
                </li>
              ))
            )}
          </ul>
          {excellentTotalPages > 1 ? (
            <div className="px-5 py-2.5 border-t border-outline-variant/10 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={excellentSafePage <= 1}
                onClick={() => setPageExcellent((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-lg text-xs font-bold border border-outline-variant/25 disabled:opacity-40"
              >
                Trước
              </button>
              <span className="text-xs font-mono tabular-nums text-on-surface-variant">
                {excellentSafePage}/{excellentTotalPages}
              </span>
              <button
                type="button"
                disabled={excellentSafePage >= excellentTotalPages}
                onClick={() => setPageExcellent((p) => Math.min(excellentTotalPages, p + 1))}
                className="px-2 py-1 rounded-lg text-xs font-bold border border-outline-variant/25 disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          ) : null}
        </div>

        {showClassRewardLeaderboard ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 overflow-hidden shadow-sm">
            <div className={`px-5 py-4 border-b border-outline-variant/10 ${rankHeaderClass}`}>
              <h3 className="font-headline font-bold text-on-surface flex items-center gap-2">
                <span
                  className={`material-symbols-outlined ${theme === 'teacher' ? 'text-emerald-800 dark:text-emerald-300' : 'text-primary'}`}
                >
                  groups
                </span>
                Top lớp tác phong
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">Điểm final = tổng thưởng − tổng phạt (HS + lớp).</p>
            </div>
            <ul className="divide-y divide-outline-variant/10">
              {agg.topRewardClasses.length === 0 ? (
                <li className="px-5 py-8 text-sm text-on-surface-variant text-center">Không có dữ liệu.</li>
              ) : (
                classRows.map((c, i) => (
                  <li key={c.classCode} className="px-5 py-3 flex items-center gap-3">
                    <span className="text-xs font-black text-on-surface-variant w-6 tabular-nums">{classStart + i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-on-surface">Lớp {c.classCode}</p>
                    </div>
                    <span
                      className={`text-sm font-bold tabular-nums shrink-0 ${c.finalPoints >= 0 ? (theme === 'teacher' ? 'text-emerald-800 dark:text-emerald-300' : 'text-primary') : 'text-error'}`}
                    >
                      {c.finalPoints >= 0 ? '+' : ''}{c.finalPoints}
                    </span>
                  </li>
                ))
              )}
            </ul>
            {classTotalPages > 1 ? (
              <div className="px-5 py-2.5 border-t border-outline-variant/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={classSafePage <= 1}
                  onClick={() => setPageClass((p) => Math.max(1, p - 1))}
                  className="px-2 py-1 rounded-lg text-xs font-bold border border-outline-variant/25 disabled:opacity-40"
                >
                  Trước
                </button>
                <span className="text-xs font-mono tabular-nums text-on-surface-variant">
                  {classSafePage}/{classTotalPages}
                </span>
                <button
                  type="button"
                  disabled={classSafePage >= classTotalPages}
                  onClick={() => setPageClass((p) => Math.min(classTotalPages, p + 1))}
                  className="px-2 py-1 rounded-lg text-xs font-bold border border-outline-variant/25 disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}
