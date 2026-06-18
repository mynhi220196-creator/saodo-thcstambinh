/**
 * Ánh xạ Firestore → hàng bảng admin (cùng shape với mock `SCORE_RECORDS`).
 * `rowKey` dùng cho React key; cờ nghiêm đọc từ `admin_flagged` trên Firestore.
 */

function isoFromMs(ms) {
  if (!ms) return new Date(0).toISOString()
  try {
    return new Date(ms).toISOString()
  } catch {
    return new Date(0).toISOString()
  }
}

function signedPoints(type, points) {
  const p = Number(points) || 0
  return type === 'penalty' ? -Math.abs(p) : Math.abs(p)
}

function imageUrlsFromRecord(r) {
  const raw = r?.image_urls
  return Array.isArray(raw) ? raw.map((u) => String(u ?? '').trim()).filter(Boolean) : []
}

/** @param {Record<string, unknown>} r */
export function mapConductScoreRecordForAdmin(r) {
  const legacyClass = r.record_scope === 'class'
  return {
    rowKey: `score:${r.id}`,
    id: r.id,
    at: isoFromMs(r._createdMs),
    studentCode: '—',
    studentName: legacyClass ? 'Điểm lớp (bản ghi cũ)' : (r.student_name || '—'),
    classCode: String(r.class_code ?? '').trim() || '—',
    ruleCode: r.criterion_code || '',
    ruleName: r.criterion_name || '—',
    category: 'Tác phong',
    points: signedPoints(r.type, r.points),
    type: r.type,
    recordedBy: r.recorded_by_name || r.recorded_by || '—',
    role: 'Giáo viên',
    source: legacyClass ? 'gvcn' : 'teacher',
    status: r.admin_flagged === true ? 'flagged' : 'approved',
    adminFlaggedAt: r._admin_flagged_ms ? isoFromMs(r._admin_flagged_ms) : '',
    note: r.note || '',
    location: r.school_year ? `NH ${r.school_year}` : '',
    schoolYear: r.school_year || '',
    image_urls: imageUrlsFromRecord(r),
    // Khiếu nại (chỉ áp dụng bản ghi cá nhân `score`, không áp dụng bản ghi lớp cũ).
    canDispute: !legacyClass,
    disputeStatus: r.dispute_status ?? 'none',
    disputeReason: r.dispute_reason ?? '',
    disputedBy: r.disputed_by ?? '',
    disputedByName: r.disputed_by_name ?? '',
    disputedAt: r._disputed_ms ? isoFromMs(r._disputed_ms) : '',
    disputeResolutionNote: r.dispute_resolution_note ?? '',
  }
}

/** @param {Record<string, unknown>} r */
export function mapConductClassRecordForAdmin(r) {
  return {
    rowKey: `class:${r.id}`,
    id: r.id,
    at: isoFromMs(r._createdMs),
    studentCode: '—',
    studentName: 'Điểm lớp (tập thể)',
    classCode: String(r.class_code ?? '').trim() || '—',
    ruleCode: r.criterion_code || '',
    ruleName: r.criterion_name || '—',
    category: 'Tác phong · lớp',
    points: signedPoints(r.type, r.points),
    type: r.type,
    recordedBy: r.recorded_by_name || r.recorded_by || '—',
    role: 'Giáo viên',
    source: 'gvcn',
    status: r.admin_flagged === true ? 'flagged' : 'approved',
    adminFlaggedAt: r._admin_flagged_ms ? isoFromMs(r._admin_flagged_ms) : '',
    note: r.note || '',
    location: r.school_year ? `NH ${r.school_year}` : '',
    schoolYear: r.school_year || '',
    image_urls: imageUrlsFromRecord(r),
  }
}
