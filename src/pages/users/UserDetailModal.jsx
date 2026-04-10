import { useState } from 'react'
import { useAuth } from '../../auth/useAuth.js'
import { setUserActive, softDeleteUser } from '../../lib/userProfilesFirestore.js'
import { formatLastLogin, ROLE_LABEL } from './userMockData.js'

export default function UserDetailModal({ open, user, currentUserId, onClose, onRequestEdit, onChanged }) {
  const { resetPasswordForEmail } = useAuth()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  if (!open || !user) return null

  const isSelf = user.id === currentUserId
  const raw = user._raw ?? {}
  const isActive = raw.is_active !== false

  async function handleResetPassword() {
    if (!user.email || user.email === '—') return
    setErr('')
    setMsg('')
    setBusy(true)
    const { error } = await resetPasswordForEmail(user.email)
    setBusy(false)
    if (error) {
      setErr(error.message ?? 'Không gửi được email.')
      return
    }
    setMsg('Đã gửi email đặt lại mật khẩu.')
  }

  async function handleToggleLock() {
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      await setUserActive(user.id, !isActive)
      await onChanged?.()
      setMsg(isActive ? 'Đã khóa tài khoản (đăng nhập sẽ bị từ chối).' : 'Đã mở khóa tài khoản.')
    } catch (e) {
      setErr(e?.message ?? 'Thao tác thất bại.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSoftDelete() {
    if (!window.confirm('Ẩn người dùng khỏi danh sách (xoá mềm)? Hồ sơ vẫn lưu trong Firestore.')) return
    setErr('')
    setMsg('')
    setBusy(true)
    try {
      await softDeleteUser(user.id)
      await onChanged?.()
      onClose()
    } catch (e) {
      setErr(e?.message ?? 'Không xoá mềm được.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6"
      >
        <h2 className="font-headline text-xl font-extrabold text-primary">Chi tiết người dùng</h2>

        <div className="mt-6 space-y-3 text-sm">
          <p>
            <span className="text-on-surface-variant font-semibold">UID:</span>{' '}
            <span className="font-mono text-xs break-all">{user.id}</span>
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Email:</span> {user.email}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Họ tên:</span> {user.fullName}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">SĐT:</span> {raw.phone ?? '—'}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Vai trò:</span>{' '}
            {ROLE_LABEL[user.role] ?? user.role}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Đơn vị:</span> {user.unit || '—'}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Đăng nhập cuối:</span>{' '}
            {formatLastLogin(user.lastLoginAt)}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Ngày tạo (hồ sơ):</span> {user.createdAt}
          </p>
          <p>
            <span className="text-on-surface-variant font-semibold">Trạng thái:</span>{' '}
            {user.status === 'locked' ? 'Đã khóa' : user.status === 'pending' ? 'Chờ kích hoạt' : 'Hoạt động'}
          </p>
        </div>

        {msg ? <p className="mt-4 text-sm font-semibold text-green-700 dark:text-green-400">{msg}</p> : null}
        {err ? <p className="mt-4 text-sm font-semibold text-error">{err}</p> : null}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRequestEdit?.()}
            className="w-full py-3 rounded-xl font-bold border border-primary/30 text-primary hover:bg-primary/5"
          >
            Chỉnh sửa thông tin
          </button>
          <button
            type="button"
            disabled={busy || !user.email || user.email === '—'}
            onClick={handleResetPassword}
            className="w-full py-3 rounded-xl font-bold bg-surface-container-high text-on-surface"
          >
            Gửi email đặt lại mật khẩu
          </button>
          <button
            type="button"
            disabled={busy || isSelf}
            onClick={handleToggleLock}
            className="w-full py-3 rounded-xl font-bold bg-surface-container-high text-on-surface disabled:opacity-50"
            title={isSelf ? 'Không thể khóa chính mình' : ''}
          >
            {isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
          </button>
          <button
            type="button"
            disabled={busy || isSelf}
            onClick={handleSoftDelete}
            className="w-full py-3 rounded-xl font-bold text-error bg-error-container/20 disabled:opacity-50"
            title={isSelf ? 'Không thể xoá mềm chính mình' : ''}
          >
            Xoá mềm (ẩn khỏi danh sách)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold border border-outline-variant/30 text-on-surface mt-2"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
