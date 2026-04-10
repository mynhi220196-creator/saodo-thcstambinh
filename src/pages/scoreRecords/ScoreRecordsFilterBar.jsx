import DateInputVN from '../../components/DateInputVN.jsx'
import {
  CLASS_FILTER_OPTIONS,
  DATE_RANGE_OPTIONS,
  STATUS_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
} from './scoreRecordMockData.js'

export default function ScoreRecordsFilterBar({
  dateRange,
  onDateRangeChange,
  customDateFrom,
  customDateTo,
  onCustomDateFromChange,
  onCustomDateToChange,
  singleDateYmd,
  onSingleDateYmdChange,
  classCode,
  onClassCodeChange,
  classCodeOptions,
  status,
  onStatusChange,
  type,
  onTypeChange,
  query,
  onQueryChange,
}) {
  const selectClass =
    'rounded-xl border border-outline-variant/20 bg-surface-container-lowest text-sm font-semibold text-on-surface py-2.5 pl-3 pr-8 shadow-sm focus:ring-2 focus:ring-primary/20 min-w-0'

  const classOpts = classCodeOptions ?? CLASS_FILTER_OPTIONS

  return (
    <div className="p-4 sm:p-5 border-b border-outline-variant/10 bg-surface-container-low/30 space-y-4">
      <div className="flex flex-col gap-3 min-w-0">
        <label htmlFor="sr-search" className="sr-only">
          Tìm kiếm bản ghi
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </span>
          <input
            id="sr-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Mã bản ghi, học sinh, lớp, tiêu chí, người ghi…"
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-11 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-primary/15 bg-surface-container-lowest/90 dark:bg-surface-container-low/40 p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[22px]" aria-hidden>
            calendar_month
          </span>
          <span className="text-sm font-extrabold text-on-surface tracking-tight">Lọc theo thời gian</span>
          <span className="text-[11px] font-semibold text-on-surface-variant hidden sm:inline">
            (theo giờ địa phương)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
          <div className="flex flex-col gap-1 min-w-[min(100%,220px)] sm:max-w-[260px]">
            <label htmlFor="sr-date-preset" className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
              Chế độ
            </label>
            <select
              id="sr-date-preset"
              className={selectClass}
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              aria-label="Khoảng thời gian"
            >
              {DATE_RANGE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {dateRange === 'single_day' ? (
            <label className="flex min-w-[11rem] max-w-full shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant sm:min-w-[12rem]">
              Chọn ngày
              <DateInputVN value={singleDateYmd ?? ''} onChange={onSingleDateYmdChange} aria-label="Một ngày cụ thể" />
            </label>
          ) : null}

          {dateRange === 'custom' ? (
            <div className="flex flex-wrap items-end gap-3 sm:gap-4">
              <label className="flex min-w-[11rem] shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant">
                Từ ngày
                <DateInputVN value={customDateFrom ?? ''} onChange={onCustomDateFromChange} aria-label="Từ ngày" />
              </label>
              <label className="flex min-w-[11rem] shrink-0 flex-col gap-1 text-xs font-semibold text-on-surface-variant">
                Đến ngày
                <DateInputVN value={customDateTo ?? ''} onChange={onCustomDateToChange} aria-label="Đến ngày" />
              </label>
            </div>
          ) : null}
        </div>

        {dateRange === 'custom' ? (
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Có thể chỉ nhập một trong hai ô: chỉ &quot;Từ&quot; hoặc chỉ &quot;Đến&quot; để mở một đầu khoảng thời gian.
          </p>
        ) : null}
        {dateRange === 'single_day' && !singleDateYmd ? (
          <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 font-medium">
            Chọn một ngày trong lịch — hoặc đổi chế độ lọc khác.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Lớp · trạng thái · loại</span>
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <select
            className={`${selectClass} flex-1 min-w-[140px]`}
            value={classCode}
            onChange={(e) => onClassCodeChange(e.target.value)}
            aria-label="Lớp"
          >
            {classOpts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className={`${selectClass} flex-1 min-w-[140px]`}
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Trạng thái"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            className={`${selectClass} flex-1 min-w-[140px]`}
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            aria-label="Loại điểm"
          >
            {TYPE_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
