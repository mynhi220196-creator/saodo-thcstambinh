import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'

const COL = 'conduct_criteria'

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

/** ID document = mã hạng mục (trim), không chứa `/`. */
export function criterionDocIdFromCode(code) {
  const s = String(code ?? '').trim()
  if (!s) throw new Error('Nhập mã hạng mục.')
  if (s.includes('/') || s === '.' || s === '..') throw new Error('Mã không hợp lệ.')
  return s
}

function assertPointsMatchType(type, points) {
  const n = Number(points)
  if (Number.isNaN(n)) throw new Error('Điểm không hợp lệ.')
  if (type === 'reward' && n <= 0) throw new Error('Điểm thưởng phải lớn hơn 0.')
  if (type === 'penalty' && n >= 0) throw new Error('Điểm phạt phải nhỏ hơn 0.')
}

export function snapshotToCriterionRow(d) {
  const data = d.data()
  const type = data.type === 'reward' ? 'reward' : 'penalty'
  return {
    id: d.id,
    code: data.code ?? d.id,
    name: data.name ?? '',
    category: data.category ?? 'Khác',
    type,
    points: Number(data.points) || 0,
    description: data.description ?? '',
    enabled: data.enabled !== false,
    _createdMs: toMillis(data.created_at),
    _updatedMs: toMillis(data.updated_at),
  }
}

export function subscribeConductCriteria(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToCriterionRow(s)))
      list.sort((a, b) => (a.code || '').localeCompare(b.code || '', 'vi'))
      onData(list)
    },
    (e) => onError?.(e),
  )
}

export async function createConductCriterion(payload) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = criterionDocIdFromCode(payload.code)
  const type = payload.type === 'reward' ? 'reward' : 'penalty'
  const points = Number(payload.points)
  assertPointsMatchType(type, points)
  const ref = doc(db, COL, id)
  const existing = await getDoc(ref)
  if (existing.exists()) throw new Error('Mã hạng mục đã tồn tại.')

  await setDoc(ref, {
    code: id,
    name: String(payload.name ?? '').trim(),
    category: String(payload.category ?? '').trim() || 'Khác',
    type,
    points,
    description: String(payload.description ?? '').trim(),
    enabled: payload.enabled !== false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

/**
 * Cập nhật một phần hoặc toàn bộ. Luôn merge với dữ liệu hiện có để toggle `enabled` an toàn.
 */
export async function updateConductCriterion(id, partial) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const ref = doc(db, COL, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Không tìm thấy hạng mục.')
  const cur = snap.data()
  const curType = cur.type === 'reward' ? 'reward' : 'penalty'
  const nextType =
    partial.type !== undefined ? (partial.type === 'reward' ? 'reward' : 'penalty') : curType
  const nextPoints = partial.points !== undefined ? Number(partial.points) : Number(cur.points)
  assertPointsMatchType(nextType, nextPoints)

  const next = {
    name: partial.name !== undefined ? String(partial.name).trim() : cur.name,
    category: partial.category !== undefined ? String(partial.category).trim() || 'Khác' : cur.category,
    type: nextType,
    points: nextPoints,
    description: partial.description !== undefined ? String(partial.description).trim() : cur.description,
    enabled: partial.enabled !== undefined ? Boolean(partial.enabled) : cur.enabled !== false,
  }

  await updateDoc(ref, {
    ...next,
    updated_at: serverTimestamp(),
  })
}

export async function deleteConductCriterion(id) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await deleteDoc(doc(db, COL, id))
}
