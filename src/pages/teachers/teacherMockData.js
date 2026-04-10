/** Bộ lọc trạng thái tài khoản (khớp `profileDocToRow` trong userProfilesFirestore). */
export const TEACHER_STATUS_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'pending', label: 'Chưa đăng nhập' },
  { value: 'locked', label: 'Đã khóa' },
]
