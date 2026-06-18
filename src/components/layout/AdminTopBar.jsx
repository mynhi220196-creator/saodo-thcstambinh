import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import AvatarDisplay from '../AvatarDisplay.jsx'
import NotificationBell from '../NotificationBell.jsx'

export default function AdminTopBar({ title, searchPlaceholder }) {
  const navigate = useNavigate()
  const { profile, user, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Quản trị'
  const subtitle = profile?.role === 'ADMIN' ? 'Quản trị hệ thống' : (profile?.role ?? 'Đã đăng nhập')
  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-8 w-full border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-md h-16 shadow-sm border-slate-100 dark:border-slate-800/50 shrink-0">
      <div className="flex items-center gap-6 min-w-0">
        <span className="text-lg font-black text-[#002b6b] dark:text-white uppercase tracking-tight truncate">
          {title}
        </span>
        <div className="relative group hidden md:block">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </span>
          <input
            className="bg-surface-container-high border-none rounded-full pl-10 pr-4 py-1.5 text-sm w-64 max-w-[14rem] lg:max-w-none lg:w-72 focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder={searchPlaceholder}
            type="search"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <NotificationBell accent="blue" />
          <button
            type="button"
            className="p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-all cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant/30 mx-1 hidden sm:block" />
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="flex items-center gap-3 pl-1 sm:pl-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 py-1 pr-1 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-primary leading-none truncate max-w-[140px]">{displayName}</p>
              <p className="text-[10px] text-on-surface-variant">{subtitle}</p>
            </div>
            <AvatarDisplay
              src={profile?.avatar_url}
              alt=""
              className="w-9 h-9 border-2 border-white shadow-sm"
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
                  to="/admin/account"
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-on-surface font-semibold"
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
