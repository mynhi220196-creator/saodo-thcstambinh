export default function StudentFilterBar({
  classFilter,
  onClassFilterChange,
  classOptions,
  statusFilter,
  onStatusFilterChange,
  query,
  onQueryChange,
  onExport,
}) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl mb-6 flex flex-col gap-4">
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
          <span className="material-symbols-outlined text-[22px]">search</span>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm theo tên, mã HS hoặc mã lớp…"
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-11 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Lớp:</span>
            <select
              value={classFilter}
              onChange={(e) => onClassFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer max-w-[14rem]"
            >
              {classOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/10">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-tighter">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border-none bg-transparent text-sm font-semibold focus:ring-0 py-0 pr-8 cursor-pointer"
            >
              <option value="active">Đang học</option>
              <option value="archived">Đã ẩn (xoá mềm)</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest text-on-surface text-sm font-semibold rounded-xl border border-outline-variant/10 hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          <span>Xuất CSV (bộ lọc)</span>
        </button>
      </div>
    </div>
  )
}
