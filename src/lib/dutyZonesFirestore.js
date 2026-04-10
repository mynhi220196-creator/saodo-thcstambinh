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

const COL = 'duty_zones'

/** ID tài liệu = mã khu (slug), khớp `zone_id` trong `duty_assignments`. */
export function sanitizeDutyZoneKey(raw) {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
  if (!s) throw new Error('Nhập mã khu (chữ thường, số, gạch ngang/gạch dưới).')
  if (s.length > 120) throw new Error('Mã khu quá dài.')
  return s
}

export function snapshotToDutyZone(s) {
  const d = s.data()
  return {
    id: s.id,
    name: d.name ?? '',
    subtitle: d.subtitle ?? '',
    areaId: d.area_key ?? 'other',
    sort_order: Number(d.sort_order) || 0,
    is_active: d.is_active !== false,
  }
}

export function subscribeDutyZones(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToDutyZone(s)))
      list.sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
        return a.name.localeCompare(b.name, 'vi')
      })
      onData(list)
    },
    (e) => onError?.(e),
  )
}

export async function createDutyZone({ zoneKey, name, subtitle, area_key, sort_order }) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const id = sanitizeDutyZoneKey(zoneKey)
  const ref = doc(db, COL, id)
  if ((await getDoc(ref)).exists()) throw new Error('Mã khu đã tồn tại.')
  await setDoc(ref, {
    name: String(name ?? '').trim(),
    subtitle: String(subtitle ?? '').trim(),
    area_key: String(area_key ?? 'other').trim() || 'other',
    sort_order: Number(sort_order) || 0,
    is_active: true,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })
}

export async function updateDutyZone(id, { name, subtitle, area_key, sort_order, is_active }) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const u = { updated_at: serverTimestamp() }
  if (name !== undefined) u.name = String(name).trim()
  if (subtitle !== undefined) u.subtitle = String(subtitle).trim()
  if (area_key !== undefined) u.area_key = String(area_key).trim() || 'other'
  if (sort_order !== undefined) u.sort_order = Number(sort_order) || 0
  if (is_active !== undefined) u.is_active = Boolean(is_active)
  await updateDoc(doc(db, COL, id), u)
}

export async function deleteDutyZone(id) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await deleteDoc(doc(db, COL, id))
}

/** Chỉ tạo document chưa tồn tại (an toàn gọi nhiều lần). */
export async function seedDefaultDutyZones(rows) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  for (const row of rows) {
    const id = sanitizeDutyZoneKey(row.zone_key)
    const ref = doc(db, COL, id)
    if ((await getDoc(ref)).exists()) continue
    await setDoc(ref, {
      name: row.name,
      subtitle: row.subtitle,
      area_key: row.area_key,
      sort_order: row.sort_order ?? 0,
      is_active: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
  }
}
