import { useEffect, useId, useRef, useState } from 'react'
import { GRADE_OPTIONS_FORM, SCHOOL_YEAR_OPTIONS } from './classMockData.js'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'archived', label: 'Vô hiệu (ẩn khỏi form ghi điểm)' },
]

export default function ClassCreateModal({
  open,
  onClose,
  onCreate,
  onUpdate,
  editingClass,
  defaultSchoolYear,
  existingClassKeys,
  teachers,
}) {
  const titleId = useId()
  const firstFieldRef = useRef(null)

  const [code, setCode] = useState('')
  const [schoolYear, setSchoolYear] = useState(defaultSchoolYear)
  const [grade, setGrade] = useState('10')
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('')
  const [room, setRoom] = useState('')
  const [status, setStatus] = useState('active')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    setError('')
    if (editingClass) {
      setCode(editingClass.code ?? '')
      setSchoolYear(editingClass.school_year ?? defaultSchoolYear)
      setGrade(String(editingClass.grade ?? '10'))
      setHomeroomTeacherId(editingClass.homeroom_teacher_id ?? '')
      setRoom(editingClass.room ?? '')
      setStatus(editingClass.is_active === false ? 'archived' : 'active')
    } else {
      setCode('')
      setSchoolYear(defaultSchoolYear)
      setGrade('10')
      setHomeroomTeacherId('')
      setRoom('')
      setStatus('active')
    }
    const t = requestAnimationFrame(() => firstFieldRef.current?.focus())
    return () => cancelAnimationFrame(t)
  }, [open, editingClass, defaultSchoolYear])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) {
      setError('Vui lòng nhập mã lớp.')
      return
    }
    const key = `${c}|${schoolYear}`
    const oldKey = editingClass ? `${editingClass.code}|${editingClass.school_year}` : null
    if (existingClassKeys?.has(key) && key !== oldKey) {
      setError('Mã lớp đã tồn tại trong năm học đã chọn.')
      return
    }

    const payload = {
      code: c,
      grade: Number.parseInt(grade, 10),
      school_year: schoolYear,
      homeroom_teacher_id: homeroomTeacherId || null,
      room: room.trim(),
      is_active: status === 'active',
    }

    setError('')
    setSaving(true)
    try {
      if (editingClass) await onUpdate?.(editingClass.id, payload)
      else if (onCreate) await onCreate(payload)
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3.5 py-2.5 text-sm text-on-surface shadow-sm focus:ring-2 focus:ring-primary/25 focus:border-primary/40'

  const isEdit = Boolean(editingClass)

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
        className="relative w-full max-w-lg max-h-[min(90vh,680px)] overflow-y-auto rounded-2xl bg-surface-container-lowest shadow-2xl border border-outline-variant/15"
      >
        <div className="sticky top-0 z-[1] flex items-start justify-between gap-4 px-6 py-5 border-b border-outline-variant/10 bg-surface-container-lowest">
          <div className="min-w-0">
            <h2 id={titleId} className="font-headline text-xl font-extrabold text-primary">
              {isEdit ? 'Sửa lớp' : 'Thêm lớp mới'}
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              GVCN chọn từ tài khoản có vai trò Giáo viên. Một GV chỉ chủ nhiệm một lớp trong cùng năm học.
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
            <label
              htmlFor="class-year"
              className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5"
            >
              Năm học <span className="text-error">*</span>
            </label>
            <select
              id="class-year"
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className={inputClass}
            >
              {SCHOOL_YEAR_OPTIONS.map((y) => (
                <option key={y.value} value={y.value}>
                  {y.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="class-code"
                className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5"
              >
                Mã lớp <span className="text-error">*</span>
              </label>
              <input
                ref={firstFieldRef}
                id="class-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="VD: 10B2"
                className={`${inputClass} font-mono uppercase`}
                autoComplete="off"
              />
            </div>
            <div>
              <label
                htmlFor="class-grade"
                className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5"
              >
                Khối <span className="text-error">*</span>
              </label>
              <select
                id="class-grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={inputClass}
              >
                {GRADE_OPTIONS_FORM.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="class-gvcn"
              className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5"
            >
              Giáo viên chủ nhiệm
            </label>
            <select
              id="class-gvcn"
              value={homeroomTeacherId}
              onChange={(e) => setHomeroomTeacherId(e.target.value)}
              className={inputClass}
            >
              <option value="">— Chưa chọn —</option>
              {(teachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name || t.email || t.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="class-room"
              className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5"
            >
              Phòng học
            </label>
            <input
              id="class-room"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="VD: A-105"
              className={`${inputClass} font-mono`}
              autoComplete="off"
            />
          </div>

          <div>
            <label
              htmlFor="class-status"
              className="block text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1.5"
            >
              Trạng thái
            </label>
            <select
              id="class-status"
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
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-on-primary bg-gradient-to-r from-primary to-primary-container hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
            >
              {saving ? 'Đang lưu…' : isEdit ? 'Lưu thay đổi' : 'Tạo lớp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
