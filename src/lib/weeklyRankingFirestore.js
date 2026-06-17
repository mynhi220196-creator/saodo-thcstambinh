import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'
import {
  recordInDateRange,
  signedConductPoints,
} from '../pages/adminDashboard/adminDashboardAggregates.js'
import { assignRankForPoints } from './conductRanksFirestore.js'

const COL = 'weekly_rankings'

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toYmd(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function ddmm(ymd) {
  const [y, m, d] = String(ymd).split('-')
  return `${d}/${m}/${y}`
}

/**
 * Khoảng tuần (Thứ 2 → Chủ nhật theo lịch VN) chứa ngày `date`.
 * @returns { startYmd, endYmd, key, label }  key = ymd Thứ 2.
 */
export function weekRangeForDate(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = d.getDay() // 0=CN..6=T7
  const deltaToMonday = dow === 0 ? -6 : 1 - dow
  const monday = new Date(d)
  monday.setDate(d.getDate() + deltaToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const startYmd = toYmd(monday)
  const endYmd = toYmd(sunday)
  return {
    startYmd,
    endYmd,
    key: startYmd,
    label: `Tuần ${ddmm(startYmd)} – ${ddmm(endYmd)}`,
  }
}

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

/**
 * Tính BXH lớp trong khoảng tuần.
 * @param scoreList conduct_score_records (snapshot), classList conduct_class_records (snapshot)
 * @param classesMeta [{ id, code, name }] để bổ sung tên/đảm bảo lớp 0 điểm vẫn xuất hiện (tuỳ chọn)
 * @param ranks danh sách mức huy hiệu
 * @returns entries[] đã sắp xếp giảm dần kèm rank_position + rank gán theo ngưỡng
 */
export function computeWeeklyClassRanking({ scoreList, classList, startYmd, endYmd, classesMeta = [], ranks = [] }) {
  const inRange = (r) => recordInDateRange(r._createdMs, startYmd, endYmd)
  const score = (scoreList ?? []).filter(inRange)
  const klass = (classList ?? []).filter(inRange)

  const byClass = new Map()
  const ensure = (id, code) => {
    const key = String(id || code || '—')
    if (!byClass.has(key)) {
      byClass.set(key, { class_id: id || '', class_code: code || '—', final_points: 0 })
    }
    return byClass.get(key)
  }

  for (const r of score) {
    if (r.record_scope === 'class') {
      ensure(r.class_id, r.class_code).final_points += signedConductPoints(r)
    } else {
      ensure(r.class_id, r.class_code).final_points += signedConductPoints(r)
    }
  }
  for (const r of klass) {
    ensure(r.class_id, r.class_code).final_points += signedConductPoints(r)
  }

  // Bổ sung tên lớp từ metadata nếu có.
  const metaById = new Map((classesMeta ?? []).map((c) => [c.id, c]))
  const entries = [...byClass.values()].map((e) => {
    const meta = metaById.get(e.class_id)
    return {
      class_id: e.class_id,
      class_code: e.class_code || meta?.code || '—',
      class_name: meta?.name || '',
      final_points: Math.round(e.final_points),
    }
  })

  entries.sort((a, b) => b.final_points - a.final_points || a.class_code.localeCompare(b.class_code, 'vi'))

  return entries.map((e, i) => {
    const rank = assignRankForPoints(e.final_points, ranks)
    return {
      ...e,
      rank_position: i + 1,
      rank_id: rank?.id ?? '',
      rank_name: rank?.name ?? '',
      rank_icon: rank?.icon ?? '',
      rank_color: rank?.color ?? '',
    }
  })
}

/** Admin công bố snapshot BXH tuần. weekKey = ymd Thứ 2. */
export async function publishWeeklyRanking({
  weekKey,
  startYmd,
  endYmd,
  label,
  schoolYear,
  entries,
  publishedBy,
  publishedByName,
}) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const key = String(weekKey ?? '').trim()
  if (!key) throw new Error('Thiếu mã tuần.')
  await setDoc(doc(db, COL, key), {
    week_start: startYmd,
    week_end: endYmd,
    label: label ?? '',
    school_year: schoolYear ?? '',
    entries: Array.isArray(entries) ? entries : [],
    published_by: String(publishedBy ?? '').trim(),
    published_by_name: String(publishedByName ?? '').trim(),
    published_at: serverTimestamp(),
  })
}

function snapshotToWeeklyRanking(d) {
  if (!d || !d.exists?.()) return null
  const data = d.data()
  return {
    key: d.id,
    weekStart: data.week_start ?? '',
    weekEnd: data.week_end ?? '',
    label: data.label ?? '',
    schoolYear: data.school_year ?? '',
    entries: Array.isArray(data.entries) ? data.entries : [],
    publishedByName: data.published_by_name ?? '',
    _publishedMs: toMillis(data.published_at),
  }
}

/** Theo dõi BXH tuần mới nhất đã công bố (1 doc). */
export function subscribeLatestWeeklyRanking(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  const q = query(collection(db, COL), orderBy('week_start', 'desc'), limit(1))
  return onSnapshot(
    q,
    (snap) => {
      let result = null
      snap.forEach((d) => {
        if (!result) result = snapshotToWeeklyRanking(d)
      })
      onData(result)
    },
    (e) => onError?.(e),
  )
}

/** Đọc một tuần cụ thể (theo key = ymd Thứ 2). */
export async function getWeeklyRanking(weekKey) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const d = await getDoc(doc(db, COL, String(weekKey)))
  return snapshotToWeeklyRanking(d)
}
