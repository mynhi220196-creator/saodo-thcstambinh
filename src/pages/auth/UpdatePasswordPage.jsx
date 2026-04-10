import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../../lib/firebaseClient.js'

export default function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const oobCode = searchParams.get('oobCode')
  const mode = searchParams.get('mode')

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) {
      setError('Chưa cấu hình Firebase.')
      return undefined
    }
    if (!oobCode || mode !== 'resetPassword') {
      setError(
        'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại email từ trang đăng nhập.',
      )
      return undefined
    }
    let cancelled = false
    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        if (!cancelled) setReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [oobCode, mode])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!oobCode) {
      setError('Thiếu mã xác thực từ email.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu mới cần ít nhất 6 ký tự.')
      return
    }
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    setSubmitting(true)
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setDone(true)
      setTimeout(() => navigate('/', { replace: true }), 2000)
    } catch (err) {
      setError(err.message ?? 'Không đặt lại được mật khẩu.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isFirebaseConfigured() || !auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface p-4">
        <p className="text-error font-semibold">Thiếu cấu hình Firebase (.env).</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-xl p-8">
        <h1 className="font-headline text-2xl font-extrabold text-primary">Đặt lại mật khẩu</h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Nhập mật khẩu mới cho tài khoản của bạn (liên kết từ email Firebase).
        </p>

        {error && !ready ? (
          <p className="mt-6 text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{error}</p>
        ) : null}

        {!error && !ready ? (
          <p className="mt-6 text-sm text-on-surface-variant">Đang xác thực liên kết…</p>
        ) : null}

        {ready && done ? (
          <p className="mt-6 text-sm font-semibold text-green-700 dark:text-green-400">
            Đã cập nhật mật khẩu. Đang chuyển về trang đăng nhập…
          </p>
        ) : null}

        {ready && !done ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{error}</p>
            ) : null}
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="np">
                Mật khẩu mới
              </label>
              <input
                id="np"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="npc">
                Xác nhận mật khẩu
              </label>
              <input
                id="npc"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
            >
              {submitting ? 'Đang lưu…' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        ) : null}

        <Link to="/" className="inline-block mt-6 text-sm font-bold text-primary hover:underline">
          ← Về đăng nhập
        </Link>
      </div>
    </div>
  )
}
