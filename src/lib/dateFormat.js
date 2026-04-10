function pad2(n) {
  return n < 10 ? `0${n}` : String(n)
}

/** dd/MM/yyyy */
export function formatDateVN(ms) {
  if (!ms) return '—'
  const d = new Date(typeof ms === 'string' ? Date.parse(ms) : ms)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** dd/MM/yyyy HH:mm */
export function formatDateTimeVN(ms) {
  if (!ms) return '—'
  const d = new Date(typeof ms === 'string' ? Date.parse(ms) : ms)
  if (Number.isNaN(d.getTime())) return '—'
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
