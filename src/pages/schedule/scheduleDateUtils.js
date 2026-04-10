/** Thứ hai = đầu tuần làm việc (6 cột: Thứ 2 → Thứ 7). */

const MS_DAY = 86400000

export function startOfMonday(d) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x
}

export function addDays(d, n) {
  return new Date(d.getTime() + n * MS_DAY)
}

export function toDateKey(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const VI_LABEL = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

/** @param {Date} weekStartMonday */
export function buildSchoolWeekColumns(weekStartMonday) {
  const cols = []
  for (let i = 0; i < 6; i += 1) {
    const date = addDays(weekStartMonday, i)
    const dow = date.getDay()
    cols.push({
      date,
      dateKey: toDateKey(date),
      weekdayLabel: VI_LABEL[dow],
      shortDate: `${date.getDate()}/${date.getMonth() + 1}`,
    })
  }
  return cols
}

export function formatWeekRangeLabel(weekStartMonday) {
  const end = addDays(weekStartMonday, 5)
  const f = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  return `${f(weekStartMonday)} – ${f(end)}`
}

/** @param {number} weekOffset 0 = tuần chứa `reference`, -1 / +1 … */
export function getMondayForOffset(reference, weekOffset) {
  const base = startOfMonday(reference)
  return addDays(base, weekOffset * 7)
}
