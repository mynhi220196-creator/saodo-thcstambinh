import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import {
  canUseAdminRoutes,
  canUseSaoDoRoutes,
  canUseTeacherRoutes,
  defaultHomePathForProfile,
} from '../auth/roleUtils.js'
import ForgotPasswordModal from '../components/auth/ForgotPasswordModal.jsx'
import ProjectLogo from '../components/ProjectLogo.jsx'

const CAMPUS_IMG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAQCd828PaNVuQU-Kj9HVD93qEwLf2giRCM9s8Km0Pkgc5r8MnpeHcncOiokJnZj1NkgjTZViloeH09hkjRA3-JbsJfzUy93-mlGjA2mGqDqarRX9CacQ7LBFmwvwq0_JxErsqpLSU4kyxmVM_3qqGpFcqGpUBuj3KigXv3jlrZwzpTg4JpXYq88hnI6Xt--5dEEb1hvQ0K2hr0ZR43dfZtpmjT77F7rdJRe-ASRNbosrEOmvYj1OXvkc-LRTZym6_sl6P7R-LM-do'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, session, profile, loading, isConfigured, requireAdminRole } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const from = location.state?.from

  useEffect(() => {
    if (location.state?.reason === 'no_firebase') {
      setError(
        'Chưa cấu hình Firebase. Thêm các biến VITE_FIREBASE_* (apiKey, authDomain, projectId, appId) vào file .env',
      )
    }
  }, [location.state?.reason])

  useEffect(() => {
    if (loading || !isConfigured) return
    if (!session?.user || !profile?.is_active || profile.is_deleted) return

    const home = defaultHomePathForProfile(profile)
    if (home === '/') return

    const allowedFrom =
      from &&
      ((from.startsWith('/admin') && canUseAdminRoutes(profile)) ||
        (from.startsWith('/giao-vien') && canUseTeacherRoutes(profile)) ||
        (from.startsWith('/sao-do') && canUseSaoDoRoutes(profile)))

    navigate(allowedFrom ? from : home, { replace: true })
  }, [loading, isConfigured, session, profile, navigate, from])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isConfigured) {
      setError('Thiếu cấu hình Firebase (.env).')
      return
    }
    if (!email.trim() || !password) {
      setError('Nhập email và mật khẩu.')
      return
    }
    setSubmitting(true)
    const { error: err, profile: signedProfile } = await signIn(email, password)
    setSubmitting(false)
    if (err) {
      setError(err.message ?? 'Đăng nhập thất bại.')
      return
    }
    if (!signedProfile) {
      navigate('/', { replace: true })
      return
    }
    const home = defaultHomePathForProfile(signedProfile)
    const allowedFrom =
      from &&
      ((from.startsWith('/admin') && canUseAdminRoutes(signedProfile)) ||
        (from.startsWith('/giao-vien') && canUseTeacherRoutes(signedProfile)) ||
        (from.startsWith('/sao-do') && canUseSaoDoRoutes(signedProfile)))
    navigate(allowedFrom ? from : home, { replace: true })
  }

  return (
    <>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />

      <div className="bg-surface font-body text-on-surface min-h-screen flex items-center justify-center p-4 sm:p-0">
        <div className="flex flex-col md:flex-row w-full max-w-6xl min-h-[700px] bg-surface-container-lowest rounded-full overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.08)]">
          <div className="relative w-full md:w-1/2 flex flex-col justify-end p-8 md:p-16 overflow-hidden bg-primary">
            <div className="absolute inset-0 z-0">
              <img
                alt="Thư viện khuôn viên trường đại học hiện đại"
                className="w-full h-full object-cover opacity-60 mix-blend-overlay"
                src={CAMPUS_IMG}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent z-10" />
            <div className="relative z-20 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-white/10 text-white shadow-sm">
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="text-xs font-label uppercase tracking-widest font-semibold">
                  Cổng thông tin bảo mật
                </span>
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight">
                Chào mừng quay trở lại
              </h1>
              <p className="text-white/80 text-lg font-body max-w-md leading-relaxed">
                Kiến tạo môi trường học tập kỷ cương và hiện đại cùng nền tảng quản trị SaoDo.
              </p>
              <div className="pt-8 flex gap-4">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
                <div className="w-12 h-1 bg-white/20 rounded-full" />
                <div className="w-12 h-1 bg-white rounded-full" />
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 bg-surface-container-lowest p-8 md:p-20 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="mb-12 flex flex-col items-center md:items-start">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-6 shadow-xl shadow-primary/10 ring-1 ring-primary/10 dark:ring-slate-600 p-1.5">
                  <ProjectLogo className="h-full w-full object-contain" />
                </div>
                <h2 className="font-headline text-2xl font-extrabold text-primary tracking-tighter">SaoDo</h2>
                <p className="text-on-surface-variant font-body text-sm mt-1">
                  Hệ thống Quản lý Hành vi &amp; Kỷ luật
                </p>
                {requireAdminRole ? (
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mt-2">
                    Đăng nhập dành cho Quản trị (ADMIN), Giáo viên (TEACHER / GVCN / GVBM) và Đội Sao Đỏ (RED_STAR).
                  </p>
                ) : null}
              </div>

              {!isConfigured ? (
                <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
                  <p className="font-bold">Chưa cấu hình Firebase</p>
                  <p className="mt-1 opacity-90">
                    Sao chép <code className="font-mono text-xs">.env.example</code> thành{' '}
                    <code className="font-mono text-xs">.env</code> và điền cấu hình web app từ Firebase Console
                    (Project settings → Your apps).
                  </p>
                </div>
              ) : null}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error ? (
                  <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">
                    {error}
                  </p>
                ) : null}

                <div className="space-y-2">
                  <label
                    className="block text-sm font-label font-semibold text-on-surface-variant ml-1"
                    htmlFor="email"
                  >
                    Email đăng nhập
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline">mail</span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-4 py-4 bg-surface-container-high border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline"
                      id="email"
                      name="email"
                      placeholder="name@school.edu.vn"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isConfigured || submitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label
                      className="block text-sm font-label font-semibold text-on-surface-variant"
                      htmlFor="password"
                    >
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                      onClick={() => setForgotOpen(true)}
                      disabled={!isConfigured}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline">lock</span>
                    </div>
                    <input
                      className="block w-full pl-11 pr-12 py-4 bg-surface-container-high border-0 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-on-surface placeholder:text-outline"
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={!isConfigured || submitting}
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-primary"
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  className="w-full flex justify-center items-center py-4 px-6 rounded-xl text-white font-headline font-bold text-lg bg-gradient-to-r from-primary to-primary-container shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50"
                  type="submit"
                  disabled={!isConfigured || submitting}
                >
                  {submitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
                  <span className="material-symbols-outlined ml-2 text-xl">arrow_forward</span>
                </button>
              </form>

              <div className="mt-12 pt-8 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex gap-6">
                  <span className="text-sm font-medium text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                    Hỗ trợ kỹ thuật
                  </span>
                </div>
                <div className="text-xs text-outline font-medium">Firebase Auth</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-outline text-xs pointer-events-none">
        <span className="material-symbols-outlined text-sm">copyright</span>
        <span>2026 SaoDo. Bảo mật và Quyền riêng tư theo tiêu chuẩn Giáo dục.</span>
      </div>
    </>
  )
}
