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

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
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
