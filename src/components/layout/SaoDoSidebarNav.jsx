import { Link } from 'react-router-dom'
import ProjectLogo from '../ProjectLogo.jsx'

const navInactive =
  'flex items-start gap-3 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-red-900 dark:hover:text-red-200 transition-colors hover:bg-red-50/90 dark:hover:bg-red-950/35 rounded-xl duration-200'
const navActive =
  'flex items-start gap-3 px-4 py-2.5 text-red-900 dark:text-red-100 font-semibold bg-red-50 dark:bg-red-950/45 rounded-xl shadow-sm ring-1 ring-red-200/70 dark:ring-red-900/60'

export default function SaoDoSidebarNav({ activeKey = 'tac-phong', onLinkClick, onCloseDrawer, drawerOpen = false }) {
  function rowClass(key) {
    return key === activeKey ? navActive : navInactive
  }

  function hint(key) {
    const tone =
      key === activeKey
        ? 'text-red-900/75 dark:text-red-200/80'
        : 'text-slate-400 dark:text-slate-500'
    return `text-[10px] font-normal block leading-snug mt-0.5 ${tone}`
  }

  const afterNav = onLinkClick ?? (() => {})

  return (
    <aside
      className={`w-[17rem] max-w-[min(17rem,88vw)] shrink-0 border-r border-red-100/90 dark:border-red-950/50 bg-gradient-to-b from-red-50/95 to-slate-50 dark:from-slate-950 dark:to-slate-900 flex flex-col p-4 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-y-auto font-['Manrope'] antialiased shadow-xl lg:shadow-none fixed lg:static left-0 z-[110] transition-transform duration-200 ease-out will-change-transform top-14 sm:top-16 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] lg:top-0 lg:h-[100dvh] ${
        drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="mb-6 px-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-md shadow-red-900/15 ring-1 ring-red-200/70 dark:ring-red-900/50 p-0.5">
              <ProjectLogo className="h-full w-full object-contain" alt="" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-red-950 dark:text-red-100 leading-tight">SaoDo</h1>
              <p className="text-[10px] uppercase tracking-wider text-red-800/75 dark:text-red-300/85 font-bold">
                Đội Sao Đỏ
              </p>
            </div>
          </div>
          {onCloseDrawer ? (
            <button
              type="button"
              onClick={onCloseDrawer}
              className="lg:hidden shrink-0 -mr-1 -mt-1 p-2 rounded-xl text-slate-500 hover:bg-red-100/80 dark:hover:bg-red-950/50 dark:text-slate-400"
              aria-label="Đóng menu"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          ) : null}
        </div>
      </div>

      <nav className="space-y-1 flex-1">
        <Link to="/sao-do/tac-phong" className={rowClass('tac-phong')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">fact_check</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Ghi nhận tác phong</span>
            <span className={hint('tac-phong')}>Chỉ ghi vi phạm (trừ điểm) — HS hoặc lớp</span>
          </span>
        </Link>

        <Link to="/sao-do/lich-su-ghi-nhan" className={rowClass('lich-su')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">history</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Lịch sử ghi nhận</span>
            <span className={hint('lich-su')}>Mọi bản ghi bạn đã tạo</span>
          </span>
        </Link>

        <Link to="/sao-do/tai-khoan" className={rowClass('tai-khoan')} onClick={afterNav}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">manage_accounts</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Tài khoản</span>
            <span className={hint('tai-khoan')}>Đổi mật khẩu</span>
          </span>
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-gradient-to-br from-red-700 to-rose-900 p-4 rounded-xl text-white shadow-lg shadow-red-900/25">
          <p className="text-xs opacity-90 font-body">Tuần tra · hỗ trợ kỷ luật</p>
          <p className="font-headline font-bold text-sm mt-0.5">Sao Đỏ</p>
        </div>
      </div>
    </aside>
  )
}
