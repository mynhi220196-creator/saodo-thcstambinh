import { isTeacherRole } from '../lib/organizationFirestore.js'

export function isAdminProfile(p) {
  return p?.role === 'ADMIN'
}

export function isTeacherPortalProfile(p) {
  return isTeacherRole(p?.role)
}

export function isRedStarProfile(p) {
  return p?.role === 'RED_STAR'
}

/** Đích sau đăng nhập / khi đã có phiên hợp lệ. */
export function defaultHomePathForProfile(profile) {
  if (!profile || profile.is_deleted || profile.is_active === false) return '/'
  if (isAdminProfile(profile)) return '/admin'
  if (isTeacherPortalProfile(profile)) return '/giao-vien'
  if (isRedStarProfile(profile)) return '/sao-do/tac-phong'
  return '/'
}

export function canUseAdminRoutes(profile) {
  return Boolean(profile?.is_active && !profile?.is_deleted && isAdminProfile(profile))
}

export function canUseTeacherRoutes(profile) {
  return Boolean(profile?.is_active && !profile?.is_deleted && isTeacherPortalProfile(profile))
}

export function canUseSaoDoRoutes(profile) {
  return Boolean(profile?.is_active && !profile?.is_deleted && isRedStarProfile(profile))
}
