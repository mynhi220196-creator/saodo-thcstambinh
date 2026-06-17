import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'

const COL = 'conduct_score_records'

/** Cửa sổ (phút) Sao Đỏ được tự sửa/xóa bản ghi sau khi tạo. Khớp firestore.rules. */
export const RED_STAR_EDIT_WINDOW_MIN = 15

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

/**
 * Sao Đỏ còn được tự xóa bản ghi này không?
 * Đúng khi: chưa bị admin gắn cờ, chưa bị khiếu nại, và còn trong cửa sổ phút kể từ created_at.
 * (Server vẫn là nơi chốt cuối qua firestore.rules; đây chỉ để phản ánh trên giao diện.)
 */
export function canRedStarStillDelete(record, nowMs = Date.now()) {
  if (!record) return false
  if (record.admin_flagged === true) return false
  if (record.dispute_status && record.dispute_status !== 'none') return false
  const created = Number(record._createdMs) || 0
  if (!created) return false
  return nowMs - created < RED_STAR_EDIT_WINDOW_MIN * 60 * 1000
}

export function snapshotToConductRecord(s) {
  const d = s.data()
  const scope = d.record_scope === 'class' ? 'class' : 'individual'
  return {
    id: s.id,
    student_id: d.student_id ?? '',
    student_name: d.student_name ?? '',
    class_id: d.class_id ?? '',
    class_code: d.class_code ?? '',
    school_year: d.school_year ?? '',
    criterion_id: d.criterion_id ?? '',
    criterion_code: d.criterion_code ?? '',
    criterion_name: d.criterion_name ?? '',
    type: d.type === 'penalty' ? 'penalty' : 'reward',
    points: Number(d.points) || 0,
    note: d.note ?? '',
    recorded_by: d.recorded_by ?? '',
    recorded_by_name: d.recorded_by_name ?? '',
    record_scope: scope,
    class_batch_id: d.class_batch_id ?? null,
    image_urls: Array.isArray(d.image_urls) ? d.image_urls.filter((u) => typeof u === 'string') : [],
    admin_flagged: d.admin_flagged === true,
    _admin_flagged_ms: toMillis(d.admin_flagged_at),
    dispute_status: d.dispute_status ?? 'none',
    disputed_by: d.disputed_by ?? '',
    disputed_by_name: d.disputed_by_name ?? '',
    dispute_reason: d.dispute_reason ?? '',
    _disputed_ms: toMillis(d.disputed_at),
    dispute_resolved_by: d.dispute_resolved_by ?? '',
    dispute_resolution_note: d.dispute_resolution_note ?? '',
    _dispute_resolved_ms: toMillis(d.dispute_resolved_at),
    _createdMs: toMillis(d.created_at),
  }
}

/**
 * Ghi điểm tác phong cho một học sinh.
 */
export async function addConductScoreRecord({
  student_id,
  student_name,
  class_id,
  class_code,
  school_year,
  criterion_id,
  criterion_code,
  criterion_name,
  type,
  points,
  note,
  recorded_by,
  recorded_by_name,
  image_urls,
}) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const t = type === 'penalty' ? 'penalty' : 'reward'
  const p = Number(points)
  if (Number.isNaN(p)) throw new Error('Điểm không hợp lệ.')
  const urls = Array.isArray(image_urls)
    ? image_urls.map((u) => String(u ?? '').trim()).filter(Boolean).slice(0, 5)
    : []
  const doc = {
    student_id: String(student_id ?? '').trim(),
    student_name: String(student_name ?? '').trim(),
    class_id: String(class_id ?? '').trim(),
    class_code: String(class_code ?? '').trim(),
    school_year: String(school_year ?? '').trim(),
    criterion_id: String(criterion_id ?? '').trim(),
    criterion_code: String(criterion_code ?? '').trim(),
    criterion_name: String(criterion_name ?? '').trim(),
    type: t,
    points: p,
    note: String(note ?? '').trim(),
    recorded_by: String(recorded_by ?? '').trim(),
    recorded_by_name: String(recorded_by_name ?? '').trim(),
    record_scope: 'individual',
    created_at: serverTimestamp(),
  }
  if (urls.length > 0) doc.image_urls = urls
  await addDoc(collection(db, COL), doc)
}

