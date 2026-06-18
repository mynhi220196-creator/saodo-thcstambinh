import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import AvatarDisplay from '../AvatarDisplay.jsx'
import NotificationBell from '../NotificationBell.jsx'

export default function TeacherTopBar({
  title,
  searchPlaceholder = 'Tìm học sinh…',
  onMenuClick,
  navDrawerOpen = false,
}) {
  const navigate = useNavigate()
  const { profile, user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Giáo viên'
  const subtitle = profile?.unit ? profile.unit : 'Giáo viên'
  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-[120] flex items-center justify-between gap-2 pl-3 pr-4 sm:pl-4 sm:pr-6 lg:px-8 w-full border-b bg-white/85 dark:bg-slate-950/85 backdrop-blur-md h-14 sm:h-16 shadow-sm border-emerald-100/80 dark:border-slate-800/50 shrink-0">
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0 flex-1">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-xl text-[#0d5c3f] dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-emerald-100/80 dark:border-slate-700"
            aria-label={navDrawerOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
            aria-expanded={navDrawerOpen}
          >
            <span className="material-symbols-outlined text-[26px]">{navDrawerOpen ? 'close' : 'menu'}</span>
          </button>
        ) : null}
        <span className="text-base sm:text-lg font-black text-[#0d5c3f] dark:text-emerald-100 uppercase tracking-tight truncate min-w-0">
          {title}
        </span>
        <div className="relative group hidden md:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="bg-surface-container-high border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 max-w-[14rem] lg:max-w-none lg:w-72 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <NotificationBell accent="emerald" />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-3 pl-1 sm:pl-2 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-slate-900 py-1 pr-1 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#0d5c3f] dark:text-emerald-100 leading-none truncate max-w-[160px]">
                {displayName}
              </p>
              <p className="text-[10px] text-on-surface-variant">{subtitle}</p>
            </div>
            <AvatarDisplay
              src={profile?.avatar_url}
              alt=""
              className="w-9 h-9 border-2 border-white shadow-sm ring-1 ring-emerald-100 dark:ring-emerald-900"
              iconClassName="text-lg"
            />
            <span className="material-symbols-outlined text-on-surface-variant text-xl hidden sm:block">
              expand_more
            </span>
          </button>
          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[60] cursor-default"
                aria-label="Đóng menu"
                onClick={closeMenu}
              />
              <div className="absolute right-0 top-full mt-1 z-[70] w-56 rounded-xl border border-outline-variant/20 bg-white dark:bg-slate-900 shadow-lg py-1 text-sm">
                <Link
                  to="/giao-vien/tai-khoan"
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-emerald-50/80 dark:hover:bg-slate-800 text-on-surface font-semibold"
                  onClick={closeMenu}
                >
                  <span className="material-symbols-outlined text-xl">key</span>
                  Đổi mật khẩu
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-error font-semibold text-left"
                  onClick={async () => {
                    closeMenu()
                    await signOut()
                    navigate('/', { replace: true })
                  }}
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                  Đăng xuất
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
