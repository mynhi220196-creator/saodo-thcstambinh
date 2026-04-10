import { useEffect, useRef, useState } from 'react'
import {
  getCloudinaryConfigError,
  isCloudinaryConfigured,
  uploadConductImageToCloudinary,
} from '../../lib/cloudinaryUpload.js'
import { updateUserProfile } from '../../lib/userProfilesFirestore.js'
import { EDITABLE_ROLES, ROLE_LABEL } from './userMockData.js'

export default function UserEditModal({ open, user, currentUserId, onClose, onSaved }) {
  const fileRef = useRef(null)
  const [full_name, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar_url, setAvatarUrl] = useState('')
  const [unit, setUnit] = useState('')
  const [role, setRole] = useState('RED_STAR')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)

  useEffect(() => {
    if (!user?._raw) return
    const r = user._raw
    setFullName(r.full_name ?? '')
    setPhone(r.phone ?? '')
    setAvatarUrl(r.avatar_url ?? '')
    setUnit(r.unit ?? '')
    const rr = r.role ?? 'RED_STAR'
    setRole(rr === 'TEACHER_SUBJECT' || rr === 'TEACHER_HOMEROOM' ? 'TEACHER' : rr)
    setError('')
    setUploadBusy(false)
    if (fileRef.current) fileRef.current.value = ''
  }, [user, open])

  if (!open || !user) return null

  const isSelf = user.id === currentUserId
  const cloudinaryOk = isCloudinaryConfigured()

  async function handleAvatarFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!cloudinaryOk) {
      setError(getCloudinaryConfigError())
      e.target.value = ''
      return
    }
    setUploadBusy(true)
    setError('')
    try {
      const url = await uploadConductImageToCloudinary(f)
      setAvatarUrl(url)
    } catch (err) {
      setError(err?.message ?? 'Tải ảnh lên thất bại.')
    } finally {
      setUploadBusy(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await updateUserProfile(user.id, {
        full_name,
        phone,
        avatar_url,
        unit,
        role: isSelf ? undefined : role,
      })
      await onSaved?.()
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
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
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6"
      >
        <h2 className="font-headline text-xl font-extrabold text-primary">Chỉnh sửa người dùng</h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Email: <span className="font-mono font-semibold text-on-surface">{user.email}</span> (không đổi từ đây)
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error ? (
            <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{error}</p>
          ) : null}

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="ed-name">
              Họ và tên
            </label>
            <input
              id="ed-name"
              type="text"
              required
              value={full_name}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="ed-phone">
              Số điện thoại
            </label>
            <input
              id="ed-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <span className="block text-sm font-semibold text-on-surface-variant mb-2">Ảnh đại diện</span>
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-outline-variant/25 bg-surface-container-high/50 p-4">
              <div className="shrink-0">
                {avatar_url ? (
                  <img
                    src={avatar_url}
                    alt=""
                    className="h-20 w-20 rounded-2xl object-cover ring-2 ring-outline-variant/20 bg-surface-container-high"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant text-xs font-bold text-center px-1 ring-2 ring-outline-variant/15">
                    Chưa có ảnh
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  id="ed-avatar-file"
                  onChange={handleAvatarFile}
                  disabled={!cloudinaryOk || uploadBusy || loading}
                />
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="ed-avatar-file"
                    className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      cloudinaryOk && !uploadBusy && !loading
                        ? 'bg-primary text-on-primary hover:opacity-90 cursor-pointer'
                        : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-70'
                    }`}
                  >
                    {uploadBusy ? 'Đang tải lên…' : 'Chọn ảnh tải lên'}
                  </label>
                  {avatar_url ? (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                    >
                      Gỡ ảnh
                    </button>
                  ) : null}
                </div>
                {!cloudinaryOk ? (
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-snug">
                    {getCloudinaryConfigError()} Bạn vẫn có thể dán URL ảnh bên dưới.
                  </p>
                ) : (
                  <p className="text-xs text-on-surface-variant">JPEG, PNG, WebP hoặc GIF · tối đa 8MB (Cloudinary).</p>
                )}
              </div>
            </div>
            <label className="block text-xs font-semibold text-on-surface-variant mt-3 mb-1" htmlFor="ed-avatar">
              Hoặc dán URL ảnh
            </label>
            <input
              id="ed-avatar"
              type="url"
              placeholder="https://..."
              value={avatar_url}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="ed-unit">
              Đơn vị / nhóm
            </label>
            <input
              id="ed-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1" htmlFor="ed-role">
              Vai trò
            </label>
            <select
              id="ed-role"
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value)}
              title={isSelf ? 'Không đổi vai trò của chính mình từ đây' : ''}
              className="w-full rounded-xl border border-outline-variant/25 bg-surface-container-high px-4 py-3 text-sm font-semibold disabled:opacity-60"
            >
              {EDITABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r] ?? r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-bold border border-outline-variant/30 text-on-surface"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
            >
              {loading ? 'Đang lưu…' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
