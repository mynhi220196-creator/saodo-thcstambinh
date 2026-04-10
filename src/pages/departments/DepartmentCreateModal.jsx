import { useEffect, useId, useRef, useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'transition', label: 'Điều chỉnh / Sáp nhập' },
]

export default function DepartmentCreateModal({ open, onClose, onSubmit, defaultSchoolYear }) {
  const titleId = useId()
  const firstFieldRef = useRef(null)

  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [headName, setHeadName] = useState('')
  const [focus, setFocus] = useState('')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    setCode('')
    setName('')
    setHeadName('')
    setFocus('')
    setStatus('active')
    setError('')
    const t = requestAnimationFrame(() => firstFieldRef.current?.focus())
    return () => cancelAnimationFrame(t)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    const n = name.trim()
    if (!c) {
      setError('Vui lòng nhập mã tổ.')
      return
    }
    if (!n) {
      setError('Vui lòng nhập tên tổ.')
      return
    }
    setError('')
    onSubmit({
      code: c,
      name: n,
      headName: headName.trim(),
      schoolYear: defaultSchoolYear,
      focus: focus.trim(),
      status,
    })
  }

  const inputClass =
    'w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface shadow-sm focus:ring-2 focus:ring-primary/25 focus:border-primary/40'

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg max-h-[min(90vh,640px)] overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/15"
      >
        <div className="sticky top-0 z-[1] flex items-start justify-between gap-4 px-6 py-5 border-b border-outline-variant/10 bg-surface-container-lowest">
          <div className="min-w-0">
            <h2 id={titleId} className="font-headline text-xl font-extrabold text-primary">
              Thêm tổ chuyên môn mới
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Nhập thông tin cơ bản; có thể bổ sung thành viên sau.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Đóng hộp thoại"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error ? (
            <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2" role="alert">
              {error}
            </p>
          ) : null}

          <div>
            <label htmlFor="dept-code" className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
              Mã tổ <span className="text-error">*</span>
            </label>
            <input
              ref={firstFieldRef}
              id="dept-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: TC-ÂM"
              className={`${inputClass} font-mono uppercase`}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="dept-name" className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
              Tên tổ đầy đủ <span className="text-error">*</span>
            </label>
            <input
              id="dept-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Tổ Âm nhạc - Mĩ thuật"
              className={inputClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="dept-head" className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
              Trưởng tổ
            </label>
            <input
              id="dept-head"
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              placeholder="Họ tên (có thể để trống)"
              className={inputClass}
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="dept-status" className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
              Trạng thái
            </label>
            <select
              id="dept-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dept-focus" className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5">
              Phạm vi / Khối áp dụng
            </label>
            <input
              id="dept-focus"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              placeholder="VD: Khối 10–12, Toàn trường…"
              className={inputClass}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-surface bg-surface-container-high hover:bg-surface-container-highest transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-primary bg-gradient-to-r from-primary to-primary-container hover:opacity-90 transition-opacity shadow-sm"
            >
              Tạo tổ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
