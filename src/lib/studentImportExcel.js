import * as XLSX from 'xlsx'

/** Chuẩn hoá tiêu đề cột (bỏ dấu, gạch dưới). */
function normalizeHeaderKey(s) {
  return String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^\w]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

const HEADER_TO_FIELD = {
  ma_hs: 'student_code',
  student_code: 'student_code',
  ma_hoc_sinh: 'student_code',
  mahs: 'student_code',
  ho_ten: 'full_name',
  full_name: 'full_name',
  hoten: 'full_name',
  ten: 'full_name',
  name: 'full_name',
  gioi_tinh: 'gender',
  gender: 'gender',
  ngay_sinh: 'date_of_birth',
  date_of_birth: 'date_of_birth',
  dob: 'date_of_birth',
  sinh_nhat: 'date_of_birth',
  sdt_phu_huynh: 'guardian_phone',
  guardian_phone: 'guardian_phone',
  dien_thoai_phu_huynh: 'guardian_phone',
  so_dien_thoai: 'guardian_phone',
  sdt: 'guardian_phone',
}

function pad2(n) {
  return n < 10 ? `0${n}` : String(n)
}

/** Ngày theo giờ địa phương → YYYY-MM-DD (tránh lệch ngày khi dùng toISOString / UTC). */
function dateToYmdLocal(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/**
 * Chuỗi ngày → YYYY-MM-DD (chuẩn lưu Firestore / form).
 * Hỗ trợ: yyyy-mm-dd; dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy (chuẩn VN); yyyy/mm/dd.
 */
function parseFlexibleDateToYmd(input) {
  const t = String(input ?? '').trim()
  if (!t) return ''

  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) {
    const y = Number(iso[1])
    const m = Number(iso[2])
    const day = Number(iso[3])
    if (m >= 1 && m <= 12 && day >= 1 && day <= 31 && y >= 1900 && y <= 2100) {
      const trial = new Date(y, m - 1, day)
      if (trial.getFullYear() === y && trial.getMonth() === m - 1 && trial.getDate() === day) {
        return `${iso[1]}-${iso[2]}-${iso[3]}`
      }
    }
    return ''
  }

  const vn = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (vn) {
    const day = Number(vn[1])
    const m = Number(vn[2])
    const y = Number(vn[3])
    if (m >= 1 && m <= 12 && day >= 1 && day <= 31 && y >= 1900 && y <= 2100) {
      const trial = new Date(y, m - 1, day)
      if (trial.getFullYear() === y && trial.getMonth() === m - 1 && trial.getDate() === day) {
        return `${y}-${pad2(m)}-${pad2(day)}`
      }
    }
    return ''
  }

  const ymdSlash = t.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/)
  if (ymdSlash) {
    const y = Number(ymdSlash[1])
    const m = Number(ymdSlash[2])
    const day = Number(ymdSlash[3])
    if (m >= 1 && m <= 12 && day >= 1 && day <= 31 && y >= 1900 && y <= 2100) {
      const trial = new Date(y, m - 1, day)
      if (trial.getFullYear() === y && trial.getMonth() === m - 1 && trial.getDate() === day) {
        return `${y}-${pad2(m)}-${pad2(day)}`
      }
    }
    return ''
  }

  const ms = Date.parse(t)
  if (!Number.isNaN(ms)) return dateToYmdLocal(new Date(ms))
  return ''
}

/** Excel serial (ngày) → YYYY-MM-DD (theo lịch Excel, thành phần UTC). */
function excelSerialToYmd(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return ''
  const excelEpochUtc = Date.UTC(1899, 11, 30)
  const ms = excelEpochUtc + Math.round(n * 86400000)
  const d = new Date(ms)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

function cellToDateString(v, { warn } = {}) {
  if (v == null || v === '') return ''
  if (typeof v === 'number') {
    return excelSerialToYmd(v)
  }
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return ''
    return dateToYmdLocal(v)
  }
  const s = String(v).trim()
  const ymd = parseFlexibleDateToYmd(s)
  if (!ymd && s && warn) {
    warn(`Ngày sinh «${s}» không đọc được — dùng dd/mm/yyyy hoặc yyyy-mm-dd (hoặc ô định dạng Ngày trong Excel).`)
  }
  return ymd
}

