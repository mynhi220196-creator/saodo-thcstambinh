import * as XLSX from 'xlsx'

function summarySheetRows(reportRows) {
  return reportRows.map((r) => ({
    Ma_lop: r.classCode,
    Ten_lop: r.className,
    Khoi: r.grade,
    Nam_hoc: r.schoolYear,
    GVCN: r.homeroomTeacher,
    Si_so: r.studentCount,
    HS_so_lan_phat: r.indivPenaltyCount,
    HS_so_lan_thuong: r.indivRewardCount,
    HS_tong_diem_tru: r.indivPenaltyPoints,
    HS_tong_diem_cong: r.indivRewardPoints,
    Lop_so_lan_phat: r.classPenaltyCount,
    Lop_so_lan_thuong: r.classRewardCount,
    Lop_tong_diem_tru: r.classPenaltyPoints,
    Lop_tong_diem_cong: r.classRewardPoints,
    Diem_final_can_tac_phong: r.finalConductPoints,
    So_ban_ghi_tac_phong: r.totalConductRecords,
    So_co_ngiem: r.flaggedCount,
  }))
}

function metaSheetRows(meta) {
  return Object.entries(meta).map(([key, value]) => ({ Thuoc_tinh: key, Gia_tri: value }))
}

export function downloadAdminReportsExcel(p) {
  const { reportRows, detailResult, meta } = p
  const wb = XLSX.utils.book_new()

  const wsSummary = XLSX.utils.json_to_sheet(summarySheetRows(reportRows))
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Theo_lop')

  const wsMeta = XLSX.utils.json_to_sheet(metaSheetRows(meta))
  XLSX.utils.book_append_sheet(wb, wsMeta, 'Bo_loc')

  if (detailResult?.rows?.length) {
    const wsDetail = XLSX.utils.json_to_sheet(detailResult.rows)
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi_tiet_ban_ghi')
  }

  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `saodo-bao-cao-tac-phong-${stamp}.xlsx`)
}
