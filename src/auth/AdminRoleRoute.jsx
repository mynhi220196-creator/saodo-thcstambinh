import { Navigate, Outlet } from 'react-router-dom'
import { isTeacherRole } from '../lib/organizationFirestore.js'
import { useAuth } from './useAuth.js'

/** Đảm bảo đã đăng nhập và (tuỳ cấu hình) chỉ ADMIN — kiểm tra role đã làm ở bước đăng nhập; route này chặn hồ sơ không hợp lệ. */
export default function AdminRoleRoute() {
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

  if (import.meta.env.VITE_REQUIRE_ADMIN_ROLE !== 'false' && profile.role !== 'ADMIN') {
    if (isTeacherRole(profile.role)) {
      return <Navigate to="/giao-vien" replace />
    }
    if (profile.role === 'RED_STAR') {
      return <Navigate to="/sao-do/tac-phong" replace />
    }
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
