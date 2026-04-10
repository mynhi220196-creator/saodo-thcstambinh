import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'

const COL = 'duty_assignments'

const SHIFTS = new Set(['morning', 'afternoon', 'break'])

export function dutySlotDocId(zoneId, dateKey, shift) {
  const z = String(zoneId ?? '').trim()
  const d = String(dateKey ?? '').trim()
  const s = String(shift ?? '').trim()
  if (!z || !d || !s) throw new Error('Thiếu khu vực, ngày hoặc ca.')
  if (!SHIFTS.has(s)) throw new Error('Ca không hợp lệ.')
  return `${z}__${d}__${s}`
}

export function snapshotToDutyAssignment(s) {
  const d = s.data()
  const shift = SHIFTS.has(d.shift) ? d.shift : 'morning'
  return {
    id: s.id,
    zoneId: d.zone_id ?? s.id.split('__')[0] ?? '',
    dateKey: d.date_key ?? '',
    shift,
    memberUid: d.member_uid ?? null,
    memberName: d.member_name ?? '—',
    avatarUrl: String(d.avatar_url ?? '').trim(),
  }
}

export function subscribeDutyAssignments(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push(snapshotToDutyAssignment(s)))
      list.sort((a, b) => {
        const c = a.dateKey.localeCompare(b.dateKey)
        if (c !== 0) return c
        const z = a.zoneId.localeCompare(b.zoneId)
        if (z !== 0) return z
        return a.shift.localeCompare(b.shift)
      })
      onData(list)
    },
    (e) => onError?.(e),
  )
}

export async function upsertDutyAssignment({
  zoneId,
  dateKey,
  shift,
  memberUid,
  memberName,
  avatarUrl,
}) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  if (!SHIFTS.has(shift)) throw new Error('Ca không hợp lệ.')
  const nm = String(memberName ?? '').trim()
  if (!nm) throw new Error('Chọn đội viên.')
  const id = dutySlotDocId(zoneId, dateKey, shift)
  const ref = doc(db, COL, id)
  const snap = await getDoc(ref)
  const payload = {
    zone_id: String(zoneId).trim(),
    date_key: String(dateKey).trim(),
    shift,
    member_uid: memberUid ? String(memberUid) : null,
    member_name: nm,
    avatar_url: avatarUrl?.trim() ? avatarUrl.trim() : null,
    updated_at: serverTimestamp(),
  }
  if (!snap.exists()) {
    payload.created_at = serverTimestamp()
  }
  await setDoc(ref, payload, { merge: true })
}

export async function deleteDutyAssignment(docId) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await deleteDoc(doc(db, COL, docId))
}
