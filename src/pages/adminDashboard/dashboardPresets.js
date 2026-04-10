export function toYmd(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function rangeForPreset(preset) {
  const today = new Date()
  if (preset === 'all') return { from: '', to: '' }
  if (preset === 'today') return { from: toYmd(today), to: toYmd(today) }
  if (preset === '7d') {
    const a = new Date(today)
    a.setDate(a.getDate() - 6)
    return { from: toYmd(a), to: toYmd(today) }
  }
  if (preset === '30d') {
    const a = new Date(today)
    a.setDate(a.getDate() - 29)
    return { from: toYmd(a), to: toYmd(today) }
  }
  if (preset === 'month') {
    const a = new Date(today.getFullYear(), today.getMonth(), 1)
    return { from: toYmd(a), to: toYmd(today) }
  }
  return { from: '', to: '' }
}

export const DASHBOARD_PRESET_BTNS = [
  { id: 'today', label: 'Hôm nay' },
  { id: '7d', label: '7 ngày' },
  { id: '30d', label: '30 ngày' },
  { id: 'month', label: 'Tháng này' },
  { id: 'all', label: 'Toàn bộ' },
]
