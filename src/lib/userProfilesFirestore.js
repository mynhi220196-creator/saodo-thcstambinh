import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { formatDateVN } from './dateFormat.js'
import { db } from './firebaseClient.js'
import { createAuthUserWithSecondaryApp } from './secondaryFirebaseAuth.js'

/** GVBM / GVCN phân biệt qua phân công lớp (homeroom_assignments), không qua role hồ sơ. */
export const CREATABLE_ROLES = ['TEACHER', 'RED_STAR']

export function subscribeProfiles(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, 'profiles'),
    (snap) => {
      const list = []
      snap.forEach((s) => {
        list.push({ id: s.id, ...s.data() })
      })
      onData(list)
    },
    (err) => onError?.(err),
  )
}

function toMillis(v) {
  if (!v) return null
  if (typeof v.toMillis === 'function') return v.toMillis()
  if (v.seconds != null) return v.seconds * 1000
  return null
}

/** Chuẩn hoá document Firestore → dòng UI (chỉ user chưa xóa mềm). */
export function profileDocToRow(raw) {
  if (raw.is_deleted === true) return null

  const lastMs = toMillis(raw.last_login_at)
  const createdMs = toMillis(raw.created_at)

  let status = 'active'
  if (raw.is_active === false) status = 'locked'
  else if (!lastMs) status = 'pending'

  const role = raw.role ?? 'RED_STAR'
  let roleFilterKey = 'other'
  if (role === 'ADMIN') roleFilterKey = 'admin'
  else if (role === 'TEACHER' || role === 'TEACHER_SUBJECT' || role === 'TEACHER_HOMEROOM') roleFilterKey = 'teacher'
  else if (role === 'RED_STAR') roleFilterKey = 'sao_do'

  return {
    id: raw.id,
    email: raw.email ?? '—',
    fullName: raw.full_name ?? '',
    avatar: String(raw.avatar_url ?? '').trim(),
    role,
    roleFilterKey,
    unit: raw.unit ?? '',
    lastLoginAt: lastMs ? new Date(lastMs).toISOString() : '',
    createdAt: createdMs ? formatDateVN(createdMs) : '—',
    status,
    _raw: raw,
  }
}

/**
 * Hàng hiển thị trang quản lý giáo viên (profile role teacher + lớp GVCN từ `classes`).
 */
export function buildTeacherDisplayRows(profiles, classes) {
  const activeClasses = (classes ?? []).filter((c) => c.is_active !== false)
  const rows = []
  for (const raw of profiles ?? []) {
    const pr = profileDocToRow(raw)
    if (!pr || pr.roleFilterKey !== 'teacher') continue
    const homerooms = activeClasses
      .filter((c) => c.homeroom_teacher_id === pr.id)
      .map((c) => `${c.code} · ${c.school_year}`)
      .sort((a, b) => a.localeCompare(b, 'vi'))
    const phone = raw.phone
    rows.push({
      id: pr.id,
      codeShort: pr.id.length > 10 ? `${pr.id.slice(0, 8)}…` : pr.id,
      name: pr.fullName || '—',
      email: pr.email,
      avatar: pr.avatar,
      department: raw.unit?.trim() ? raw.unit.trim() : '—',
      homeroomClass: homerooms.length ? homerooms.join(', ') : null,
      phone: phone ? String(phone) : '—',
      status: pr.status,
      _raw: raw,
    })
  }
  rows.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  return rows
}

/**
 * Hàng UI trang thành viên Sao Đỏ: profile `role === RED_STAR`.
 * Field tùy chọn trên document: `sao_do_class`, `sao_do_grade` (10|11|12), `sao_do_role` (lead|deputy|member), `sao_do_shift` (morning|afternoon|break|flex).
 * Nếu thiếu, suy khối từ đầu chuỗi lớp; vai trò/ca mặc định member / flex.
 */
