import { useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'

export default function AccountPasswordSection() {
  const { user, profile, changePasswordWithReauth } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (newPassword.length < 6) {
      setError('Mật khẩu mới cần ít nhất 6 ký tự.')
      return
    }
    if (newPassword !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setLoading(true)
    const { error: err } = await changePasswordWithReauth(oldPassword, newPassword)
    setLoading(false)
    if (err) {
      setError(err.message ?? 'Không đổi được mật khẩu.')
      return
    }
    setSuccess('Đã cập nhật mật khẩu thành công.')
    setOldPassword('')
    setNewPassword('')
    setConfirm('')
  }

  return (
    <div className="max-w-lg">
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm mb-6">
        <p className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant">Email đăng nhập</p>
        <p className="text-sm font-semibold text-on-surface mt-1">{user?.email ?? '—'}</p>
        {profile?.full_name ? (
          <>
            <p className="text-xs font-extrabold uppercase tracking-wide text-on-surface-variant mt-4">Họ tên</p>
            <p className="text-sm font-semibold text-on-surface mt-1">{profile.full_name}</p>
          </>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 shadow-sm space-y-4"
      >
        {error ? (
          <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{error}</p>
        ) : null}
        {success ? (
          <p className="text-sm font-semibold text-green-800 dark:text-green-300 bg-green-50 dark:bg-green-950/30 rounded-xl px-3 py-2">
            {success}
          </p>
        ) : null}
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="old-pw">
            Mật khẩu hiện tại
          </label>
          <input
            id="old-pw"
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="new-pw">
            Mật khẩu mới
          </label>
          <input
            id="new-pw"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="cf-pw">
            Xác nhận mật khẩu mới
          </label>
          <input
            id="cf-pw"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
        >
          {loading ? 'Đang cập nhật…' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  )
}
