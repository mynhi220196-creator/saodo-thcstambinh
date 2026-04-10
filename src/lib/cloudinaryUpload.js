/** Upload ảnh unsigned lên Cloudinary (preset “Unsigned” trong Dashboard). */

const MAX_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function isCloudinaryConfigured() {
  const cloud = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '').trim()
  const preset = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '').trim()
  return Boolean(cloud && preset)
}

export function getCloudinaryConfigError() {
  if (isCloudinaryConfigured()) return ''
  return 'Chưa cấu hình Cloudinary: thêm VITE_CLOUDINARY_CLOUD_NAME và VITE_CLOUDINARY_UPLOAD_PRESET vào .env (xem .env.example).'
}

/**
 * @param {File} file
 * @returns {Promise<string>} secure_url
 */
export async function uploadConductImageToCloudinary(file) {
  const cloud = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? '').trim()
  const preset = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '').trim()
  if (!cloud || !preset) {
    throw new Error(getCloudinaryConfigError() || 'Thiếu cấu hình Cloudinary.')
  }
  if (!file || !(file instanceof Blob)) {
    throw new Error('Không có tệp ảnh.')
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error('Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Ảnh tối đa 8MB.')
  }

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', preset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
    method: 'POST',
    body: fd,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText || 'Upload thất bại.'
    throw new Error(msg)
  }
  const url = data?.secure_url
  if (!url || typeof url !== 'string') {
    throw new Error('Cloudinary không trả về URL.')
  }
  return url
}
