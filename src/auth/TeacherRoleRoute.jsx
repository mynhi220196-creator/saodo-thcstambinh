import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.js'
import { canUseTeacherRoutes, isAdminProfile, isRedStarProfile } from './roleUtils.js'

export default function TeacherRoleRoute() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">progress_activity</span>
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

  if (isRedStarProfile(profile)) {
    return <Navigate to="/sao-do/tac-phong" replace />
  }

  if (!canUseTeacherRoutes(profile)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
