import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'
import WeeklyHonorBoard from '../../components/WeeklyHonorBoard.jsx'
import { subscribeConductRanks } from '../../lib/conductRanksFirestore.js'
import { subscribeClasses } from '../../lib/organizationFirestore.js'
import {
  computeWeeklyClassRanking,
  publishWeeklyRanking,
  subscribeLatestWeeklyRanking,
  weekRangeForDate,
} from '../../lib/weeklyRankingFirestore.js'

/**
 * Panel admin: tính BXH tuần hiện tại từ toàn bộ bản ghi (props) + mức huy hiệu,
 * cho xem trước rồi «Công bố» snapshot để giáo viên/màn hình TV đọc.
 *
 * props: scoreRaw, classRaw  (toàn bộ bản ghi đã snapshot, do dashboard tải)
 */
export default function AdminWeeklyHonorPanel({ scoreRaw, classRaw }) {
  const { user, profile } = useAuth()
  const [ranks, setRanks] = useState([])
  const [classesRaw, setClassesRaw] = useState([])
  const [latest, setLatest] = useState(null)
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState({ kind: '', msg: '' })

  useEffect(() => subscribeConductRanks(setRanks, () => {}), [])
  useEffect(() => subscribeClasses(setClassesRaw, () => {}), [])
  useEffect(() => subscribeLatestWeeklyRanking(setLatest, () => {}), [])

  const week = useMemo(() => weekRangeForDate(new Date()), [])

  const classesMeta = useMemo(
    () =>
      classesRaw
        .filter((c) => c.is_deleted !== true)
        .map((c) => ({ id: c.id, code: c.code, name: c.name })),
    [classesRaw],
  )

  const previewEntries = useMemo(
    () =>
      computeWeeklyClassRanking({
        scoreList: scoreRaw,
        classList: classRaw,
        startYmd: week.startYmd,
        endYmd: week.endYmd,
        classesMeta,
        ranks,
      }),
    [scoreRaw, classRaw, week, classesMeta, ranks],
  )

  const previewRanking = useMemo(
    () => ({ label: week.label, weekStart: week.startYmd, weekEnd: week.endYmd, entries: previewEntries }),
    [week, previewEntries],
  )

  const showBanner = useCallback((kind, msg) => {
    setBanner({ kind, msg })
    if (msg) window.setTimeout(() => setBanner({ kind: '', msg: '' }), 5000)
  }, [])

  const onPublish = useCallback(async () => {
    if (previewEntries.length === 0) {
      showBanner('err', 'Tuần này chưa có dữ liệu để công bố.')
      return
    }
    if (!window.confirm(`Công bố BXH ${week.label}? Giáo viên và màn hình vinh danh sẽ thấy kết quả này.`)) return
    setBusy(true)
    try {
      await publishWeeklyRanking({
        weekKey: week.key,
        startYmd: week.startYmd,
        endYmd: week.endYmd,
        label: week.label,
        schoolYear: '',
        entries: previewEntries,
        publishedBy: user?.id ?? '',
        publishedByName: profile?.full_name?.trim() || user?.email || '',
      })
      showBanner('ok', 'Đã công bố BXH tuần.')
    } catch (e) {
      showBanner('err', e?.message ?? 'Không công bố được. Kiểm tra quyền ADMIN.')
    } finally {
      setBusy(false)
    }
  }, [previewEntries, week, user, profile, showBanner])

  const alreadyPublishedThisWeek = latest?.key === week.key

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="font-headline text-xl font-extrabold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
              trophy
            </span>
            Vinh danh &amp; Công bố BXH tuần
          </h3>
          <p className="text-sm text-on-surface-variant mt-1">
            {week.label} · Xem trước kết quả realtime rồi công bố cho toàn trường.{' '}
            {ranks.length === 0 ? (
              <span className="text-amber-700 dark:text-amber-300 font-semibold">
                Chưa có mức huy hiệu — hãy tạo trong «Huy hiệu &amp; Vinh danh».
              </span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 disabled:opacity-50 shrink-0"
        >
          <span className="material-symbols-outlined text-lg">campaign</span>
          {busy ? 'Đang công bố…' : alreadyPublishedThisWeek ? 'Công bố lại tuần này' : 'Công bố BXH tuần'}
        </button>
      </div>

      {banner.msg ? (
        <p
          className={`text-sm font-semibold rounded-xl px-4 py-3 mb-4 ${
            banner.kind === 'err'
              ? 'text-error bg-error-container/30'
              : 'text-green-800 bg-green-50 dark:bg-green-950/30 dark:text-green-200'
          }`}
        >
          {banner.msg}
        </p>
      ) : null}

      <WeeklyHonorBoard ranking={previewRanking} emptyHint="Tuần này chưa có bản ghi tác phong nào." />

      {alreadyPublishedThisWeek ? (
        <p className="text-xs text-on-surface-variant mt-2 text-center">
          ✓ Tuần này đã được công bố. Bấm «Công bố lại» nếu có thay đổi.
        </p>
      ) : latest ? (
        <p className="text-xs text-on-surface-variant mt-2 text-center">
          Bản công bố gần nhất: {latest.label}. Bấm «Công bố BXH tuần» để cập nhật tuần hiện tại.
        </p>
      ) : null}
    </section>
  )
}
