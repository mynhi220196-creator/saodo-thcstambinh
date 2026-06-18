import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { db } from './firebaseClient.js'

const COL_CLASSES = 'classes'
const COL_STUDENTS = 'students'

/** Khóa phân biệt (mã HS + lớp): cùng mã có thể nhiều lớp / năm, không trùng trong một lớp. */
const ENROLL_KEY_SEP = '\x1e'

export function enrollmentKey(studentCode, classId) {
  return `${String(studentCode ?? '').trim()}${ENROLL_KEY_SEP}${classId}`
}

export function buildEnrollmentKeySet(students) {
  const s = new Set()
  for (const st of students) {
    if (!st?.student_code || !st?.class_id) continue
    s.add(enrollmentKey(st.student_code, st.class_id))
  }
  return s
}

export function isTeacherRole(role) {
  return role === 'TEACHER' || role === 'TEACHER_SUBJECT' || role === 'TEACHER_HOMEROOM'
}

export function subscribeClasses(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL_CLASSES),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push({ id: s.id, ...s.data() }))
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/** GVCN: chỉ lớp có `homeroom_teacher_id` trùng uid — query khớp rules Firestore cho giáo viên. */
/** Lớp theo năm học (GV chọn lớp dạy / ghi tác phong). */
export function subscribeClassesForSchoolYear(schoolYear, onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  const y = String(schoolYear ?? '').trim()
  if (!y) {
    onData([])
    return () => {}
  }
  const q = query(collection(db, COL_CLASSES), where('school_year', '==', y))
  return onSnapshot(
    q,
    (snap) => {
      const list = []
      snap.forEach((s) => list.push({ id: s.id, ...s.data() }))
      list.sort((a, b) => String(a.code ?? '').localeCompare(String(b.code ?? ''), 'vi'))
      onData(list)
    },
    (e) => onError?.(e),
  )
}

export function subscribeHomeroomClassesForTeacher(teacherId, onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  const tid = String(teacherId ?? '').trim()
  if (!tid) {
    onData([])
    return () => {}
  }
  const q = query(collection(db, COL_CLASSES), where('homeroom_teacher_id', '==', tid))
  return onSnapshot(
    q,
    (snap) => {
      const list = []
      snap.forEach((s) => list.push({ id: s.id, ...s.data() }))
      onData(list)
    },
    (e) => onError?.(e),
  )
}

export function subscribeStudents(onData, onError) {
  if (!db) {
    onError?.(new Error('Firestore chưa khởi tạo.'))
    return () => {}
  }
  return onSnapshot(
    collection(db, COL_STUDENTS),
    (snap) => {
      const list = []
      snap.forEach((s) => list.push({ id: s.id, ...s.data() }))
      onData(list)
    },
    (e) => onError?.(e),
  )
}

export function subscribeClassDoc(classId, onData, onError) {
  if (!db || !classId) {
    onError?.(new Error('Thiếu lớp.'))
    return () => {}
  }
  const ref = doc(db, COL_CLASSES, classId)
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) onData(null)
      else onData({ id: snap.id, ...snap.data() })
    },
    (e) => onError?.(e),
  )
}

export function subscribeStudentsByClassId(classId, onData, onError) {
  if (!db || !classId) {
    onData([])
    return () => {}
  }
  const q = query(collection(db, COL_STUDENTS), where('class_id', '==', classId))
  return onSnapshot(
    q,
    (snap) => {
      const list = []
      snap.forEach((s) => list.push({ id: s.id, ...s.data() }))
      onData(list)
    },
    (e) => onError?.(e),
  )
}

/** Một GV chỉ làm GVCN một lớactive trong cùng năm học. */
export function assertHomeroomTeacherAvailable(allClasses, { teacherId, schoolYear, excludeClassId }) {
  if (!teacherId) return
  const dup = allClasses.find(
    (c) =>
      c.id !== excludeClassId &&
      c.school_year === schoolYear &&
      c.homeroom_teacher_id === teacherId &&
      c.is_active !== false,
  )
  if (dup) {
    throw new Error(`Giáo viên này đã làm GVCN lớp ${dup.code} trong năm học ${schoolYear}.`)
  }
}

export async function createClass(payload, allClasses) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const {
    code,
    grade,
    school_year,
    homeroom_teacher_id,
    room,
    is_active,
  } = payload
  assertHomeroomTeacherAvailable(allClasses, {
    teacherId: homeroom_teacher_id || null,
    schoolYear: school_year,
    excludeClassId: null,
  })
  const dupCode = allClasses.some(
    (c) => c.code === code && c.school_year === school_year,
  )
  if (dupCode) throw new Error('Mã lớp đã tồn tại trong năm học này.')

  await addDoc(collection(db, COL_CLASSES), {
    code,
    grade: Number(grade),
    school_year,
    homeroom_teacher_id: homeroom_teacher_id || null,
    room: room?.trim() ? room.trim() : '',
    is_active: is_active !== false,
    created_at: serverTimestamp(),
  })
}

export async function updateClass(classId, payload, allClasses) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const {
    code,
    grade,
    school_year,
    homeroom_teacher_id,
    room,
    is_active,
  } = payload
  assertHomeroomTeacherAvailable(allClasses, {
    teacherId: homeroom_teacher_id || null,
    schoolYear: school_year,
    excludeClassId: classId,
  })
  const dupCode = allClasses.some(
    (c) => c.id !== classId && c.code === code && c.school_year === school_year,
  )
  if (dupCode) throw new Error('Mã lớp đã tồn tại trong năm học này.')

  await updateDoc(doc(db, COL_CLASSES, classId), {
    code,
    grade: Number(grade),
    school_year,
    homeroom_teacher_id: homeroom_teacher_id || null,
    room: room?.trim() ? room.trim() : '',
    is_active: is_active !== false,
  })
}

