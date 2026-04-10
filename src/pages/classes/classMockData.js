import { buildSchoolYearOptions, currentSchoolYearValue } from '../../lib/academicYearOptions.js'

/** 10 năm học lùi từ năm hiện tại (tháng 9 = chuyển năm học mới). */
export const SCHOOL_YEAR_OPTIONS = buildSchoolYearOptions(10)
export const CURRENT_SCHOOL_YEAR = currentSchoolYearValue()

/** `all` = mọi khối (THCS + THPT) */
export const GRADE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả khối' },
  { value: '6', label: 'Khối 6' },
  { value: '7', label: 'Khối 7' },
  { value: '8', label: 'Khối 8' },
  { value: '9', label: 'Khối 9' },
  { value: '10', label: 'Khối 10' },
  { value: '11', label: 'Khối 11' },
  { value: '12', label: 'Khối 12' },
]

export const GRADE_OPTIONS_FORM = [
  { value: '6', label: 'Khối 6' },
  { value: '7', label: 'Khối 7' },
  { value: '8', label: 'Khối 8' },
  { value: '9', label: 'Khối 9' },
  { value: '10', label: 'Khối 10' },
  { value: '11', label: 'Khối 11' },
  { value: '12', label: 'Khối 12' },
]

export const CLASSES = [
  {
    code: '10A1',
    schoolYear: '2024-2025',
    grade: 10,
    homeroomTeacher: 'Nguyễn Văn An',
    studentCount: 45,
    room: 'A-101',
    email: 'an.nv@school.edu.vn',
    status: 'active',
  },
  {
    code: '10C2',
    schoolYear: '2024-2025',
    grade: 10,
    homeroomTeacher: 'Lê Thị Mai',
    studentCount: 44,
    room: 'A-203',
    email: 'mai.lt@school.edu.vn',
    status: 'active',
  },
  {
    code: '11B1',
    schoolYear: '2024-2025',
    grade: 11,
    homeroomTeacher: 'Trần Minh Quân',
    studentCount: 42,
    room: 'B-105',
    email: 'quan.tm@school.edu.vn',
    status: 'active',
  },
  {
    code: '11B3',
    schoolYear: '2024-2025',
    grade: 11,
    homeroomTeacher: 'Phạm Ngọc Lan',
    studentCount: 43,
    room: 'B-208',
    email: 'lan.pn@school.edu.vn',
    status: 'active',
  },
  {
    code: '12A1',
    schoolYear: '2024-2025',
    grade: 12,
    homeroomTeacher: 'Hoàng Công Thành',
    studentCount: 40,
    room: 'C-301',
    email: 'thanh.hc@school.edu.vn',
    status: 'active',
  },
  {
    code: '10A3',
    schoolYear: '2023-2024',
    grade: 10,
    homeroomTeacher: 'Đỗ Tuấn Kiệt',
    studentCount: 46,
    room: 'A-102',
    email: 'kiet.dt@school.edu.vn',
    status: 'archived',
  },
  {
    code: '12C5',
    schoolYear: '2023-2024',
    grade: 12,
    homeroomTeacher: 'Vũ Thùy Chi',
    studentCount: 38,
    room: 'C-210',
    email: 'chi.vt@school.edu.vn',
    status: 'archived',
  },
]

export function filterClasses(list, schoolYear, gradeFilter) {
  return list.filter((c) => {
    if (c.schoolYear !== schoolYear) return false
    if (gradeFilter === 'all') return true
    return String(c.grade) === gradeFilter
  })
}

const CLASSES_STORAGE_KEY = 'saodo.classes'

