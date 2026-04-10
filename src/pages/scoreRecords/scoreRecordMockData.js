/** @typedef {'pending' | 'approved' | 'rejected' | 'flagged'} RecordStatus */

export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'single_day', label: 'Một ngày…' },
  { value: 'week', label: '7 ngày qua' },
  { value: 'month', label: '30 ngày qua' },
  { value: 'custom', label: 'Khoảng ngày (từ — đến)…' },
  { value: 'all', label: 'Tất cả' },
]

export const CLASS_FILTER_OPTIONS = [
  { value: 'all', label: 'Mọi lớp' },
  { value: '10A1', label: '10A1' },
  { value: '10C2', label: '10C2' },
  { value: '11B1', label: '11B1' },
  { value: '12A1', label: '12A1' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'approved', label: 'Đã duyệt' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'flagged', label: 'Xử lý nghiêm (cờ)' },
]

export const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'Mọi loại' },
  { value: 'reward', label: 'Điểm +' },
  { value: 'penalty', label: 'Điểm −' },
]

/**
 * Bản ghi điểm tác phong — luồng giám sát & duyệt
 * @type {Array<{
 *   id: string,
 *   at: string,
 *   studentCode: string,
 *   studentName: string,
 *   classCode: string,
 *   ruleCode: string,
 *   ruleName: string,
 *   category: string,
 *   points: number,
 *   type: 'reward'|'penalty',
 *   recordedBy: string,
 *   role: string,
 *   source: 'patrol'|'teacher'|'gvcn',
 *   status: RecordStatus,
 *   note: string,
 *   location?: string
 * }>}
 */
