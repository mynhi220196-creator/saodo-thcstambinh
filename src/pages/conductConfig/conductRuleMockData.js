export const CATEGORY_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'Chuyên cần', label: 'Chuyên cần' },
  { id: 'Học tập', label: 'Học tập' },
  { id: 'Đồng phục', label: 'Đồng phục' },
  { id: 'Thái độ', label: 'Thái độ' },
  { id: 'Khác', label: 'Khác' },
]

export const CATEGORY_OPTIONS_FOR_FORM = CATEGORY_TABS.filter((t) => t.id !== 'all')

export const TYPE_FILTER_OPTIONS = [
  { value: 'all', label: 'Loại: Tất cả' },
  { value: 'reward', label: 'Thưởng (+)' },
  { value: 'penalty', label: 'Phạt (-)' },
]

/** Chỉ lọc — sắp xếp theo cột trên bảng (ConductConfigPage). */
export function filterRules(list, categoryTab, typeFilter, query = '') {
  const q = query.trim().toLowerCase()
  return list.filter((r) => {
    if (categoryTab !== 'all' && r.category !== categoryTab) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    if (!q) return true
    const blob = [r.code, r.name, r.category, r.description].filter(Boolean).join(' ').toLowerCase()
    return blob.includes(q)
  })
}
