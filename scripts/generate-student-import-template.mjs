/**
 * Tạo public/mau-nhap-hoc-sinh.xlsx — ngày sinh mẫu: dd/mm/yyyy (chuẩn VN) và một dòng yyyy-mm-dd.
 * Chạy: npm run gen:student-template
 */
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import * as XLSX from 'xlsx'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const pub = join(root, 'public')
mkdirSync(pub, { recursive: true })

const rows = [
  ['mã_hs', 'họ_tên', 'giới_tính', 'ngày_sinh', 'sdt_phụ_huynh'],
  ['HS001', 'Nguyễn Văn A', 'Nam', '15/03/2010', '0909123456'],
  ['HS002', 'Trần Thị B', 'Nữ', '01/09/2008', '0912345678'],
  ['HS003', 'Lê Văn C', 'Nam', '2007-12-20', ''],
]

const ws = XLSX.utils.aoa_to_sheet(rows)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'hoc_sinh')

const out = join(pub, 'mau-nhap-hoc-sinh.xlsx')
XLSX.writeFile(wb, out)
console.log('Wrote', out)