/** Danh sách lớp đã lưu (thêm/sửa trên UI) — dùng chung trang danh sách & chi tiết */
export function loadClassesFromStorage() {
  try {
    const raw = sessionStorage.getItem(CLASSES_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function persistClassesToStorage(list) {
  try {
    sessionStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore quota / private mode */
  }
}

const NAME_POOL = [
  ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi'],
  ['Minh', 'Hương', 'Anh', 'Tuấn', 'Lan', 'Dũng', 'Hà', 'Chi', 'Khang', 'Phương'],
  ['An', 'Bình', 'Cường', 'Dung', 'Em', 'Giang', 'Hải', 'Khoa', 'Linh', 'Mai'],
]

function hashCode(s) {
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

const ROSTER_MAX_STUDENTS = 120

function buildPlaceholderStudentRow(classCode, index, h) {
  const a = NAME_POOL[0][(h + index * 3) % NAME_POOL[0].length]
  const b = NAME_POOL[1][(h + index * 5) % NAME_POOL[1].length]
  const c = NAME_POOL[2][(h + index * 7) % NAME_POOL[2].length]
  const idx = h + index + 1
  return {
    studentCode: `${classCode}-S${String(index + 1).padStart(3, '0')}`,
    fullName: `${a} ${b} ${c}`,
    gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
    conductAvg: Math.round((7 + ((idx * 13) % 25) / 10) * 10) / 10,
  }
}

/**
 * Danh sách học sinh đủ `totalCount` bản ghi (ưu tiên `seedRoster` cho các dòng đầu).
 */
export function buildFullClassRoster(classCode, totalCount, seedRoster = []) {
  const n = Math.min(Math.max(0, totalCount), ROSTER_MAX_STUDENTS)
  const h = hashCode(classCode)
  const out = []
  for (let i = 0; i < n; i += 1) {
    if (i < seedRoster.length) out.push({ ...seedRoster[i] })
    else out.push(buildPlaceholderStudentRow(classCode, i, h))
  }
  return out
}

/**
 * Dữ liệu mở rộng cho trang chi tiết (GVCN phụ, tác phong, trực nhật, roster mẫu…).
 * Lớp không có key sẽ dùng giá trị mặc định + roster giả lập.
 */
export const CLASS_DETAIL_EXTRA = {
  '10A1': {
    departmentName: 'Tổ Toán — Tin học',
    viceHomeroom: 'Trần Thị Bích Ngọc',
    phoneGvcn: '0901 234 567',
    weekdayMeeting: 'Thứ 2 — Tiết 5 · Phòng A-101',
    conductMonthAvg: 8.6,
    conductTrend: 'up',
    positivePointsMonth: 124,
    minusPointsMonth: 18,
    dutyStudentThisWeek: 'Nguyễn Minh Khang',
    saoDoLeadName: 'Lê Phương Anh',
    internalNotes:
      'Lớp nề nếp tốt; cần nhắc nhở thêm khu vực sân sau sau giờ ra chơi. Điểm cộng nề nếp cao nhất khối 10 tuần 12.',
    roster: [
      { studentCode: 'HS24001', fullName: 'Nguyễn Hoàng Nam', gender: 'Nam', conductAvg: 9.2 },
      { studentCode: 'HS24002', fullName: 'Trần Thu Hà', gender: 'Nữ', conductAvg: 8.8 },
      { studentCode: 'HS24003', fullName: 'Lê Quốc Anh', gender: 'Nam', conductAvg: 8.5 },
      { studentCode: 'HS24004', fullName: 'Phạm Diệu Linh', gender: 'Nữ', conductAvg: 9.0 },
      { studentCode: 'HS24005', fullName: 'Hoàng Đức Thịnh', gender: 'Nam', conductAvg: 7.9 },
      { studentCode: 'HS24006', fullName: 'Vũ Ngọc Mai', gender: 'Nữ', conductAvg: 8.7 },
    ],
  },
  '11B1': {
    departmentName: 'Tổ Văn — Sử — Địa',
    viceHomeroom: null,
    phoneGvcn: '0912 888 441',
    weekdayMeeting: 'Thứ 4 — Tiết 1 · Phòng B-105',
    conductMonthAvg: 8.1,
    conductTrend: 'flat',
    positivePointsMonth: 98,
    minusPointsMonth: 24,
    dutyStudentThisWeek: 'Đỗ Thị Yến',
    saoDoLeadName: 'Phạm Gia Huy',
    internalNotes: 'Theo dõi nhóm hay đi muộn buổi sáng thứ Hai.',
    roster: [
      { studentCode: 'HS23110', fullName: 'Bùi Tiến Đạt', gender: 'Nam', conductAvg: 8.0 },
      { studentCode: 'HS23111', fullName: 'Nguyễn Thảo Vy', gender: 'Nữ', conductAvg: 8.4 },
      { studentCode: 'HS23112', fullName: 'Trần Hải Đăng', gender: 'Nam', conductAvg: 7.6 },
    ],
  },
}

const DETAIL_DEFAULTS = {
  departmentName: '—',
  viceHomeroom: null,
  phoneGvcn: '—',
  weekdayMeeting: 'Chưa cập nhật',
  conductMonthAvg: null,
  conductTrend: 'flat',
  positivePointsMonth: null,
  minusPointsMonth: null,
  dutyStudentThisWeek: 'Chưa phân công',
  saoDoLeadName: null,
  internalNotes: 'Chưa có ghi chú nội bộ.',
}

/**
 * @param {string} code
 * @param {typeof CLASSES} [classList]
 * @returns {null | object} Hợp nhất bản ghi lớp + nghiệp vụ chi tiết
 */
export function getClassDetail(code, classList = CLASSES) {
  const base = classList.find((c) => c.code === code)
  if (!base) return null
  const extra = CLASS_DETAIL_EXTRA[code] ?? {}
  const seed = Array.isArray(extra.roster) ? extra.roster : []
  const roster = buildFullClassRoster(base.code, base.studentCount, seed)
  return {
    ...DETAIL_DEFAULTS,
    ...base,
    ...extra,
    roster,
  }
}