function cellToPhone(v) {
  if (v == null || v === '') return ''
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return ''
    return String(Math.round(v))
  }
  return String(v).trim()
}

function rowLooksLikeHeader(cells) {
  const joined = cells.map((c) => normalizeHeaderKey(c)).join('|')
  if (!joined.replace(/\|/g, '')) return false
  return Object.keys(HEADER_TO_FIELD).some((k) => joined.includes(k))
}

function buildColumnMap(headerRow) {
  const map = {}
  headerRow.forEach((raw, idx) => {
    const key = normalizeHeaderKey(raw)
    if (!key) return
    const field = HEADER_TO_FIELD[key]
    if (field) map[idx] = field
  })
  return map
}

/**
 * Đọc file .xlsx / .xls — sheet đầu tiên.
 * Dòng 1: tiêu đề (mã_hs, họ_tên, …) hoặc dữ liệu thuần 5 cột theo thứ tự.
 * @returns {{ rows: object[], rowCount: number, warnings: string[] }}
 */
function parseStudentImportWorkbook(wb) {
  const name = wb.SheetNames[0]
  if (!name) {
    return { rows: [], rowCount: 0, warnings: ['File không có sheet nào.'] }
  }
  const ws = wb.Sheets[name]
  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: true })
  if (!matrix.length) {
    return { rows: [], rowCount: 0, warnings: ['Sheet trống.'] }
  }

  let start = 0
  let colMap = null
  const first = matrix[0].map((c) => c)

  if (rowLooksLikeHeader(first)) {
    colMap = buildColumnMap(first)
    if (Object.keys(colMap).length < 2) {
      colMap = null
      start = 0
    } else {
      start = 1
    }
  }

  const rows = []
  const warnings = []

  for (let r = start; r < matrix.length; r += 1) {
    const line = matrix[r] || []
    let student_code = ''
    let full_name = ''
    let gender = ''
    let date_of_birth = ''
    let guardian_phone = ''

    if (colMap) {
      for (let c = 0; c < line.length; c += 1) {
        const field = colMap[c]
        if (!field) continue
        const v = line[c]
        if (field === 'date_of_birth') {
          date_of_birth = cellToDateString(v, {
            warn: (msg) => warnings.push(`Dòng ${r + 1}: ${msg}`),
          })
        }
        else if (field === 'guardian_phone') guardian_phone = cellToPhone(v)
        else if (field === 'student_code') student_code = String(v ?? '').trim()
        else if (field === 'full_name') full_name = String(v ?? '').trim()
        else if (field === 'gender') gender = String(v ?? '').trim()
      }
    } else {
      student_code = String(line[0] ?? '').trim()
      full_name = String(line[1] ?? '').trim()
      gender = String(line[2] ?? '').trim()
      date_of_birth = cellToDateString(line[3], {
        warn: (msg) => warnings.push(`Dòng ${r + 1}: ${msg}`),
      })
      guardian_phone = cellToPhone(line[4])
    }

    if (!student_code && !full_name) continue
    if (!student_code || !full_name) {
      warnings.push(`Dòng ${r + 1}: bỏ qua (thiếu mã hoặc họ tên).`)
      continue
    }
    rows.push({
      student_code,
      full_name,
      gender,
      date_of_birth,
      guardian_phone,
    })
  }

  if (rows.length === 0 && warnings.length === 0) {
    warnings.push('Không có dòng dữ liệu hợp lệ.')
  }

  return { rows, rowCount: rows.length, warnings }
}

export async function parseStudentImportFile(file) {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  return parseStudentImportWorkbook(wb)
}