export const SCORE_RECORDS = [
  {
    id: 'BG-2026-0148',
    at: '2026-04-05T07:18:00',
    studentCode: 'HS24001',
    studentName: 'Nguyễn Hoàng Nam',
    classCode: '10A1',
    ruleCode: 'MS-001',
    ruleName: 'Đi học muộn',
    category: 'Chuyên cần',
    points: -2,
    type: 'penalty',
    recordedBy: 'Lê Phương Anh',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'pending',
    note: 'Vào cổng lúc 7:12, thiếu giày thể thao.',
    location: 'Cổng A · Ca sáng',
  },
  {
    id: 'BG-2026-0147',
    at: '2026-04-05T06:55:00',
    studentCode: 'HS23111',
    studentName: 'Nguyễn Thảo Vy',
    classCode: '11B1',
    ruleCode: 'MS-005',
    ruleName: 'Phát biểu xây dựng bài',
    category: 'Học tập',
    points: 5,
    type: 'reward',
    recordedBy: 'Trần Minh Quân',
    role: 'GVCN',
    source: 'gvcn',
    status: 'approved',
    note: 'Trả lời câu hỏi mở, được tổ điểm danh.',
    location: 'Lớp 11B1',
  },
  {
    id: 'BG-2026-0146',
    at: '2026-04-04T15:30:00',
    studentCode: 'HS24022',
    studentName: 'Phạm Gia Huy',
    classCode: '10C2',
    ruleCode: 'MS-024',
    ruleName: 'Đồng phục không đúng quy định',
    category: 'Đồng phục',
    points: -3,
    type: 'penalty',
    recordedBy: 'Đội Sao Đỏ khối 10',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'flagged',
    note: 'Ảnh chụp mờ — cần đối chiếu lại với GVCN.',
    location: 'Sân sau',
  },
  {
    id: 'BG-2026-0145',
    at: '2026-04-04T11:20:00',
    studentCode: 'HS22888',
    studentName: 'Trần Hải Đăng',
    classCode: '12A1',
    ruleCode: 'MS-031',
    ruleName: 'Giúp đỡ bạn trong học tập',
    category: 'Thái độ',
    points: 3,
    type: 'reward',
    recordedBy: 'Hoàng Công Thành',
    role: 'GVCN',
    source: 'teacher',
    status: 'approved',
    note: 'Kèm bạn trong giờ ôn Toán.',
    location: 'Phòng C-301',
  },
  {
    id: 'BG-2026-0144',
    at: '2026-04-03T14:05:00',
    studentCode: 'HS24003',
    studentName: 'Lê Quốc Anh',
    classCode: '10A1',
    ruleCode: 'MS-012',
    ruleName: 'Nghỉ học không phép',
    category: 'Chuyên cần',
    points: -10,
    type: 'penalty',
    recordedBy: 'Nguyễn Văn An',
    role: 'GVCN',
    source: 'gvcn',
    status: 'rejected',
    note: 'Đã có đơn bổ sung sau — hoàn tác theo quy trình.',
    location: '—',
  },
  {
    id: 'BG-2026-0143',
    at: '2026-04-03T07:40:00',
    studentCode: 'HS23112',
    studentName: 'Bùi Tiến Đạt',
    classCode: '11B1',
    ruleCode: 'MS-001',
    ruleName: 'Đi học muộn',
    category: 'Chuyên cần',
    points: -2,
    type: 'penalty',
    recordedBy: 'Phạm Gia Huy',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'approved',
    note: 'Điểm danh muộn tiết 1.',
    location: 'Hành lang B',
  },
  {
    id: 'BG-2026-0142',
    at: '2026-04-02T16:45:00',
    studentCode: 'HS24006',
    studentName: 'Vũ Ngọc Mai',
    classCode: '10A1',
    ruleCode: 'MS-040',
    ruleName: 'Tham gia hoạt động ngoại khóa',
    category: 'Khác',
    points: 2,
    type: 'reward',
    recordedBy: 'Lê Thị Mai',
    role: 'GV bộ môn',
    source: 'teacher',
    status: 'pending',
    note: 'Tham gia CLB Sách · buổi 02/04.',
    location: 'Thư viện',
  },
  {
    id: 'BG-2026-0141',
    at: '2026-04-01T08:00:00',
    studentCode: 'HS24015',
    studentName: 'Đỗ Minh Tú',
    classCode: '10C2',
    ruleCode: 'MS-005',
    ruleName: 'Phát biểu xây dựng bài',
    category: 'Học tập',
    points: 5,
    type: 'reward',
    recordedBy: 'Lê Thị Mai',
    role: 'GVCN',
    source: 'gvcn',
    status: 'approved',
    note: '—',
    location: '10C2',
  },
  {
    id: 'BG-2026-0140',
    at: '2026-03-28T12:10:00',
    studentCode: 'HS23105',
    studentName: 'Hoàng Lan Chi',
    classCode: '11B1',
    ruleCode: 'MS-024',
    ruleName: 'Đồng phục không đúng quy định',
    category: 'Đồng phục',
    points: -3,
    type: 'penalty',
    recordedBy: 'Lê Phương Anh',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'approved',
    note: 'Thiếu phù hiệu.',
    location: 'Căng tin',
  },
  {
    id: 'BG-2026-0139',
    at: '2026-03-27T09:00:00',
    studentCode: 'HS22890',
    studentName: 'Vũ Đức Anh',
    classCode: '12A1',
    ruleCode: 'MS-001',
    ruleName: 'Đi học muộn',
    category: 'Chuyên cần',
    points: -2,
    type: 'penalty',
    recordedBy: 'Hệ thống',
    role: 'Tự động',
    source: 'patrol',
    status: 'flagged',
    note: 'Trùng mã HS với bản ghi cùng ngày — kiểm tra nhập liệu.',
    location: 'Cổng B',
  },
  {
    id: 'BG-2026-0138',
    at: '2026-03-26T14:30:00',
    studentCode: 'HS24008',
    studentName: 'Nguyễn Bảo Ngọc',
    classCode: '10C2',
    ruleCode: 'MS-031',
    ruleName: 'Giúp đỡ bạn trong học tập',
    category: 'Thái độ',
    points: 3,
    type: 'reward',
    recordedBy: 'Trần Thị Bích Ngọc',
    role: 'GVCN phụ',
    source: 'teacher',
    status: 'approved',
    note: '—',
    location: '10C2',
  },
  {
    id: 'BG-2026-0137',
    at: '2026-03-25T07:25:00',
    studentCode: 'HS24002',
    studentName: 'Trần Thu Hà',
    classCode: '10A1',
    ruleCode: 'MS-001',
    ruleName: 'Đi học muộn',
    category: 'Chuyên cần',
    points: -2,
    type: 'penalty',
    recordedBy: 'Lê Phương Anh',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'approved',
    note: 'Xe đến trễ do mưa — đã ghi nhận.',
    location: 'Cổng A',
  },
  {
    id: 'BG-2026-0136',
    at: '2026-03-24T10:15:00',
    studentCode: 'HS24004',
    studentName: 'Phạm Diệu Linh',
    classCode: '10A1',
    ruleCode: 'MS-031',
    ruleName: 'Giúp đỡ bạn trong học tập',
    category: 'Thái độ',
    points: 3,
    type: 'reward',
    recordedBy: 'Nguyễn Văn An',
    role: 'GVCN',
    source: 'gvcn',
    status: 'approved',
    note: 'Hỗ trợ nhóm trong giờ thực hành.',
    location: 'A-101',
  },
  {
    id: 'BG-2026-0135',
    at: '2026-03-22T14:40:00',
    studentCode: 'HS24005',
    studentName: 'Hoàng Đức Thịnh',
    classCode: '10A1',
    ruleCode: 'MS-040',
    ruleName: 'Tham gia hoạt động ngoại khóa',
    category: 'Khác',
    points: 2,
    type: 'reward',
    recordedBy: 'Lê Phương Anh',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'pending',
    note: 'Điểm danh CLB thể thao.',
    location: 'Sân bóng',
  },
  {
    id: 'BG-2026-0134',
    at: '2026-03-20T08:05:00',
    studentCode: 'HS24003',
    studentName: 'Lê Quốc Anh',
    classCode: '10A1',
    ruleCode: 'MS-024',
    ruleName: 'Đồng phục không đúng quy định',
    category: 'Đồng phục',
    points: -3,
    type: 'penalty',
    recordedBy: 'Lê Phương Anh',
    role: 'Sao Đỏ',
    source: 'patrol',
    status: 'approved',
    note: '—',
    location: 'Cổng A',
  },
  {
    id: 'BG-2026-0133',
    at: '2026-03-18T16:20:00',
    studentCode: 'HS24006',
    studentName: 'Vũ Ngọc Mai',
    classCode: '10A1',
    ruleCode: 'MS-005',
    ruleName: 'Phát biểu xây dựng bài',
    category: 'Học tập',
    points: 5,
    type: 'reward',
    recordedBy: 'Nguyễn Văn An',
    role: 'GVCN',
    source: 'gvcn',
    status: 'approved',
    note: '—',
    location: '10A1',
  },
]

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

