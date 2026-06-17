import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'

const COL = 'conduct_ranks'

/** Bảng màu gợi ý cho badge (token an toàn với Tailwind đã build sẵn). */
export const RANK_COLORS = [
  { value: 'gold', label: 'Vàng', chip: 'bg-amber-100 text-amber-900 border-amber-300', solid: 'bg-amber-500' },
  { value: 'silver', label: 'Bạc', chip: 'bg-slate-100 text-slate-800 border-slate-300', solid: 'bg-slate-400' },
  { value: 'bronze', label: 'Đồng', chip: 'bg-orange-100 text-orange-900 border-orange-300', solid: 'bg-orange-500' },
  { value: 'emerald', label: 'Lục', chip: 'bg-emerald-100 text-emerald-900 border-emerald-300', solid: 'bg-emerald-500' },
  { value: 'sky', label: 'Lam', chip: 'bg-sky-100 text-sky-900 border-sky-300', solid: 'bg-sky-500' },
  { value: 'violet', label: 'Tím', chip: 'bg-violet-100 text-violet-900 border-violet-300', solid: 'bg-violet-500' },
  { value: 'rose', label: 'Hồng', chip: 'bg-rose-100 text-rose-900 border-rose-300', solid: 'bg-rose-500' },
]

export function rankColorClasses(value) {
  const found = RANK_COLORS.find((c) => c.value === value)
  return found ?? RANK_COLORS[0]
}

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

export function snapshotToRankRow(d) {
  const data = d.data()
  return {
    id: d.id,
    name: data.name ?? '',
    icon: data.icon || 'military_tech',
    color: data.color || 'gold',
    minPoints: Number(data.min_points) || 0,
    order: Number(data.order) || 0,
    description: data.description ?? '',
    enabled: data.enabled !== false,
    _createdMs: toMillis(data.created_at),
    _updatedMs: toMillis(data.updated_at),
  }
}

/** Sắp xếp giảm dần theo ngưỡng điểm (cao trước) để gán rank và hiển thị. */
export function sortRanksByThresholdDesc(list) {
  return [...(list ?? [])].sort((a, b) => b.minPoints - a.minPoints)
}

export function subscribeConductRanks(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToRankRow(s)))
      list.sort((a, b) => b.minPoints - a.minPoints)
      onData(list)
    },
    (e) => onError?.(e),
  )
}

function validateRankPayload(payload) {
  const name = String(payload.name ?? '').trim()
  if (!name) throw new Error('Nhập tên mức huy hiệu.')
  const minPoints = Number(payload.minPoints)
  if (Number.isNaN(minPoints)) throw new Error('Ngưỡng điểm không hợp lệ.')
  return { name, minPoints }
}

export async function createConductRank(payload) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const { name, minPoints } = validateRankPayload(payload)
  await addDoc(collection(db, COL), {
    name,
    icon: String(payload.icon ?? '').trim() || 'military_tech',
    color: String(payload.color ?? '').trim() || 'gold',
    min_points: minPoints,
    order: Number(payload.order) || 0,
    description: String(payload.description ?? '').trim(),
    enabled: payload.enabled !== false,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

export async function updateConductRank(id, partial) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const ref = doc(db, COL, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('Không tìm thấy mức huy hiệu.')
  const cur = snap.data()
  const next = {
    name: partial.name !== undefined ? String(partial.name).trim() : cur.name,
    icon: partial.icon !== undefined ? String(partial.icon).trim() || 'military_tech' : cur.icon,
    color: partial.color !== undefined ? String(partial.color).trim() || 'gold' : cur.color,
    min_points: partial.minPoints !== undefined ? Number(partial.minPoints) : Number(cur.min_points) || 0,
    order: partial.order !== undefined ? Number(partial.order) || 0 : Number(cur.order) || 0,
    description: partial.description !== undefined ? String(partial.description).trim() : cur.description,
    enabled: partial.enabled !== undefined ? Boolean(partial.enabled) : cur.enabled !== false,
  }
  if (Number.isNaN(next.min_points)) throw new Error('Ngưỡng điểm không hợp lệ.')
  if (!next.name) throw new Error('Nhập tên mức huy hiệu.')
  await updateDoc(ref, { ...next, updated_at: serverTimestamp() })
}

export async function deleteConductRank(id) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await deleteDoc(doc(db, COL, id))
}

/**
 * Gán mức huy hiệu cho một số điểm: chọn rank có ngưỡng cao nhất mà điểm vẫn đạt.
 * @returns rank row | null nếu không đạt mức nào.
 */
export function assignRankForPoints(points, ranks) {
  const p = Number(points)
  if (Number.isNaN(p)) return null
  const sorted = sortRanksByThresholdDesc((ranks ?? []).filter((r) => r.enabled !== false))
  for (const r of sorted) {
    if (p >= r.minPoints) return r
  }
  return null
}
