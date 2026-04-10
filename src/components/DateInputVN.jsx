import { useRef } from 'react'

/**
 * Date input hiển thị dd/MM/yyyy bất kể locale trình duyệt.
 *
 * Cấu trúc: lớp hiển thị ở dưới, `<input type="date">` thật nằm trên cùng
 * với opacity rất nhỏ để cả desktop/mobile đều nhận click/tap mở native picker.
 *
 * - `value`    : chuỗi YYYY-MM-DD
 * - `onChange` : callback nhận YYYY-MM-DD
 * - `className`: áp cho container ngoài
 */
export default function DateInputVN({ value, onChange, className = '', ...rest }) {
  const inputRef = useRef(null)

  function ymdToDisplay(ymd) {
    if (!ymd) return ''
    const [y, m, d] = ymd.split('-')
    if (!y || !m || !d) return ymd
    return `${d}/${m}/${y}`
  }

  function openPickerDesktop() {
    const el = inputRef.current
    if (!el) return
    try {
      if (typeof el.showPicker === 'function') {
        el.showPicker()
        return
      }
    } catch {
      // Fallback below.
    }
    el.focus()
    el.click()
  }

  return (
    <span
      className={`relative block w-full min-h-[2.75rem] min-w-[11rem] shrink-0 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-0 ${className}`}
      onPointerDown={(e) => {
        // Desktop fallback: chủ động mở popup lịch khi click chuột.
        if (e.pointerType !== 'mouse' || e.button !== 0) return
        openPickerDesktop()
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 z-[1] flex min-h-[2.75rem] min-w-0 items-center overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2.5 text-left text-sm font-semibold tabular-nums text-on-surface shadow-sm"
        aria-hidden
      >
        <span className="min-w-0 truncate whitespace-nowrap">
          {ymdToDisplay(value) || <span className="text-on-surface-variant/50">dd/mm/yyyy</span>}
        </span>
      </span>
      <input
        ref={inputRef}
        type="date"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        style={{ opacity: 0.01 }}
        className="absolute inset-0 z-[2] box-border h-full min-h-[2.75rem] w-full min-w-[11rem] cursor-pointer bg-transparent text-base leading-normal"
        {...rest}
      />
    </span>
  )
}
