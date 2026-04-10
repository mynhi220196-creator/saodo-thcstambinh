import { formatDateTimeVN } from '../../lib/dateFormat.js'
import { recordInDateRange } from '../adminDashboard/adminDashboardAggregates.js'

export function conductRecordBelongsToClass(r, cl) {
  const rid = String(r.class_id ?? '').trim()
  if (rid && cl.id && rid === cl.id) return true
  const code = String(r.class_code ?? '').trim()
  const y = String(r.school_year ?? '').trim()
  const ccode = String(cl.code ?? '').trim()
  const cy = String(cl.school_year ?? '').trim()
  if (code && ccode && code === ccode && (!y || !cy || y === cy)) return true
  return false
}

function passesType(r, typeFilter) {
  if (typeFilter === 'all') return true
  return r.type === typeFilter
}

function filterConduct(list, dateFromYmd, dateToYmd, typeFilter) {
  return list.filter((r) => recordInDateRange(r._createdMs, dateFromYmd, dateToYmd) && passesType(r, typeFilter))
}

function criterionLabel(r) {
  const n = String(r.criterion_name ?? '').trim()
  if (n) return n
  const c = String(r.criterion_code ?? '').trim()
  return c || 'Không rõ tiêu chí'
}

/**
 * @param {object[]} classesFiltered — lớp đã lọc năm/khối/một lớp
 * @param {object[]} studentsRaw
 * @param {object[]} scoreFiltered
 * @param {object[]} classRecFiltered
 * @param {Record<string, object>} profileById
 */
export function buildPerClassReportRows(classesFiltered, studentsRaw, scoreFiltered, classRecFiltered, profileById) {
  const studentCountByClass = {}
  for (const s of studentsRaw) {
    if (s.is_deleted || !s.class_id) continue
    studentCountByClass[s.class_id] = (studentCountByClass[s.class_id] ?? 0) + 1
  }

  return classesFiltered.map((cl) => {
    const scores = scoreFiltered.filter((r) => conductRecordBelongsToClass(r, cl))
    const classRecs = classRecFiltered.filter((r) => conductRecordBelongsToClass(r, cl))

    const indiv = scores.filter((r) => r.record_scope !== 'class')

    let indivPenaltyN = 0
    let indivRewardN = 0
    let indivPenaltyPts = 0
    let indivRewardPts = 0
    let indivFlagged = 0
    for (const r of indiv) {
      if (r.admin_flagged) indivFlagged += 1
      if (r.type === 'penalty') {
        indivPenaltyN += 1
        indivPenaltyPts += Math.abs(Number(r.points) || 0)
      } else {
        indivRewardN += 1
        indivRewardPts += Math.abs(Number(r.points) || 0)
      }
    }

    let classPenaltyN = 0
    let classRewardN = 0
    let classPenaltyPts = 0
    let classRewardPts = 0
    let classFlagged = 0
    for (const r of classRecs) {
      if (r.admin_flagged) classFlagged += 1
      if (r.type === 'penalty') {
        classPenaltyN += 1
        classPenaltyPts += Math.abs(Number(r.points) || 0)
      } else {
        classRewardN += 1
        classRewardPts += Math.abs(Number(r.points) || 0)
      }
    }

    const legacyClassScore = scores.filter((r) => r.record_scope === 'class')
    for (const r of legacyClassScore) {
      if (r.admin_flagged) classFlagged += 1
      if (r.type === 'penalty') {
        classPenaltyN += 1
        classPenaltyPts += Math.abs(Number(r.points) || 0)
      } else {
        classRewardN += 1
        classRewardPts += Math.abs(Number(r.points) || 0)
      }
    }

    const tid = cl.homeroom_teacher_id
    const gvcn = tid && profileById[tid] ? profileById[tid].full_name || '—' : '—'

    const totalRewardPts = indivRewardPts + classRewardPts
    const totalPenaltyPts = indivPenaltyPts + classPenaltyPts
    const finalConductPoints = totalRewardPts - totalPenaltyPts

    return {
      classId: cl.id,
      classCode: cl.code ?? '—',
      className: (cl.name && String(cl.name).trim()) || '—',
      grade: cl.grade ?? '—',
      schoolYear: cl.school_year ?? '—',
      homeroomTeacher: gvcn,
      studentCount: studentCountByClass[cl.id] ?? 0,
      indivPenaltyCount: indivPenaltyN,
      indivRewardCount: indivRewardN,
      indivPenaltyPoints: indivPenaltyPts,
      indivRewardPoints: indivRewardPts,
      classPenaltyCount: classPenaltyN,
      classRewardCount: classRewardN,
      classPenaltyPoints: classPenaltyPts,
      classRewardPoints: classRewardPts,
      finalConductPoints,
      flaggedCount: indivFlagged + classFlagged,
      totalConductRecords: scores.length + classRecs.length,
    }
  })
}

