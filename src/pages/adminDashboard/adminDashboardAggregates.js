/** Lọc theo `YYYY-MM-DD` (local), biên giống trang bản ghi điểm */

function parseYmdLocal(ymd) {
  if (!ymd || typeof ymd !== 'string') return null
  const parts = ymd.split('-').map(Number)
  const y = parts[0]
  const m = parts[1]
  const day = parts[2]
  if (!y || !m || !day) return null
  const x = new Date(y, m - 1, day)
  return Number.isNaN(x.getTime()) ? null : x
}

function startOfDayLocalYmd(ymd) {
  const x = parseYmdLocal(ymd)
  if (!x) return null
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function endOfDayLocalYmd(ymd) {
  const x = parseYmdLocal(ymd)
  if (!x) return null
  x.setHours(23, 59, 59, 999)
  return x.getTime()
}

export function recordInDateRange(ms, dateFromYmd, dateToYmd) {
  const from = dateFromYmd?.trim() ?? ''
  const to = dateToYmd?.trim() ?? ''
  if (!from && !to) return true
  const t = Number(ms) || 0
  const fromMs = from ? startOfDayLocalYmd(from) : null
  const toMs = to ? endOfDayLocalYmd(to) : null
  if (fromMs != null && t < fromMs) return false
  if (toMs != null && t > toMs) return false
  return true
}

export function signedConductPoints(r) {
  const p = Number(r.points) || 0
  return r.type === 'penalty' ? -Math.abs(p) : Math.abs(p)
}

function criterionLabel(r) {
  const n = String(r.criterion_name ?? '').trim()
  if (n) return n
  const c = String(r.criterion_code ?? '').trim()
  return c || 'Không rõ tiêu chí'
}

function studentKey(r) {
  const sid = String(r.student_id ?? '').trim()
  if (sid) return `id:${sid}`
  const name = String(r.student_name ?? '').trim()
  const cc = String(r.class_code ?? '').trim()
  if (!name) return ''
  return `nm:${name}|${cc}`
}

/**
 * @param {object[]} scoreList conduct_score_records (đã snapshot)
 * @param {object[]} classList conduct_class_records
 */
export function buildDashboardAggregates(scoreList, classList, dateFromYmd, dateToYmd, topN = 10) {
  const score = Array.isArray(scoreList) ? scoreList : []
  const klass = Array.isArray(classList) ? classList : []

  const inRange = (r) => recordInDateRange(r._createdMs, dateFromYmd, dateToYmd)

  const scoreF = score.filter(inRange)
  const classF = klass.filter(inRange)
  const all = [...scoreF, ...classF]

  let penaltyCount = 0
  let rewardCount = 0
  let sumPenaltyPoints = 0
  let sumRewardPoints = 0

  const violationByCriterion = new Map()

  for (const r of all) {
    if (r.type === 'penalty') {
      penaltyCount += 1
      sumPenaltyPoints += Math.abs(Number(r.points) || 0)
      const lab = criterionLabel(r)
      violationByCriterion.set(lab, (violationByCriterion.get(lab) ?? 0) + 1)
    } else {
      rewardCount += 1
      sumRewardPoints += Math.abs(Number(r.points) || 0)
    }
  }

  const topViolations = [...violationByCriterion.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }))

  /** Cá nhân: chỉ bản ghi điểm HS, bỏ scope lớp / legacy class */
  const individualScore = scoreF.filter((r) => r.record_scope !== 'class')

  const byStudent = new Map()
  for (const r of individualScore) {
    const k = studentKey(r)
    if (!k) continue
    const name = String(r.student_name ?? '').trim() || '—'
    const cc = String(r.class_code ?? '').trim() || '—'
    let row = byStudent.get(k)
    if (!row) {
      row = { key: k, name, classCode: cc, netPoints: 0, rewardSum: 0, penaltyCount: 0, rewardCount: 0 }
      byStudent.set(k, row)
    }
    row.netPoints += signedConductPoints(r)
    if (r.type === 'reward') {
      row.rewardSum += Math.abs(Number(r.points) || 0)
      row.rewardCount += 1
    } else {
      row.penaltyCount += 1
    }
  }

  const students = [...byStudent.values()]

  const topLowIndividuals = [...students]
    .filter((s) => s.penaltyCount > 0 || s.netPoints < 0)
    .sort((a, b) => a.netPoints - b.netPoints)
    .slice(0, topN)

  const topExcellentIndividuals = [...students]
    .filter((s) => s.rewardSum > 0)
    .sort((a, b) => b.rewardSum - a.rewardSum)
    .slice(0, topN)

  const classFinalPoints = new Map()
  const addClassPoints = (code, r) => {
    const c = String(code ?? '').trim()
    if (!c || c === '—') return
    classFinalPoints.set(c, (classFinalPoints.get(c) ?? 0) + signedConductPoints(r))
  }

  for (const r of classF) addClassPoints(r.class_code, r)
  for (const r of individualScore) addClassPoints(r.class_code, r)

  const topRewardClasses = [...classFinalPoints.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([classCode, finalPoints]) => ({ classCode, finalPoints }))

  const rewardClassCount = classFinalPoints.size

  return {
    totals: {
      recordCount: all.length,
      penaltyCount,
      rewardCount,
      sumPenaltyPoints,
      sumRewardPoints,
      rewardClassCount,
    },
    topViolations,
    topLowIndividuals,
    topExcellentIndividuals,
    topRewardClasses,
  }
}
