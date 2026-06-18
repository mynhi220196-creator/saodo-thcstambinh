import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'

const COL = 'notifications'

function toMillis(v) {
  if (!v) return 0
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return 0
}

const TYPE_ICON = {
  conduct_recorded: 'fact_check',
  dispute_raised: 'gavel',
  dispute_resolved: 'how_to_reg',
}

export function snapshotToNotification(s) {
  const d = s.data()
  const type = d.type ?? ''
  return {
    id: s.id,
    type,
    icon: TYPE_ICON[type] || 'notifications',
    title: d.title ?? '',
    body: d.body ?? '',
    link: d.link ?? '',
    read: d.read === true,
    recipientUid: d.recipient_uid ?? '',
    recipientRole: d.recipient_role ?? '',
    createdBy: d.created_by ?? '',
    createdByName: d.created_by_name ?? '',
    _createdMs: toMillis(d.created_at),
  }
}

/** Tạo một thông báo. Tự gắn read=false + created_at. */
export async function createNotification({
  recipientUid = '',
  recipientRole = '',
  type,
  title,
  body,
  link = '',
  createdBy,
  createdByName = '',
}) {
  if (!db) return
  const rUid = String(recipientUid ?? '').trim()
  const rRole = String(recipientRole ?? '').trim()
  if (!rUid && rRole !== 'ADMIN') return // không có người nhận hợp lệ
  await addDoc(collection(db, COL), {
    recipient_uid: rUid,
    recipient_role: rRole,
    type,
    title: String(title ?? '').slice(0, 200),
    body: String(body ?? '').slice(0, 1000),
    link: String(link ?? ''),
    read: false,
    created_by: String(createdBy ?? '').trim(),
    created_by_name: String(createdByName ?? '').trim(),
    created_at: serverTimestamp(),
  })
}

/**
 * Theo dõi thông báo của tôi: gộp các thông báo gửi đích danh (recipient_uid)
 * và (nếu là admin) thông báo gửi cho vai trò ADMIN. Sắp xếp mới nhất trước.
 */
export function subscribeMyNotifications({ uid, isAdmin = false }, onData, onError) {
  if (!db || !uid) {
    onData?.([])
    return () => {}
  }
  const buckets = { self: [], role: [] }
  const emit = () => {
    const map = new Map()
    for (const n of [...buckets.self, ...buckets.role]) map.set(n.id, n)
    const list = [...map.values()].sort((a, b) => b._createdMs - a._createdMs)
    onData?.(list)
  }

  const unsubs = []
  unsubs.push(
    onSnapshot(
      query(collection(db, COL), where('recipient_uid', '==', uid)),
      (snap) => {
        buckets.self = []
        snap.forEach((s) => buckets.self.push(snapshotToNotification(s)))
        emit()
      },
      (e) => onError?.(e),
    ),
  )
  if (isAdmin) {
    unsubs.push(
      onSnapshot(
        query(collection(db, COL), where('recipient_role', '==', 'ADMIN')),
        (snap) => {
          buckets.role = []
          snap.forEach((s) => buckets.role.push(snapshotToNotification(s)))
          emit()
        },
        (e) => onError?.(e),
      ),
    )
  }
  return () => unsubs.forEach((u) => u())
}

export async function markNotificationRead(id) {
  if (!db || !id) return
  await updateDoc(doc(db, COL, id), { read: true })
}

export async function markAllNotificationsRead(list) {
  if (!db) return
  const unread = (list ?? []).filter((n) => !n.read)
  await Promise.all(unread.map((n) => updateDoc(doc(db, COL, n.id), { read: true }).catch(() => {})))
}

export async function deleteNotification(id) {
  if (!db || !id) return
  await deleteDoc(doc(db, COL, id))
}

/* ---- Helper builders cho 3 sự kiện ---- */

/** Sao Đỏ/GV ghi nhận lỗi → báo GVCN của lớp (bỏ qua nếu người ghi chính là GVCN). */
export async function notifyConductRecorded({
  homeroomTeacherId,
  classId,
  classCode,
  studentName,
  criterionName,
  points,
  createdBy,
  createdByName,
}) {
  const rid = String(homeroomTeacherId ?? '').trim()
  if (!rid || rid === String(createdBy ?? '').trim()) return
  await createNotification({
    recipientUid: rid,
    type: 'conduct_recorded',
    title: `Lớp ${classCode || '—'} bị ghi lỗi tác phong`,
    body: `${studentName || 'Học sinh'} · ${criterionName || 'Vi phạm'} (${points})${
      createdByName ? ` · ${createdByName}` : ''
    }`,
    link: classId ? `/giao-vien/lop-hoc/${classId}` : '/giao-vien/lop-hoc',
    createdBy,
    createdByName,
  })
}

/** GVCN gửi khiếu nại → báo toàn bộ Admin. */
export async function notifyDisputeRaised({
  classCode,
  studentName,
  createdBy,
  createdByName,
}) {
  await createNotification({
    recipientRole: 'ADMIN',
    type: 'dispute_raised',
    title: `Khiếu nại mới · Lớp ${classCode || '—'}`,
    body: `${createdByName || 'GVCN'} khiếu nại bản ghi của ${studentName || 'học sinh'}. Cần phân xử.`,
    link: '/admin/score-records',
    createdBy,
    createdByName,
  })
}

/** Admin phân xử khiếu nại → báo GVCN đã gửi. outcome: 'accepted' | 'rejected'. */
export async function notifyDisputeResolved({
  recipientUid,
  classCode,
  studentName,
  outcome,
  createdBy,
  createdByName,
}) {
  if (!recipientUid) return
  const accepted = outcome === 'accepted'
  await createNotification({
    recipientUid,
    type: 'dispute_resolved',
    title: accepted ? 'Khiếu nại được chấp nhận' : 'Khiếu nại bị bác',
    body: `Lớp ${classCode || '—'} · ${studentName || 'học sinh'}: ${
      accepted ? 'điểm trừ đã được gỡ.' : 'Ban giám hiệu giữ nguyên điểm.'
    }`,
    link: '/giao-vien/lich-su-ghi-nhan',
    createdBy,
    createdByName,
  })
}
