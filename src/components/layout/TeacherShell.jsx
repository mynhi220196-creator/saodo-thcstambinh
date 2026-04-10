import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import TeacherSidebarNav from './TeacherSidebarNav.jsx'
import TeacherTopBar from './TeacherTopBar.jsx'

export default function TeacherShell({ activeKey, headerTitle, searchPlaceholder, children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <div className="flex h-[100dvh] min-h-0 overflow-hidden">
        {/* Lớp mờ mobile — desktop ẩn hoàn toàn */}
        <button
          type="button"
          className={`lg:hidden fixed left-0 right-0 bottom-0 top-14 sm:top-16 z-[105] bg-slate-900/45 backdrop-blur-[2px] transition-opacity duration-200 ${
            mobileNavOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setMobileNavOpen(false)}
          aria-label="Đóng menu điều hướng"
          aria-hidden={!mobileNavOpen}
        />

        <TeacherSidebarNav
          activeKey={activeKey}
          onLinkClick={() => setMobileNavOpen(false)}
          onCloseDrawer={() => setMobileNavOpen(false)}
          drawerOpen={mobileNavOpen}
        />

        <main className="flex-1 flex flex-col min-w-0 w-full min-h-0 overflow-hidden bg-surface">
          <TeacherTopBar
            title={headerTitle}
            searchPlaceholder={searchPlaceholder}
            onMenuClick={() => setMobileNavOpen((o) => !o)}
            navDrawerOpen={mobileNavOpen}
          />
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:px-8 lg:pb-8 flex flex-col">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
