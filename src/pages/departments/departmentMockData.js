import { buildSchoolYearOptions, currentSchoolYearValue } from '../../lib/academicYearOptions.js'

export const SCHOOL_YEAR_OPTIONS = buildSchoolYearOptions(10)
export const CURRENT_SCHOOL_YEAR = currentSchoolYearValue()

export const DEPARTMENT_STATUS_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'transition', label: 'Điều chỉnh / Sáp nhập' },
  { value: 'inactive', label: 'Ngừng hoạt động' },
]

export const DEPARTMENTS = [
  {
    code: 'TC-TIN',
    name: 'Tổ Toán - Tin học',
    headName: 'Nguyễn Văn An',
    memberCount: 18,
    schoolYear: '2024-2025',
    focus: 'Khối 10–12',
    status: 'active',
  },
  {
    code: 'TC-VAN',
    name: 'Tổ Ngữ văn',
    headName: 'Lê Thị Mai',
    memberCount: 14,
    schoolYear: '2024-2025',
    focus: 'Toàn trường',
    status: 'active',
  },
  {
    code: 'TC-LHS',
    name: 'Tổ Lý - Hóa - Sinh',
    headName: 'Trần Minh Quân',
    memberCount: 22,
    schoolYear: '2024-2025',
    focus: 'Khối 10–12',
    status: 'active',
  },
  {
    code: 'TC-SDG',
    name: 'Tổ Sử - Địa - GDCD',
    headName: 'Hoàng Công Thành',
    memberCount: 12,
    schoolYear: '2024-2025',
    focus: 'Khối 10–12',
    status: 'active',
  },
  {
    code: 'TC-NN',
    name: 'Tổ Ngoại ngữ',
    headName: 'Phạm Ngọc Lan',
    memberCount: 16,
    schoolYear: '2024-2025',
    focus: 'Tiếng Anh, Tiếng Pháp',
    status: 'active',
  },
  {
    code: 'TC-TD',
    name: 'Tổ Thể dục - Mĩ thuật - Âm nhạc',
    headName: 'Đỗ Tuấn Kiệt',
    memberCount: 9,
    schoolYear: '2024-2025',
    focus: 'Toàn trường',
    status: 'transition',
  },
  {
    code: 'TC-TIN-OLD',
    name: 'Tổ Toán (niên khóa cũ)',
    headName: '—',
    memberCount: 0,
    schoolYear: '2023-2024',
    focus: 'Đã sáp nhập',
    status: 'inactive',
  },
]

export const DEPARTMENT_LIST_TOTAL = 12

export function filterDepartments(list, schoolYear, statusFilter) {
  return list.filter((d) => {
    if (d.schoolYear !== schoolYear) return false
    if (statusFilter === 'all') return true
    return d.status === statusFilter
  })
}
