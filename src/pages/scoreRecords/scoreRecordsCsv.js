import { formatDateTimeVN } from '../../lib/dateFormat.js'
import { sourceLabel } from './scoreRecordMockData.js'

function escCell(x) {
  return `"${String(x ?? '').replace(/"/g, '""')}"`
}

/** @param {Array<Record<string, unknown>>} records Hàng đã lọc (shape admin map). */
export function downloadScoreRecordsCsv(records) {
  const headers = [
    'loai_ban_ghi',
    'thoi_diem_iso',
    'ma_lop',
    'ma_hs',
    'ho_ten_hs',
    'ma_tieu_chi',
    'ten_tieu_chi',
    'nhom',
    'diem',
    'loai_cong_tru',
    'nguoi_ghi',
    'nguon',
    'trang_thai',
    'nam_hoc',
    'ghi_chu',
    'co_nghiem_luc',
    'row_key',
  ]
  const lines = [headers.join(',')]
  for (const r of records) {
    const rowKey = String(r.rowKey ?? '')
    const kind = rowKey.startsWith('class:') ? 'diem_lop' : 'ca_nhan'
    const coNghiem = r.status === 'flagged' ? 'co' : ''
    lines.push(
      [
        escCell(kind),
        escCell(formatDateTimeVN(r.at)),
        escCell(r.classCode),
        escCell(r.studentCode),
        escCell(r.studentName),
        escCell(r.ruleCode),
        escCell(r.ruleName),
        escCell(r.category),
        escCell(r.points),
        escCell(r.type),
        escCell(r.recordedBy),
        escCell(sourceLabel(r.source)),
        escCell(r.status),
        escCell(r.schoolYear),
        escCell(r.note),
        escCell(coNghiem),
        escCell(rowKey),
      ].join(','),
    )
  }
  const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `saodo-ban-ghi-diem-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}
