import { Link } from 'react-router-dom'
import ProjectLogo from '../ProjectLogo.jsx'

const navInactive =
  'flex items-start gap-3 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-[#0d5c3f] dark:hover:text-emerald-200 transition-colors hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 rounded-xl duration-200'
const navActive =
  'flex items-start gap-3 px-4 py-2.5 text-[#0d5c3f] dark:text-emerald-200 font-semibold bg-emerald-50 dark:bg-emerald-950/40 rounded-xl shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-800/50'

export default function TeacherSidebarNav({
  activeKey = 'dashboard',
  onLinkClick,
  onCloseDrawer,
  drawerOpen = false,
}) {
  function rowClass(key) {
    return key === activeKey ? navActive : navInactive
  }

  function hint(key) {
    const tone =
      key === activeKey
        ? 'text-emerald-800/70 dark:text-emerald-200/70'
        : 'text-slate-400 dark:text-slate-500'
    return `text-[10px] font-normal block leading-snug mt-0.5 ${tone}`
  }

  const afterNav = onLinkClick ?? (() => {})

  return (
    <aside
      className={`w-[17rem] max-w-[min(17rem,88vw)] shrink-0 border-r border-emerald-100/80 dark:border-emerald-900/40 bg-gradient-to-b from-emerald-50/90 to-slate-50 dark:from-slate-950 dark:to-slate-900 flex flex-col p-4 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto font-['Manrope'] antialiased shadow-xl lg:shadow-none fixed lg:static left-0 z-[110] transition-transform duration-200 ease-out will-change-transform top-14 sm:top-16 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] lg:top-0 lg:h-[100dvh] ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="mb-6 px-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/10 ring-1 ring-emerald-200/70 dark:ring-emerald-800/50 p-0.5">
              <ProjectLogo className="h-full w-full object-contain" alt="" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-[#0d5c3f] dark:text-emerald-100 leading-tight">SaoDo</h1>
              <p className="text-[10px] uppercase tracking-wider text-emerald-700/70 dark:text-emerald-400/80 font-bold">
                Cổng Giáo viên
              </p>
            </div>
          </div>
          {onCloseDrawer ? (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="lg:hidden shrink-0 -mr-1 -mt-1 p-2 rounded-xl text-slate-500 hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50 dark:text-slate-400"
              aria-label="Đóng menu"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          ) : null}
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <Link to="/giao-vien" className={rowClass('dashboard')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">dashboard</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Dashboard</span>
            <span className={hint('dashboard')}>Tổng quan nhanh · lớp chủ nhiệm</span>
          </span>
        </Link>

        <Link to="/giao-vien/lop-hoc" className={rowClass('lop-hoc')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">class</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Lớp của tôi</span>
            <span className={hint('lop-hoc')}>Danh sách học sinh lớp GVCN</span>
          </span>
        </Link>

        <Link to="/giao-vien/tac-phong" className={rowClass('tac-phong')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">fact_check</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Ghi nhận tác phong</span>
            <span className={hint('tac-phong')}>Cá nhân hoặc điểm tập thể lớp</span>
          </span>
        </Link>

        <Link to="/giao-vien/lich-su-ghi-nhan" className={rowClass('lich-su')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">history</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Lịch sử ghi nhận</span>
            <span className={hint('lich-su')}>Mọi bản ghi bạn đã tạo</span>
          </span>
        </Link>

        <Link to="/giao-vien/tai-khoan" className={rowClass('tai-khoan')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">manage_accounts</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Tài khoản</span>
            <span className={hint('tai-khoan')}>Đổi mật khẩu</span>
          </span>
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-gradient-to-br from-emerald-700 to-teal-800 p-4 rounded-xl text-white shadow-lg shadow-emerald-900/20">
          <p className="text-xs opacity-85 font-body">Cổng giáo viên</p>
          <p className="font-headline font-bold text-sm mt-0.5">Tác phong &amp; kỷ luật</p>
        </div>
      </div>
    </aside>
  )
}
