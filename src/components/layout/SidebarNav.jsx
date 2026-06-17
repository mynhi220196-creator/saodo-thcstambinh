import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProjectLogo from '../ProjectLogo.jsx'

const navInactive =
  'flex items-start gap-3 px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:text-[#002b6b] dark:hover:text-white transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg duration-200 ease-in-out hover:translate-x-0.5'
const navActive =
  'flex items-start gap-3 px-4 py-2.5 text-[#002b6b] dark:text-white font-semibold bg-white dark:bg-[#1a428a]/20 rounded-lg shadow-sm duration-200 ease-in-out'

export default function SidebarNav({ activeKey = 'lich-truc' }) {
  const [orgOpen, setOrgOpen] = useState(() =>
    ['hoc-sinh', 'lop-hoc', 'giao-vien', 'to-chuyen-mon'].includes(activeKey),
  )
  const [saoDoOpen, setSaoDoOpen] = useState(() =>
    ['lich-truc', 'thanh-vien'].includes(activeKey),
  )

  useEffect(() => {
    if (['hoc-sinh', 'lop-hoc', 'giao-vien', 'to-chuyen-mon'].includes(activeKey)) setOrgOpen(true)
    if (['lich-truc', 'thanh-vien'].includes(activeKey)) setSaoDoOpen(true)
  }, [activeKey])

  function rowClass(key) {
    return key === activeKey ? navActive : navInactive
  }

  function hint(key, extra = 'mt-0.5') {
    const tone =
      key === activeKey
        ? 'text-primary/70 dark:text-white/70'
        : 'text-slate-400 dark:text-slate-500'
    return `text-[10px] font-normal block leading-snug ${extra} ${tone}`
  }

  return (
    <aside className="h-screen w-72 shrink-0 border-r border-transparent bg-slate-50 dark:bg-slate-900 flex flex-col p-4 overflow-y-auto font-['Manrope'] antialiased">
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 ring-1 ring-slate-200/80 dark:ring-slate-600 p-0.5">
            <ProjectLogo className="h-full w-full object-contain" alt="" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-tight text-[#002b6b] dark:text-white leading-tight">SaoDo</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Hệ thống Tác phong</p>
          </div>
        </div>
      </div>

      <nav className="space-y-0.5 flex-1">
        <Link to="/admin/dashboard" className={rowClass('dashboard')}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">bar_chart</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Dashboard</span>
            <span className={hint('dashboard')}>Tổng quan realtime · BXH, thống kê nhanh</span>
          </span>
        </Link>

        <Link to="/admin/users" className={rowClass('nguoi-dung')}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">groups</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Người dùng</span>
            <span className={hint('nguoi-dung')}>Quản lý tài khoản GV &amp; Sao Đỏ</span>
          </span>
        </Link>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setOrgOpen((o) => !o)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[22px] shrink-0">domain</span>
            <span className="font-semibold text-sm flex-1">Tổ chức</span>
            <span className="material-symbols-outlined text-lg text-slate-400 shrink-0">
              {orgOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {orgOpen ? (
            <div className="ml-4 mt-0.5 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-0.5">
              <Link to="/admin/classes" className={`${rowClass('lop-hoc')} !py-2`}>
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">class</span>
                <span className="min-w-0">
                  <span className="font-medium text-sm">Lớp học</span>
                  <span className={hint('lop-hoc', 'mt-0.5')}>Mục 3.2</span>
                </span>
              </Link>
              <Link to="/admin/teachers" className={`${rowClass('giao-vien')} !py-2`}>
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">person_4</span>
                <span className="min-w-0">
                  <span className="font-medium text-sm">Quản lý giáo viên</span>
                  <span className={hint('giao-vien', 'mt-0.5')}>Mục 3.3 · Hồ sơ, phân tổ</span>
                </span>
              </Link>
              <Link to="/admin/students" className={`${rowClass('hoc-sinh')} !py-2`}>
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">school</span>
                <span className="min-w-0">
                  <span className="font-medium text-sm">Học sinh</span>
                  <span className={hint('hoc-sinh', 'mt-0.5')}>Mục 3.4</span>
                </span>
              </Link>
            </div>
          ) : null}
        </div>

        <Link to="/admin/conduct-criteria" className={rowClass('hang-muc-thi-dua')}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">emoji_events</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Hạng mục Thi đua</span>
            <span className={hint('hang-muc-thi-dua')}>Cấu hình tiêu chí điểm +/-</span>
          </span>
        </Link>

        <Link to="/admin/ranks" className={rowClass('huy-hieu')}>
          <span
            className="material-symbols-outlined text-[22px] shrink-0 mt-0.5 text-amber-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Huy hiệu &amp; Vinh danh</span>
            <span className={hint('huy-hieu')}>Mức rank · công bố BXH tuần</span>
          </span>
        </Link>

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setSaoDoOpen((o) => !o)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
          >
            <span
              className="material-symbols-outlined text-[22px] shrink-0 text-red-600 dark:text-red-400"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              flag
            </span>
            <span className="font-semibold text-sm flex-1">Sao Đỏ</span>
            <span className="material-symbols-outlined text-lg text-slate-400 shrink-0">
              {saoDoOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          {saoDoOpen ? (
            <div className="ml-4 mt-0.5 pl-3 border-l-2 border-slate-200 dark:border-slate-700 space-y-0.5">
              <Link to="/admin/sao-do/members" className={`${rowClass('thanh-vien')} !py-2`}>
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">diversity_3</span>
                <span className="min-w-0">
                  <span className="font-medium text-sm">Thành viên</span>
                  <span className={hint('thanh-vien', 'mt-0.5')}>Mục 5.1</span>
                </span>
              </Link>
              <Link to="/admin" className={`${rowClass('lich-truc')} !py-2`}>
                <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">event_available</span>
                <span className="min-w-0">
                  <span className="font-medium text-sm">Lịch trực</span>
                  <span className={hint('lich-truc', 'mt-0.5')}>Mục 5.2</span>
                </span>
              </Link>
            </div>
          ) : null}
        </div>

        <Link to="/admin/score-records" className={rowClass('ban-ghi-diem')}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">fact_check</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Bản ghi Điểm</span>
            <span className={hint('ban-ghi-diem')}>Giám sát &amp; xử lý flag</span>
          </span>
        </Link>

        <Link to="/admin/reports" className={rowClass('bao-cao')}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">monitoring</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Báo cáo &amp; Thống kê</span>
            <span className={hint('bao-cao')}>Theo lớp · xuất Excel</span>
          </span>
        </Link>

        <Link to="/admin/account" className={rowClass('cai-dat')}>
          <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">settings</span>
          <span className="min-w-0">
            <span className="font-medium text-sm block leading-snug">Cài đặt Hệ thống</span>
            <span className={hint('cai-dat')}>Tài khoản · đổi mật khẩu</span>
          </span>
        </Link>
      </nav>

      <div className="mt-auto pt-6">
        <div className="bg-primary-container p-4 rounded-xl text-white">
          <p className="text-xs opacity-75 font-body">Phiên bản học đường</p>
          <p className="font-headline font-bold text-sm">Pro v2.4.0</p>
        </div>
      </div>
    </aside>
  )
}
