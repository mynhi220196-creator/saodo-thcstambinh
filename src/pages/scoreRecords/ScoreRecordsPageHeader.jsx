import { Link } from 'react-router-dom'

const crumb =
  'text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors'
const crumbCurrent = 'text-xs font-bold uppercase tracking-widest text-primary'

export default function ScoreRecordsPageHeader({ onExportCsv, exportDisabled, onQuickScore, quickDisabled }) {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 mb-8">
      <div className="space-y-3 min-w-0">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5">
          <Link to="/admin/conduct-criteria" className={crumb}>
            Hạng mục thi đua
          </Link>
          <span className="material-symbols-outlined text-on-surface-variant text-[14px] shrink-0">
            chevron_right
          </span>
          <span className={crumbCurrent} aria-current="page">
            Bản ghi điểm
          </span>
        </nav>
        <h2 className="editorial-title text-3xl sm:text-4xl font-extrabold text-primary">
          Nhật ký ghi điểm tác phong
        </h2>
        <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl font-body">
          Theo dõi từng lần cộng/trừ điểm: nguồn ghi (tuần tra, GVCN, giáo viên), trạng thái duyệt và các bản ghi cần xử
          lý.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <button
          type="button"
          onClick={onExportCsv}
          disabled={exportDisabled}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-container-highest transition-all disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-xl">download</span>
          Xuất CSV
        </button>
        <button
          type="button"
          onClick={onQuickScore}
          disabled={quickDisabled}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Ghi điểm nhanh
        </button>
      </div>
    </div>
  )
}
