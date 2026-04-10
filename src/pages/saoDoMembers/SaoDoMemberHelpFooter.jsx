export default function SaoDoMemberHelpFooter() {
  return (
    <div className="mt-10 p-6 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-red-100 dark:border-red-900/30 bg-gradient-to-br from-red-50/50 to-primary/5 dark:from-red-950/20 dark:to-slate-900">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-red-600 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            policy
          </span>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-primary">Quy chế đội Sao Đỏ</h4>
          <p className="text-sm text-on-surface-variant">
            Tạo tài khoản vai trò Sao Đỏ tại Quản lý người dùng. Trường tùy chọn trên profile:{' '}
            <span className="font-mono text-[11px]">sao_do_class</span>,{' '}
            <span className="font-mono text-[11px]">sao_do_grade</span>,{' '}
            <span className="font-mono text-[11px]">sao_do_role</span>,{' '}
            <span className="font-mono text-[11px]">sao_do_shift</span>.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="px-5 py-2.5 text-sm font-bold text-red-700 dark:text-red-300 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-red-100 dark:border-red-900/40 shrink-0 self-start sm:self-center"
      >
        Xem quy chế
      </button>
    </div>
  )
}
