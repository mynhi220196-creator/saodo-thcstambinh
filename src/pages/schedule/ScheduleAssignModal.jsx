import { useEffect, useId, useState } from 'react'
import AvatarDisplay from '../../components/AvatarDisplay.jsx'
import { Link } from 'react-router-dom'
import { deleteDutyAssignment, upsertDutyAssignment } from '../../lib/dutyAssignmentsFirestore.js'
import { SHIFT_LABELS } from './scheduleMockData.js'

export default function ScheduleAssignModal({
  open,
  onClose,
  mode,
  zone,
  column,
  shift,
  assignment,
  members,
}) {
  const titleId = useId()
  const [memberId, setMemberId] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setMemberId(assignment?.memberUid ?? members[0]?.id ?? '')
  }, [open, assignment, members])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !zone || !column) return null

  const selected = members.find((m) => m.id === memberId)

  async function handleSubmit(e) {
    e.preventDefault()
    const m = members.find((x) => x.id === memberId)
    if (!m) {
      setError('Chọn đội viên Sao Đỏ.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await upsertDutyAssignment({
        zoneId: zone.id,
        dateKey: column.dateKey,
        shift,
        memberUid: m.id,
        memberName: m.name,
        avatarUrl: m.avatar,
      })
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!assignment?.id) return
    if (!window.confirm('Xóa phân công ô này?')) return
    setDeleting(true)
    setError('')
    try {
      await deleteDutyAssignment(assignment.id)
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không xóa được.')
    } finally {
      setDeleting(false)
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
          {mode === 'edit' ? 'Sửa phân công' : 'Phân công trực'}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          <span className="font-semibold text-on-surface">{zone.name}</span> · {column.weekdayLabel}{' '}
          <span className="font-mono text-xs">{column.dateKey}</span> · ca{' '}
          <span className="font-semibold">{SHIFT_LABELS[shift] ?? shift}</span>
        </p>
        <p className="text-xs text-on-surface-variant mt-2">
          Lưu vào Firestore <span className="font-mono">duty_assignments</span> (một ô = một tài liệu).
        </p>

        {members.length === 0 ? (
          <div className="mt-4 rounded-xl border border-outline-variant/20 bg-surface-container-low/50 p-4 text-sm text-on-surface-variant">
            Chưa có tài khoản nào vai trò Sao Đỏ.{' '}
            <Link to="/admin/users" className="font-bold text-primary hover:underline">
              Tạo tại Quản lý người dùng
            </Link>
            .
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            {error ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{error}</p> : null}
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Đội viên Sao Đỏ *</label>
              <select className={inputClass} value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.className && m.className !== '—' ? ` · ${m.className}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selected ? (
              <div className="flex items-center gap-3 rounded-xl border border-outline-variant/15 p-3 bg-surface-container-low/40">
                <AvatarDisplay
                  src={selected.avatar}
                  alt=""
                  className="w-10 h-10 ring-2 ring-red-100"
                  iconClassName="text-xl"
                />
                <div className="min-w-0 text-xs text-on-surface-variant">
                  <p className="font-bold text-on-surface text-sm">{selected.name}</p>
                  <p className="truncate">{selected.email}</p>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold border border-outline-variant/30">
                Huỷ
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="flex-1 py-2.5 rounded-xl font-bold text-on-primary bg-gradient-to-r from-red-600 to-primary disabled:opacity-60"
              >
                {saving ? 'Đang lưu…' : 'Lưu'}
              </button>
            </div>
            {mode === 'edit' && assignment?.id ? (
              <button
                type="button"
                disabled={saving || deleting}
                onClick={handleDelete}
                className="w-full py-2.5 rounded-xl font-bold text-error border border-error/30 hover:bg-error-container/30 disabled:opacity-60"
              >
                {deleting ? 'Đang xóa…' : 'Xóa phân công'}
              </button>
            ) : null}
          </form>
        )}

        {members.length === 0 ? (
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold border border-outline-variant/30">
              Đóng
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
