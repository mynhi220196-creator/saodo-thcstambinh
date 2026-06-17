import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import WeeklyHonorBoard from '../../components/WeeklyHonorBoard.jsx'
import { subscribeLatestWeeklyRanking } from '../../lib/weeklyRankingFirestore.js'

/**
 * Trang vinh danh toàn màn hình — hợp chiếu lên TV/màn hình lớn trong trường.
 * Mọi tài khoản đăng nhập đều xem được (đọc snapshot BXH tuần đã công bố).
 */
export default function HonorBoardPage() {
  const [ranking, setRanking] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    return subscribeLatestWeeklyRanking(
      (r) => {
        setRanking(r)
        setHydrated(true)
      },
      () => setHydrated(true),
    )
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-surface to-surface dark:from-amber-950/20 dark:via-slate-950 dark:to-slate-950 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-bold text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Trang chủ
          </Link>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300">
            Hệ thống Sao Đỏ
          </span>
        </div>

        {!hydrated ? (
          <p className="text-center text-on-surface-variant py-20">Đang tải bảng vinh danh…</p>
        ) : (
          <WeeklyHonorBoard
            ranking={ranking}
            tvMode
            emptyHint="Chưa có bảng xếp hạng tuần. Ban giám hiệu sẽ công bố sau."
          />
        )}
      </div>
    </div>
  )
}