export function buildSaoDoMemberRows(profiles) {
  const rows = []
  for (const raw of profiles ?? []) {
    const pr = profileDocToRow(raw)
    if (!pr || pr.roleFilterKey !== 'sao_do') continue

    const classHint = String(raw.sao_do_class ?? raw.unit ?? '').trim()
    const className = classHint || '—'

    let grade = null
    const g = Number(raw.sao_do_grade)
    if ([10, 11, 12].includes(g)) grade = g
    else {
      const m = className.match(/^(10|11|12)\b/)
      if (m) grade = Number(m[1])
    }

    const role = ['lead', 'deputy', 'member'].includes(raw.sao_do_role) ? raw.sao_do_role : 'member'
    const shiftPref = ['morning', 'afternoon', 'break', 'flex'].includes(raw.sao_do_shift)
      ? raw.sao_do_shift
      : 'flex'

    const createdMs = toMillis(raw.created_at)
    const joinedAt =
      createdMs != null && createdMs > 0
        ? `${String(new Date(createdMs).getMonth() + 1).padStart(2, '0')}/${new Date(createdMs).getFullYear()}`
        : '—'

    let status = pr.status
    if (status === 'locked') status = 'suspended'

    rows.push({
      id: pr.id,
      code: pr.id.length > 10 ? `${pr.id.slice(0, 8)}…` : pr.id,
      name: pr.fullName || '—',
      email: pr.email,
      className,
      grade,
      role,
      shiftPref,
      joinedAt,
      phone: raw.phone ? String(raw.phone) : '—',
      avatar: pr.avatar,
      status,
      _raw: raw,
    })
  }
  rows.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  return rows
}

/** Số giáo viên (profile) có created_at trong tháng hiện tại. */
export function countTeachersCreatedThisMonth(profiles) {
  const now = new Date()
  const y = now.getFullYear()
  const mo = now.getMonth()
  let n = 0
  for (const raw of profiles ?? []) {
    const pr = profileDocToRow(raw)
    if (!pr || pr.roleFilterKey !== 'teacher') continue
    const ms = toMillis(raw.created_at)
    if (ms == null) continue
    const d = new Date(ms)
    if (d.getFullYear() === y && d.getMonth() === mo) n += 1
  }
  return n
}

export function filterProfileRows(list, roleFilter, statusFilter, query) {
  const q = query.trim().toLowerCase()
  return list
    .filter((u) => {
      if (roleFilter !== 'all' && u.roleFilterKey !== roleFilter) return false
      if (statusFilter !== 'all' && u.status !== statusFilter) return false
      if (!q) return true
      const blob = [u.id, u.fullName, u.email, u.unit, u.role].join(' ').toLowerCase()
      return blob.includes(q)
    })
    .sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'))
}

export async function createUserAccount({
  email,
  password,
  full_name,
  phone,
  role,
  unit,
}) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const em = email.trim().toLowerCase()
  if (!em.includes('@')) throw new Error('Email không hợp lệ.')
  if (password.length < 6) throw new Error('Mật khẩu tạm cần ít nhất 6 ký tự.')
  if (!full_name?.trim()) throw new Error('Nhập họ tên.')
  if (!CREATABLE_ROLES.includes(role)) throw new Error('Vai trò không hợp lệ.')

  const reg = await createAuthUserWithSecondaryApp(em, password)

  try {
    await setDoc(doc(db, 'profiles', reg.uid), {
      email: em,
      full_name: full_name.trim(),
      phone: phone?.trim() ? phone.trim() : null,
      role,
      unit: unit?.trim() ? unit.trim() : '',
      is_active: true,
      is_deleted: false,
      avatar_url: null,
      created_at: serverTimestamp(),
      last_login_at: null,
    })
  } catch (e) {
    await reg.disposeWithoutKeepingUser()
    if (e?.code === 'auth/email-already-in-use') {
      throw new Error('Email đã được sử dụng.')
    }
    if (e?.code === 'auth/weak-password') {
      throw new Error('Mật khẩu quá yếu.')
    }
    throw e instanceof Error ? e : new Error(String(e?.message ?? e))
  }

  await reg.finishSuccess()
}

export async function updateUserProfile(uid, { full_name, phone, avatar_url, unit, role }) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const payload = {}
  if (full_name !== undefined) payload.full_name = full_name.trim()
  if (phone !== undefined) payload.phone = phone?.trim() ? phone.trim() : null
  if (avatar_url !== undefined) payload.avatar_url = avatar_url?.trim() ? avatar_url.trim() : null
  if (unit !== undefined) payload.unit = unit?.trim() ? unit.trim() : ''
  if (role !== undefined) payload.role = role
  await updateDoc(doc(db, 'profiles', uid), payload)
}

export async function setUserActive(uid, is_active) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await updateDoc(doc(db, 'profiles', uid), { is_active })
}

export async function softDeleteUser(uid) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await updateDoc(doc(db, 'profiles', uid), { is_deleted: true })
}
