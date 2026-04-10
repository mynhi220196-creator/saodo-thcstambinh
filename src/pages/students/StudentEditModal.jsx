import { useEffect, useId, useState } from 'react'
import DateInputVN from '../../components/DateInputVN.jsx'

const GENDERS = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
]

export default function StudentEditModal({ open, student, onClose, onSubmit, classOptions }) {
  const titleId = useId()
  const [full_name, setFullName] = useState('')
  const [gender, setGender] = useState('MALE')
  const [date_of_birth, setDateOfBirth] = useState('')
  const [class_id, setClassId] = useState('')
  const [guardian_phone, setGuardianPhone] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !student) return
    setFullName(student.full_name ?? '')
    setGender(student.gender ?? 'MALE')
    setDateOfBirth(student.date_of_birth ?? '')
    setClassId(student.class_id ?? '')
    setGuardianPhone(student.guardian_phone ?? '')
    setError('')
  }, [open, student])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !student) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!full_name.trim()) {
      setError('Nhập họ tên.')
      return
    }
    if (!class_id) {
      setError('Chọn lớp.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit(student.id, {
        full_name,
        gender,
        date_of_birth,
        class_id,
        guardian_phone,
      })
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3.5 py-2.5 text-sm'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 id={titleId} className="font-headline text-xl font-extrabold text-primary">
          Sửa học sinh
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 font-mono">Mã: {student.student_code}</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {error ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{error}</p> : null}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Họ và tên *</label>
            <input className={inputClass} value={full_name} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Giới tính</label>
            <select className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)}>
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Ngày sinh</label>
            <DateInputVN value={date_of_birth} onChange={setDateOfBirth} />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Lớp *</label>
            <select className={inputClass} value={class_id} onChange={(e) => setClassId(e.target.value)}>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Liên hệ PH</label>
            <input className={inputClass} value={guardian_phone} onChange={(e) => setGuardianPhone(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold border border-outline-variant/30">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
            >
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
