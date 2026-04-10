import { useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'

export default function ForgotPasswordModal({ open, onClose }) {
  const { resetPasswordForEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email.trim()) {
      setError('Nhập email đã đăng ký.')
      return
    }
    setLoading(true)
    const { error: err } = await resetPasswordForEmail(email)
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSent(true)
  }

  function handleClose() {
    setEmail('')
    setError('')
    setSent(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={handleClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-title"
        className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6"
      >
        <h2 id="forgot-title" className="font-headline text-xl font-extrabold text-primary">
          Quên mật khẩu
        </h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Nhập email tài khoản — Firebase Auth sẽ gửi hướng dẫn đặt lại mật khẩu (kiểm tra cả thư mục spam).
        </p>

        {sent ? (
          <p className="mt-4 text-sm font-semibold text-green-700 dark:text-green-400">
            Đã gửi email (nếu địa chỉ tồn tại trong hệ thống).
          </p>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{error}</p>
            ) : null}
            <input
              type="email"
              autoComplete="email"
              placeholder="name@school.edu.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl font-bold text-sm bg-surface-container-high text-on-surface"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl font-bold text-sm text-on-primary bg-primary disabled:opacity-60"
              >
                {loading ? 'Đang gửi…' : 'Gửi email'}
              </button>
            </div>
          </form>
        )}

        {sent ? (
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 w-full py-2 rounded-xl font-bold text-sm bg-surface-container-high text-on-surface"
          >
            Đóng
          </button>
        ) : null}
      </div>
    </div>
  )
}
