import { Link } from 'react-router-dom'

export default function SchedulePageHeader({ weekLabel, firebaseLive, onManageZones }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white">Sao Đỏ</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary">Lịch trực</span>
          {firebaseLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-600/15 text-green-800 dark:text-green-300 text-[10px] font-extrabold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Firestore realtime
            </span>
          ) : null}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-headline tracking-tight text-primary leading-tight">
          Sắp xếp lịch trực
        </h1>
        <p className="text-on-surface-variant font-medium max-w-2xl text-sm sm:text-base">
          Ma trận khu vực × ngày; chọn ca để xem và chỉnh phân công. Mỗi ô lưu tại{' '}
          <span className="font-mono text-xs">duty_assignments</span> — bấm ô trống để gán, bấm tên để sửa hoặc xóa.
        </p>
        <p className="text-xs text-on-surface-variant/90 font-mono bg-surface-container-low px-3 py-1.5 rounded-lg inline-block w-fit">
          {weekLabel}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
        {onManageZones ? (
          <button
            type="button"
            onClick={onManageZones}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-primary/30 text-primary font-bold bg-primary/5 shadow-sm hover:bg-primary/10 transition-all text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">map</span>
            Khu vực trực
          </button>
        ) : null}
        <button
          type="button"
          disabled
          title="Sắp có"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant font-semibold bg-surface-container-lowest/50 text-sm opacity-60 cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          Gợi ý phân công
        </button>
        <span
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/20 text-primary font-bold text-sm bg-primary/5"
          title="Mỗi thao tác ghi trực tiếp lên Firestore"
        >
          <span className="material-symbols-outlined text-[20px]">cloud_done</span>
          Lưu tự động
        </span>
        <Link
          to="/admin/sao-do/members"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-primary font-bold text-sm border border-primary/25 hover:bg-primary/5 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">groups</span>
          Thành viên
        </Link>
      </div>
    </div>
  )
}
