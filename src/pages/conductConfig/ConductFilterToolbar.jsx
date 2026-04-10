import { CATEGORY_TABS, TYPE_FILTER_OPTIONS } from './conductRuleMockData.js'

export default function ConductFilterToolbar({
  categoryTab,
  onCategoryTabChange,
  typeFilter,
  onTypeFilterChange,
  query,
  onQueryChange,
}) {
  return (
    <div className="p-6 flex flex-col gap-4 bg-surface-container-low/50">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
          search
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm theo mã, tên, nhóm hoặc mô tả…"
          className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-10 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full">
        {CATEGORY_TABS.map((tab) => {
          const active = categoryTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onCategoryTabChange(tab.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            filter_alt
          </span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-outline-variant/30 text-on-surface-variant rounded-lg pl-10 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer"
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
    </div>
  )
}
