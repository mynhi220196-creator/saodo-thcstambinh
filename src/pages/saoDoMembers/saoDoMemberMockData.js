export const GRADE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả khối' },
  { value: '10', label: 'Khối 10' },
  { value: '11', label: 'Khối 11' },
  { value: '12', label: 'Khối 12' },
]

export const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'Mọi vai trò' },
  { value: 'lead', label: 'Trưởng ban' },
  { value: 'deputy', label: 'Phó ban' },
  { value: 'member', label: 'Đội viên' },
]

export const MEMBER_STATUS_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'suspended', label: 'Tạm dừng / Đã khóa' },
]

export function filterSaoDoMembers(list, gradeFilter, roleFilter, statusFilter, query = '') {
  const q = query.trim().toLowerCase()
  return list.filter((m) => {
    if (gradeFilter !== 'all' && String(m.grade ?? '') !== gradeFilter) return false
    if (roleFilter !== 'all' && m.role !== roleFilter) return false
    if (statusFilter !== 'all' && m.status !== statusFilter) return false
    if (!q) return true
    const blob = [m.id, m.code, m.name, m.email, m.className, m.phone].filter(Boolean).join(' ').toLowerCase()
    return blob.includes(q)
  })
}

export const ROLE_LABELS = {
  lead: 'Trưởng ban',
  deputy: 'Phó ban',
  member: 'Đội viên',
}

export const SHIFT_LABELS = {
  morning: 'Ưu tiên sáng',
  afternoon: 'Ưu tiên chiều',
  break: 'Ra chơi',
  flex: 'Linh hoạt',
}
