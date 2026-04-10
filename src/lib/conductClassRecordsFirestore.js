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

/** Điểm tác phong gắn với lớp (một document / lần ghi — không nhân theo học sinh). */
const COL = 'conduct_class_records'

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

export function snapshotToConductClassRecord(s) {
  const d = s.data()
  return {
    id: s.id,
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
    image_urls: Array.isArray(d.image_urls) ? d.image_urls.filter((u) => typeof u === 'string') : [],
    admin_flagged: d.admin_flagged === true,
    _admin_flagged_ms: toMillis(d.admin_flagged_at),
    _createdMs: toMillis(d.created_at),
  }
}

export async function addConductClassRecord({
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
    created_at: serverTimestamp(),
  }
  if (urls.length > 0) doc.image_urls = urls
  await addDoc(collection(db, COL), doc)
}

/** Mã tiêu chí cố định cho bản ghi cộng điểm hàng loạt (admin). */
export const ADMIN_BULK_ALL_CLASSES_CRITERION_ID = 'admin_bulk_all_classes'
export const ADMIN_BULK_ALL_CLASSES_CRITERION_CODE = 'ADMIN-ALL-CLASSES'

/**
 * Tạo cùng một bản ghi điểm lớp (cộng) cho từng lớp trong danh sách.
 * @param {Array<{ id: string, code?: string }>} classList
 * @param {{ school_year: string, title: string, points: number, recorded_by: string, recorded_by_name: string }} payload
 */
export async function addConductClassBulkRewardsForClasses(classList, payload) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const school_year = String(payload.school_year ?? '').trim()
  const title = String(payload.title ?? '').trim()
  const recorded_by = String(payload.recorded_by ?? '').trim()
  const recorded_by_name = String(payload.recorded_by_name ?? '').trim()
  const p = Number(payload.points)
  if (!school_year) throw new Error('Thiếu năm học.')
  if (!title) throw new Error('Nhập tiêu đề.')
  if (!Number.isFinite(p) || p <= 0) throw new Error('Số điểm phải là số dương.')
  if (!recorded_by) throw new Error('Chưa xác định người ghi.')
  const list = Array.isArray(classList) ? classList : []
  if (list.length === 0) throw new Error('Không có lớp nào để ghi.')

  for (const c of list) {
    const id = String(c?.id ?? '').trim()
    if (!id) continue
    await addConductClassRecord({
      class_id: id,
      class_code: String(c?.code ?? '').trim(),
      school_year,
      criterion_id: ADMIN_BULK_ALL_CLASSES_CRITERION_ID,
      criterion_code: ADMIN_BULK_ALL_CLASSES_CRITERION_CODE,
      criterion_name: title,
      type: 'reward',
      points: p,
      note: '',
      recorded_by,
      recorded_by_name,
    })
  }
}

/** Xóa bản ghi điểm lớp (rules: chỉ người ghi, không cờ nghiêm). */
export async function deleteConductClassRecord(recordId) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = String(recordId ?? '').trim()
  if (!id) throw new Error('Thiếu mã bản ghi.')
  await deleteDoc(doc(db, COL, id))
}

export function subscribeConductClassRecordsByTeacher(teacherUid, onData, onError) {
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
      snap.forEach((s) => list.push(snapshotToConductClassRecord(s)))
      list.sort((a, b) => b._createdMs - a._createdMs)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/** Mọi bản ghi điểm lớp (GVCN / admin đọc được theo rules). */
export function subscribeConductClassRecordsByClassId(classId, onData, onError) {
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
      snap.forEach((s) => list.push(snapshotToConductClassRecord(s)))
      list.sort((a, b) => b._createdMs - a._createdMs)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/** Admin: toàn bộ `conduct_class_records`. */
export function subscribeAllConductClassRecords(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToConductClassRecord(s)))
      list.sort((a, b) => b._createdMs - a._createdMs)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/**
 * Admin: gắn / gỡ cờ «cần xử lý nghiêm» trên bản ghi điểm lớp.
 */
export async function setConductClassAdminFlagged(recordId, flagged) {
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
