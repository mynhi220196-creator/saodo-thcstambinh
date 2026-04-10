/**
 * Ca trực + preset nhóm khu (area_key). Khu cụ thể lưu Firestore `duty_zones`.
 * Phân công: `duty_assignments`.
 */

export const SHIFT_KEYS = ['morning', 'afternoon', 'break']

export const SHIFT_LABELS = {
  morning: 'Sáng',
  afternoon: 'Chiều',
  break: 'Ra chơi',
}

/** Gợi ý khi tạo/sửa khu — giá trị lưu field `area_key` để lọc trên toolbar. */
export const AREA_KEY_PRESETS = [
  { value: 'gate', label: 'Cổng & an ninh' },
  { value: 'block_a', label: 'Dãy lớp / tầng' },
  { value: 'yard', label: 'Sân & ngoài trời' },
  { value: 'office', label: 'Hiệu bộ / hành lang' },
  { value: 'other', label: 'Khác' },
]

export function areaKeyLabel(key) {
  const p = AREA_KEY_PRESETS.find((x) => x.value === key)
  return p?.label ?? key
}

/** Seed chỉ tạo doc chưa có — ID = mã khu, khớp phân công cũ nếu dùng cùng mã. */
export const DEFAULT_DUTY_ZONE_SEEDS = [
  {
    zone_key: 'gate',
    name: 'Cổng trường',
    subtitle: 'Giám sát ra vào',
    area_key: 'gate',
    sort_order: 0,
  },
  {
    zone_key: 'block_a_f1',
    name: 'Khu A — Tầng 1',
    subtitle: 'Lớp 10A1 → 10A5',
    area_key: 'block_a',
    sort_order: 1,
  },
  {
    zone_key: 'yard',
    name: 'Sân thể thao',
    subtitle: 'Giờ ra chơi & hoạt động ngoài trời',
    area_key: 'yard',
    sort_order: 2,
  },
]

export function isAssignmentFilled(a) {
  return Boolean(a?.memberName && a.memberName !== '—')
}

export function countAssignmentStats(zones, columns, assignments) {
  const totalSlots = zones.length * columns.length
  let filled = 0
  for (const z of zones) {
    for (const col of columns) {
      const hit = assignments.some((a) => a.zoneId === z.id && a.dateKey === col.dateKey && isAssignmentFilled(a))
      if (hit) filled += 1
    }
  }
  return { filled, totalSlots, empty: totalSlots - filled }
}