export function summarizeReportRows(rows) {
  let totalClasses = rows.length
  let totalConduct = 0
  let sumPenaltyN = 0
  let sumRewardN = 0
  let sumPenaltyPts = 0
  let sumRewardPts = 0
  let sumFlagged = 0
  for (const r of rows) {
    totalConduct += r.totalConductRecords
    sumPenaltyN += r.indivPenaltyCount + r.classPenaltyCount
    sumRewardN += r.indivRewardCount + r.classRewardCount
    sumPenaltyPts += r.indivPenaltyPoints + r.classPenaltyPoints
    sumRewardPts += r.indivRewardPoints + r.classRewardPoints
    sumFlagged += r.flaggedCount
  }
  return {
    totalClasses,
    totalConduct,
    sumPenaltyN,
    sumRewardN,
    sumPenaltyPts,
    sumRewardPts,
    sumFlagged,
  }
}

export function buildTopViolationCriteria(scoreFiltered, classRecFiltered, limit = 10) {
  const map = new Map()
  for (const r of [...scoreFiltered, ...classRecFiltered]) {
    if (r.type !== 'penalty') continue
    const lab = criterionLabel(r)
    map.set(lab, (map.get(lab) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}

/**
 * Chi tiết bản ghi cho export (giới hạn độ dài).
 */
export function buildDetailExportRows(scoreFiltered, classRecFiltered, maxRows = 8000) {
  const raw = []

  const pushScore = (r, source) => {
    const ms = Number(r._createdMs) || 0
    const d = new Date(ms)
    const dateStr = Number.isNaN(d.getTime()) ? '' : formatDateTimeVN(ms)
    raw.push({
      _ms: ms,
      Nguon: source,
      Ngay_gio: dateStr,
      Loai: r.type === 'penalty' ? 'Vi phạm' : 'Khen thưởng',
      Ma_lop: r.class_code ?? '',
      Pham_vi_HS: r.record_scope === 'class' ? 'Lớp (HS cũ)' : 'Học sinh',
      Ma_HS: r.student_id ?? '',
      Ho_ten_HS: r.student_name ?? '',
      Ma_tieu_chi: r.criterion_code ?? '',
      Ten_tieu_chi: r.criterion_name ?? '',
      Diem: r.points ?? 0,
      Nguoi_ghi: r.recorded_by_name || r.recorded_by || '',
      Ghi_chu: (r.note ?? '').slice(0, 500),
      Co_ngiem: r.admin_flagged ? 'Có' : '',
      Nam_hoc: r.school_year ?? '',
    })
  }

  for (const r of scoreFiltered) pushScore(r, 'conduct_score_records')
  for (const r of classRecFiltered) {
    const ms = Number(r._createdMs) || 0
    const d = new Date(ms)
    const dateStr = Number.isNaN(d.getTime()) ? '' : formatDateTimeVN(ms)
    raw.push({
      _ms: ms,
      Nguon: 'conduct_class_records',
      Ngay_gio: dateStr,
      Loai: r.type === 'penalty' ? 'Vi phạm' : 'Khen thưởng',
      Ma_lop: r.class_code ?? '',
      Pham_vi_HS: 'Tập thể lớp',
      Ma_HS: '',
      Ho_ten_HS: '',
      Ma_tieu_chi: r.criterion_code ?? '',
      Ten_tieu_chi: r.criterion_name ?? '',
      Diem: r.points ?? 0,
      Nguoi_ghi: r.recorded_by_name || r.recorded_by || '',
      Ghi_chu: (r.note ?? '').slice(0, 500),
      Co_ngiem: r.admin_flagged ? 'Có' : '',
      Nam_hoc: r.school_year ?? '',
    })
  }

  raw.sort((a, b) => b._ms - a._ms)
  const rows = raw.map((row) => {
    const { _ms, ...rest } = row
    return rest
  })
  const truncated = rows.length > maxRows
  return { rows: rows.slice(0, maxRows), total: rows.length, truncated }
}

export function prepareFilteredConduct(scoreRaw, classRaw, dateFromYmd, dateToYmd, typeFilter) {
  return {
    scoreFiltered: filterConduct(scoreRaw, dateFromYmd, dateToYmd, typeFilter),
    classRecFiltered: filterConduct(classRaw, dateFromYmd, dateToYmd, typeFilter),
  }
}
