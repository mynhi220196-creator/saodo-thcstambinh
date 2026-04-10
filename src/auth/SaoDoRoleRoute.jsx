import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { canUseSaoDoRoutes, isAdminProfile, isTeacherPortalProfile } from './roleUtils.js'

export default function SaoDoRoleRoute() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-red-700 animate-pulse">progress_activity</span>
          <p className="text-sm font-semibold text-on-surface-variant">Đang tải hồ sơ…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  if (!profile || profile.is_deleted || !profile.is_active) {
    return <Navigate to="/" replace />
  }

  if (isAdminProfile(profile)) {
    return <Navigate to="/admin" replace />
  }

  if (isTeacherPortalProfile(profile)) {
    return <Navigate to="/giao-vien" replace />
  }

  if (!canUseSaoDoRoutes(profile)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
