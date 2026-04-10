import { formatDateTimeVN } from '../../lib/dateFormat.js'

export const ROLE_OPTIONS = [
  { value: 'all', label: 'Mọi vai trò' },
  { value: 'admin', label: 'Quản trị' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'sao_do', label: 'Sao Đỏ' },
]

export const USER_STATUS_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'pending', label: 'Chờ kích hoạt' },
  { value: 'locked', label: 'Đã khóa' },
]

export const ROLE_LABEL = {
  ADMIN: 'Quản trị',
  TEACHER: 'Giáo viên',
  TEACHER_SUBJECT: 'Giáo viên (cũ: GVBM)',
  TEACHER_HOMEROOM: 'Giáo viên (cũ: GVCN)',
  RED_STAR: 'Sao Đỏ',
}

export const EDITABLE_ROLES = ['ADMIN', 'TEACHER', 'RED_STAR']

export function formatLastLogin(iso) {
  return formatDateTimeVN(iso)
}
