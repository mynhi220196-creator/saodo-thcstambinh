import { useState } from 'react'
import { CREATABLE_ROLES, createUserAccount } from '../../lib/userProfilesFirestore.js'
import { ROLE_LABEL } from './userMockData.js'

export default function UserCreateModal({ open, onClose, onCreated }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [full_name, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [unit, setUnit] = useState('')
  const [role, setRole] = useState('TEACHER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  function reset() {
    setEmail('')
    setPassword('')
    setFullName('')
    setPhone('')
    setUnit('')
    setRole('TEACHER')
    setError('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createUserAccount({ email, password, full_name, phone, unit, role })
      await onCreated?.()
      handleClose()
    } catch (err) {
      const msg = err?.message ?? ''
      if (msg.includes('email-already-in-use') || msg.includes('already')) {
        setError('Email đã được sử dụng.')
      } else {
        setError(msg || 'Không tạo được tài khoản.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6"
      >
        <h2 className="font-headline text-xl font-extrabold text-primary">Tạo tài khoản mới</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Tạo user Firebase Auth và hồ sơ Firestore. Vai trò Giáo viên dùng chung; GVCN gán qua phân công
          lớp. Không tạo Quản trị từ đây.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{error}</p>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cu-email">
              Email đăng nhập
            </label>
            <input
              id="cu-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cu-pw">
              Mật khẩu tạm (≥ 6 ký tự)
            </label>
            <input
              id="cu-pw"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cu-name">
              Họ và tên
            </label>
            <input
              id="cu-name"
              type="text"
              required
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cu-phone">
              Số điện thoại
            </label>
            <input
              id="cu-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cu-unit">
              Đơn vị / nhóm
            </label>
            <input
              id="cu-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cu-role">
              Vai trò
            </label>
            <select
              id="cu-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm font-semibold"
            >
              {CREATABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r] ?? r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl font-bold border border-outline-variant/30 text-on-surface"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
            >
              {loading ? 'Đang tạo…' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