/** Xóa bản ghi cá nhân (rules: chỉ người ghi, không cờ nghiêm). */
export async function deleteConductScoreRecord(recordId) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = String(recordId ?? '').trim()
  if (!id) throw new Error('Thiếu mã bản ghi.')
  await deleteDoc(doc(db, COL, id))
}

/** Bản ghi cá nhân do một GV tạo. */
export function subscribeConductRecordsByTeacher(teacherUid, onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  const uid = String(teacherUid ?? '').trim()
  if (!uid) {
    onData([])
    return () => {}
  }
  const q = query(collection(db, COL), where('recorded_by', '==', uid))
  return onSnapshot(
    q,
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToConductRecord(s)))
      list.sort((a, b) => b._createdMs - a._createdMs)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/** Mọi bản ghi cá nhân trong lớp (GVCN / admin đọc được theo rules). */
export function subscribeConductScoreRecordsByClassId(classId, onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  const cid = String(classId ?? '').trim()
  if (!cid) {
    onData([])
    return () => {}
  }
  const q = query(collection(db, COL), where('class_id', '==', cid))
  return onSnapshot(
    q,
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToConductRecord(s)))
      list.sort((a, b) => b._createdMs - a._createdMs)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/** Admin: toàn bộ `conduct_score_records`. */
export function subscribeAllConductScoreRecords(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToConductRecord(s)))
      list.sort((a, b) => b._createdMs - a._createdMs)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/**
 * Admin: gắn / gỡ cờ «cần xử lý nghiêm» trên một bản ghi cá nhân.
 * Firestore rules chỉ cho phép đổi `admin_flagged` và `admin_flagged_at`.
 */
export async function setConductScoreAdminFlagged(recordId, flagged) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = String(recordId ?? '').trim()
  if (!id) throw new Error('Thiếu mã bản ghi.')
  const ref = doc(db, COL, id)
  if (flagged) {
    await updateDoc(ref, {
      admin_flagged: true,
      admin_flagged_at: serverTimestamp(),
    })
  } else {
    await updateDoc(ref, {
      admin_flagged: false,
      admin_flagged_at: deleteField(),
    })
  }
}

/**
 * GVCN gửi khiếu nại một bản ghi điểm trừ (vd: ảnh minh chứng chưa rõ).
 * Chỉ đặt các field dispute_* (khớp firestore.rules: conductDisputeRaiseOk).
 */
export async function raiseConductDispute(recordId, { reason, disputed_by, disputed_by_name }) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = String(recordId ?? '').trim()
  if (!id) throw new Error('Thiếu mã bản ghi.')
  const r = String(reason ?? '').trim()
  if (!r) throw new Error('Vui lòng nhập lý do khiếu nại.')
  if (r.length > 1000) throw new Error('Lý do khiếu nại quá dài (tối đa 1000 ký tự).')
  await updateDoc(doc(db, COL, id), {
    dispute_status: 'open',
    disputed_by: String(disputed_by ?? '').trim(),
    disputed_by_name: String(disputed_by_name ?? '').trim(),
    dispute_reason: r,
    disputed_at: serverTimestamp(),
  })
}

/**
 * Admin BÁC khiếu nại: giữ nguyên điểm, đánh dấu đã xử lý.
 * (CHẤP NHẬN khiếu nại = xóa bản ghi điểm trừ → dùng deleteConductScoreRecord.)
 */
export async function rejectConductDispute(recordId, { resolved_by, note } = {}) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = String(recordId ?? '').trim()
  if (!id) throw new Error('Thiếu mã bản ghi.')
  await updateDoc(doc(db, COL, id), {
    dispute_status: 'rejected',
    dispute_resolved_by: String(resolved_by ?? '').trim(),
    dispute_resolved_at: serverTimestamp(),
    dispute_resolution_note: String(note ?? '').trim(),
  })
}
