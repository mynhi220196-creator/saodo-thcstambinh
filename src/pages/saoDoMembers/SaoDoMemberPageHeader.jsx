import { Link } from 'react-router-dom'

export default function SaoDoMemberPageHeader() {
  return (
    <div className="relative mb-10 rounded-2xl overflow-hidden border border-red-100 dark:border-red-900/30 bg-gradient-to-br from-red-50/90 via-white to-primary/5 dark:from-slate-900 dark:via-slate-900 dark:to-primary/10">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-red-600 to-primary" aria-hidden />
      <div className="pl-6 sm:pl-8 pr-6 py-8 sm:py-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white shadow-sm"
              style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}
            >
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                flag
              </span>
              Sao Đỏ
            </span>
            <span className="text-on-surface-variant">/</span>
            <span className="text-primary">Thành viên đội</span>
          </div>
          <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary leading-tight">
            Quản lý thành viên Sao Đỏ
          </h2>
          <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body leading-relaxed">
            Danh sách đọc từ Firestore <code className="font-mono text-xs">profiles</code> (vai trò <span className="font-mono text-xs">RED_STAR</span>
            ). Lớp/khối suy từ <span className="font-mono text-xs">sao_do_class</span> hoặc <span className="font-mono text-xs">unit</span>; có thể thêm field{' '}
            <span className="font-mono text-xs">sao_do_role</span>, <span className="font-mono text-xs">sao_do_shift</span> trên profile.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            disabled
            title="Sắp có"
            className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-white/60 dark:bg-slate-800/60 text-on-surface-variant font-semibold rounded-xl border border-outline-variant/20 opacity-50 cursor-not-allowed"
          >
            <span className="material-symbols-outlined">upload_file</span>
            <span>Nhập danh sách</span>
          </button>
          <Link
            to="/admin/users"
            className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-gradient-to-r from-red-600 to-primary text-white font-semibold rounded-xl hover:opacity-95 transition-all shadow-md shadow-red-600/20"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Thêm tài khoản Sao Đỏ</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
