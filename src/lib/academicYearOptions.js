/**
 * Năm học Việt Nam: bắt đầu tháng 9.
 * Ví dụ tháng 4/2026 → đang trong năm 2025-2026; tháng 9/2026 → 2026-2027.
 *
 * @param {Date} [now]
 * @returns {number} Năm bắt đầu nhãn "A-B" (ví dụ 2025 cho "2025-2026")
 */
export function getAcademicYearStartYear(now = new Date()) {
  const y = now.getFullYear()
  const monthIndex = now.getMonth()
  return monthIndex >= 8 ? y : y - 1
}

/**
 * Danh sách năm học đếm lùi từ năm hiện tại (mục đầu = năm học đang diễn ra).
 *
 * @param {number} [count=10]
 * @param {Date} [now]
 */
export function buildSchoolYearOptions(count = 10, now = new Date()) {
  const startYear = getAcademicYearStartYear(now)
  const options = []
  const futureYear = startYear + 1
  options.push({
    value: `${futureYear}-${futureYear + 1}`,
    label: `Năm học ${futureYear} - ${futureYear + 1}`,
  })
  for (let i = 0; i < count; i += 1) {
    const a = startYear - i
    const b = a + 1
    options.push({
      value: `${a}-${b}`,
      label: `Năm học ${a} - ${b}`,
    })
  }
  return options
}

/** Giá trị mặc định = năm học hiện tại (ví dụ "2025-2026" nếu đang tháng 4/2026). */
export function currentSchoolYearValue(now = new Date()) {
  const s = getAcademicYearStartYear(now)
  return `${s}-${s + 1}`
}
