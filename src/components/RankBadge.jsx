import { rankColorClasses } from '../lib/conductRanksFirestore.js'

/**
 * Huy hiệu rank tái dùng.
 *
 * props:
 *   name   tên mức (vd "Vàng")
 *   icon   material symbol (vd "military_tech")
 *   color  token màu (gold/silver/…)
 *   size   'sm' | 'md' | 'lg'
 */
export default function RankBadge({ name, icon = 'military_tech', color = 'gold', size = 'md' }) {
  if (!name) return null
  const c = rankColorClasses(color)
  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-extrabold',
  }
  const iconSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold ${c.chip} ${sizes[size] ?? sizes.md}`}
      title={`Huy hiệu: ${name}`}
    >
      <span
        className={`material-symbols-outlined ${iconSizes[size] ?? iconSizes.md}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
        aria-hidden
      >
        {icon || 'military_tech'}
      </span>
      {name}
    </span>
  )
}
