import { useMemo, useState } from 'react'
import AvatarDisplay from '../../components/AvatarDisplay.jsx'
import { Link } from 'react-router-dom'

export default function ScheduleUnassignedPanel({ pool }) {
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return pool
    return pool.filter((p) => `${p.name} ${p.meta}`.toLowerCase().includes(s))
  }, [pool, q])

  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden flex flex-col max-h-[min(560px,calc(100vh-10rem))]">
      <div className="p-5 border-b border-outline-variant/10 shrink-0">
        <h3 className="font-headline font-extrabold text-primary text-lg">Chờ phân công</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          Đội viên chưa có bất kỳ ca nào trong tuần đang xem (mọi ca). Chọn ô trên lưới để gán.
        </p>
        <div className="relative mt-4">
          <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl pl-10 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
            placeholder="Tìm tên hoặc lớp…"
            type="search"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {pool.length === 0 ? (
          <p className="text-sm text-center text-on-surface-variant py-6 px-2 leading-relaxed">
            Không còn đội viên &quot;rảnh&quot; trong tuần này (mỗi người đã có ít nhất một ca bất kỳ), hoặc chưa có tài khoản{' '}
            <span className="font-mono text-xs">RED_STAR</span>.
          </p>
        ) : null}
        {pool.length > 0 && filtered.length === 0 ? (
          <p className="text-sm text-center text-on-surface-variant py-6">Không khớp tìm kiếm.</p>
        ) : null}
        {filtered.map((s) => (
          <div
            key={s.id ?? s.name}
            className="p-3 bg-surface-container-low/50 border border-outline-variant/15 rounded-xl flex items-center justify-between gap-2 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <AvatarDisplay
                src={s.avatarUrl}
                alt=""
                className="w-10 h-10 shrink-0 ring-2 ring-white dark:ring-slate-800"
                iconClassName="text-xl"
              />
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{s.name}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{s.meta}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-lg shrink-0" title="Kéo thả (sắp có)">
              drag_indicator
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/40 shrink-0">
        <Link
          to="/admin/users"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-primary/25 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Thêm tài khoản Sao Đỏ
        </Link>
      </div>
    </div>
  )
}
