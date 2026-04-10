import { ROLE_OPTIONS, USER_STATUS_OPTIONS } from './userMockData.js'

export default function UserFilterBar({
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  query,
  onQueryChange,
}) {
  const selectClass =
    'rounded-xl border-outline-variant/20 bg-surface-container-lowest text-sm font-semibold text-on-surface py-2.5 pl-3 pr-8 shadow-sm focus:ring-2 focus:ring-primary/20'

  return (
    <div className="p-4 sm:p-5 border-b border-outline-variant/10 bg-surface-container-low/30 flex flex-col lg:flex-row lg:items-end gap-4">
      <div className="flex-1 min-w-0">
        <label htmlFor="user-search" className="sr-only">
          Tìm người dùng
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
            <span className="material-symbols-outlined text-[22px]">search</span>
          </span>
          <input
            id="user-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Tìm theo tên, email, mã đăng nhập hoặc đơn vị…"
            className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest pl-11 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 lg:gap-3 shrink-0">
        <select
          className={selectClass}
          value={roleFilter}
          onChange={(e) => onRoleFilterChange(e.target.value)}
          aria-label="Vai trò"
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          aria-label="Trạng thái tài khoản"
        >
          {USER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
