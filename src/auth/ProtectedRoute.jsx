import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.js'

export default function ProtectedRoute() {
  const { session, loading, isConfigured } = useAuth()
  const location = useLocation()

  if (!isConfigured) {
    return <Navigate to="/" replace state={{ from: location.pathname, reason: 'no_firebase' }} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl text-primary animate-pulse">progress_activity</span>
          <p className="text-sm font-semibold text-on-surface-variant">Đang kiểm tra phiên đăng nhập…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