/** Chuỗi `YYYY-MM-DD` từ `<input type="date">` — biên theo giờ địa phương */
function parseYmdLocal(ymd) {
  if (!ymd || typeof ymd !== 'string') return null
  const parts = ymd.split('-').map(Number)
  const y = parts[0]
  const m = parts[1]
  const day = parts[2]
  if (!y || !m || !day) return null
  const x = new Date(y, m - 1, day)
  return Number.isNaN(x.getTime()) ? null : x
}

function startOfDayLocalYmd(ymd) {
  const x = parseYmdLocal(ymd)
  if (!x) return null
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

function endOfDayLocalYmd(ymd) {
  const x = parseYmdLocal(ymd)
  if (!x) return null
  x.setHours(23, 59, 59, 999)
  return x.getTime()
}

function inCustomRange(ts, dateFromYmd, dateToYmd) {
  const t = new Date(ts).getTime()
  const fromMs = dateFromYmd ? startOfDayLocalYmd(dateFromYmd) : null
  const toMs = dateToYmd ? endOfDayLocalYmd(dateToYmd) : null
  if (fromMs != null && t < fromMs) return false
  if (toMs != null && t > toMs) return false
  return true
}

function inRange(ts, range) {
  const t = new Date(ts).getTime()
  const now = Date.now()
  if (range === 'all') return true
  if (range === 'custom' || range === 'single_day') return true
  if (range === 'today') return startOfDay(ts) === startOfDay(now)
  if (range === 'week') return now - t <= 7 * 86400000
  if (range === 'month') return now - t <= 30 * 86400000
  return true
}

function passesDateFilter(r, filters) {
  if (filters.dateRange === 'custom') {
    const from = filters.customDateFrom?.trim() ?? ''
    const to = filters.customDateTo?.trim() ?? ''
    if (!from && !to) return true
    return inCustomRange(r.at, from, to)
  }
  if (filters.dateRange === 'single_day') {
    const d = filters.singleDateYmd?.trim() ?? ''
    if (!d) return true
    return inCustomRange(r.at, d, d)
  }
  return inRange(r.at, filters.dateRange)
}

function passesClassFilter(r, classCode) {
  if (classCode === 'all') return true
  if (classCode === '__unknown__') return !r.classCode || r.classCode === '—'
  return r.classCode === classCode
}

const SOURCE_LABEL = {
  patrol: 'Tuần tra',
  teacher: 'Giáo viên',
  gvcn: 'GVCN / chủ nhiệm',
}

export function sourceLabel(source) {
  return SOURCE_LABEL[source] ?? source
}

/**
 * @param {typeof SCORE_RECORDS} list
 * @param {{
 *   dateRange: string,
 *   customDateFrom?: string,
 *   customDateTo?: string,
 *   singleDateYmd?: string,
 *   classCode: string,
 *   status: string,
 *   type: string,
 *   query: string
 * }} filters
 */
export function filterScoreRecords(list, filters) {
  const q = filters.query.trim().toLowerCase()
  return list
    .filter((r) => passesDateFilter(r, filters))
    .filter((r) => passesClassFilter(r, filters.classCode))
    .filter((r) => filters.status === 'all' || r.status === filters.status)
    .filter((r) => filters.type === 'all' || r.type === filters.type)
    .filter((r) => {
      if (!q) return true
      const blob = [
        r.id,
        r.rowKey,
        r.studentCode,
        r.studentName,
        r.classCode,
        r.ruleCode,
        r.ruleName,
        r.recordedBy,
        r.note,
        r.schoolYear,
        r.location,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return blob.includes(q)
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}

export function summarizeRecords(list) {
  let pending = 0
  let flagged = 0
  let sumPlus = 0
  let sumMinus = 0
  for (const r of list) {
    if (r.status === 'pending') pending += 1
    if (r.status === 'flagged') flagged += 1
    if (r.points > 0) sumPlus += r.points
    else sumMinus += r.points
  }
  return {
    total: list.length,
    pending,
    flagged,
    sumPlus,
    sumMinus,
  }
}

/** Bản ghi tác phong của một lớp, mới nhất trước */
export function getConductLogsForClass(classCode, list = SCORE_RECORDS) {
  return list
    .filter((r) => r.classCode === classCode)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
}