export async function setClassActive(classId, is_active) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  await updateDoc(doc(db, COL_CLASSES, classId), { is_active })
}

export function genderLabel(g) {
  if (g === 'MALE') return 'Nam'
  if (g === 'FEMALE') return 'Nữ'
  if (g === 'OTHER') return 'Khác'
  return '—'
}

const DETAIL_FALLBACK = {
  departmentName: '—',
  viceHomeroom: null,
  weekdayMeeting: 'Chưa cập nhật',
  conductMonthAvg: null,
  conductTrend: 'flat',
  positivePointsMonth: null,
  minusPointsMonth: null,
  dutyStudentThisWeek: 'Chưa phân công',
  saoDoLeadName: null,
  internalNotes: 'Chưa có ghi chú nội bộ.',
}

/** Gộp dữ liệu Firestore → props UI chi tiết lớp (roster thật; tác phong mock sau). */
export function buildClassDetailForUi(classData, studentRows, teacherProfile) {
  const roster = studentRows
    .filter((s) => !s.is_deleted)
    .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi'))
    .map((s) => ({
      id: s.id,
      studentCode: s.student_code,
      fullName: s.full_name,
      classCode: classData.code,
      gender: genderLabel(s.gender),
      conductAvg: '—',
    }))

  return {
    ...DETAIL_FALLBACK,
    code: classData.code,
    grade: classData.grade,
    schoolYear: classData.school_year,
    room: classData.room || '—',
    status: classData.is_active === false ? 'archived' : 'active',
    homeroomTeacher: teacherProfile?.full_name ?? '—',
    email: teacherProfile?.email ?? '—',
    phoneGvcn: teacherProfile?.phone ?? '—',
    studentCount: roster.length,
    roster,
  }
}

export async function createStudent(payload, existingEnrollmentKeys) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const code = payload.student_code?.trim()
  if (!code) throw new Error('Nhập mã học sinh.')
  const classId = payload.class_id
  if (!classId) throw new Error('Chọn lớp.')
  const ek = enrollmentKey(code, classId)
  if (existingEnrollmentKeys.has(ek)) {
    throw new Error('Học sinh đã có trong lớp này (cùng mã).')
  }

  await addDoc(collection(db, COL_STUDENTS), {
    student_code: code,
    full_name: payload.full_name.trim(),
    gender: payload.gender,
    date_of_birth: payload.date_of_birth || '',
    class_id: payload.class_id,
    guardian_phone: payload.guardian_phone?.trim() ? payload.guardian_phone.trim() : '',
    is_deleted: false,
    created_at: serverTimestamp(),
  })
}

export async function updateStudent(studentId, payload) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  const u = {}
  if (payload.full_name !== undefined) u.full_name = payload.full_name.trim()
  if (payload.gender !== undefined) u.gender = payload.gender
  if (payload.date_of_birth !== undefined) u.date_of_birth = payload.date_of_birth || ''
  if (payload.class_id !== undefined) u.class_id = payload.class_id
  if (payload.guardian_phone !== undefined) {
    u.guardian_phone = payload.guardian_phone?.trim() ? payload.guardian_phone.trim() : ''
  }
  if (payload.is_deleted !== undefined) u.is_deleted = payload.is_deleted
  await updateDoc(doc(db, COL_STUDENTS, studentId), u)
}

export async function softDeleteStudent(studentId) {
  await updateStudent(studentId, { is_deleted: true })
}

/**
 * Import nhiều học sinh vào một lớp.
 * Row: student_code, full_name, gender, date_of_birth, guardian_phone (tuỳ chọn).
 * gender: Nam|Nữ|Khác hoặc MALE|FEMALE|OTHER
 * date_of_birth: YYYY-MM-DD (parse Excel: dd/mm/yyyy, yyyy-mm-dd, serial/Date — studentImportExcel.js).
 */
export async function importStudentsForClass(classId, rows, existingEnrollmentKeys) {
  if (!db) throw new Error('Firestore chưa khởi tạo.')
  if (!classId) throw new Error('Thiếu lớp đích.')
  const col = collection(db, COL_STUDENTS)
  const parseGender = (raw) => {
    const x = String(raw || '')
      .trim()
      .toLowerCase()
    if (['nam', 'male', 'm'].includes(x)) return 'MALE'
    if (['nữ', 'nu', 'female', 'f'].includes(x)) return 'FEMALE'
    return 'OTHER'
  }

  const toAdd = []
  for (const r of rows) {
    const student_code = String(r.student_code ?? r[0] ?? '')
      .trim()
    const full_name = String(r.full_name ?? r[1] ?? '')
      .trim()
    if (!student_code || !full_name) continue
    const ek = enrollmentKey(student_code, classId)
    if (existingEnrollmentKeys.has(ek)) continue
    existingEnrollmentKeys.add(ek)
    toAdd.push({
      student_code,
      full_name,
      gender: parseGender(r.gender ?? r[2]),
      date_of_birth: String(r.date_of_birth ?? r[3] ?? '')
        .trim(),
      class_id: classId,
      guardian_phone: String(r.guardian_phone ?? r[4] ?? '')
        .trim(),
      is_deleted: false,
      created_at: serverTimestamp(),
    })
  }

  const BATCH = 400
  for (let i = 0; i < toAdd.length; i += BATCH) {
    const batch = writeBatch(db)
    const chunk = toAdd.slice(i, i + BATCH)
    for (const data of chunk) {
      const ref = doc(col)
      batch.set(ref, data)
    }
    await batch.commit()
  }
  return toAdd.length
}
