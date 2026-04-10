import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth.js'
import { subscribeHomeroomClassesForTeacher } from '../../lib/organizationFirestore.js'
import PortalTablePagination from './PortalTablePagination.jsx'

const PAGE_SIZE = 10

export default function TeacherClassListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const uid = user?.id ?? ''
  const [classes, setClasses] = useState([])
  const [loadError, setLoadError] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!uid) {
      setClasses([])
      return undefined
    }
    return subscribeHomeroomClassesForTeacher(
      uid,
      (list) => {
        setLoadError('')
        setClasses(list)
      },
      (e) => setLoadError(e?.message ?? 'Không tải được danh sách lớp.'),
    )
  }, [uid])

  const myHomeroomClasses = useMemo(
    () => classes.filter((c) => c.is_deleted !== true && c.is_active !== false),
    [classes],
  )

  useEffect(() => {
    setPage(1)
  }, [uid])

  const totalPages = Math.max(1, Math.ceil(myHomeroomClasses.length / PAGE_SIZE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const sliceStart = (safePage - 1) * PAGE_SIZE
  const pagedClasses = myHomeroomClasses.slice(sliceStart, sliceStart + PAGE_SIZE)
  const pageFrom = myHomeroomClasses.length === 0 ? 0 : sliceStart + 1
  const pageTo = Math.min(safePage * PAGE_SIZE, myHomeroomClasses.length)

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  return (
    <div className="w-full min-w-0 flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 shrink-0">
        <span>Cổng Giáo viên</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-[#0d5c3f] dark:text-emerald-300">Lớp chủ nhiệm</span>
      </div>
      <h1 className="font-headline text-3xl font-extrabold text-[#0d5c3f] dark:text-emerald-100 shrink-0">
        Lớp của tôi
      </h1>
      <p className="text-on-surface-variant text-sm mt-2 shrink-0">
        Bấm một dòng để xem danh sách học sinh.
      </p>

      {loadError ? (
        <p className="mt-6 text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3 shrink-0">
          {loadError}
        </p>
      ) : null}

      {!loadError && myHomeroomClasses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-8 text-center shrink-0">
          <span className="material-symbols-outlined text-4xl text-emerald-600/60">school</span>
          <p className="font-headline text-lg font-extrabold text-on-surface mt-3">Chưa có lớp chủ nhiệm</p>
          <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
            Khi quản trị gán bạn làm GVCN trong mục Lớp học, danh sách sẽ hiện tại đây.
          </p>
        </div>
      ) : null}

      {myHomeroomClasses.length > 0 ? (
        <div className="mt-6 flex-1 min-h-0 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 min-h-0">
            <table className="w-full min-w-[640px] table-fixed text-sm border-collapse">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[28%]" />
                <col className="w-[18%]" />
                <col className="w-[14%]" />
                <col className="w-[28%]" />
              </colgroup>
              <thead>
                <tr className="text-left text-xs font-extrabold uppercase tracking-wide text-on-surface-variant bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-outline-variant/10">
                  <th className="px-4 py-3.5 align-middle">Mã lớp</th>
                  <th className="px-4 py-3.5 align-middle">Tên lớp</th>
                  <th className="px-4 py-3.5 align-middle">Năm học</th>
                  <th className="px-4 py-3.5 align-middle">Phòng</th>
                  <th className="px-4 py-3.5 align-middle text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pagedClasses.map((cl) => (
                  <tr
                    key={cl.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/giao-vien/lop-hoc/${cl.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/giao-vien/lop-hoc/${cl.id}`)
                      }
                    }}
                    className="border-b border-outline-variant/5 last:border-0 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/25 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5 align-middle font-headline font-extrabold text-on-surface truncate">
                      {cl.code ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-on-surface truncate" title={cl.name || ''}>
                      {cl.name?.trim() ? cl.name : '—'}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-on-surface-variant truncate">
                      {cl.school_year ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-on-surface-variant truncate">
                      {cl.room?.trim() ? cl.room : '—'}
                    </td>
                    <td className="px-4 py-3.5 align-middle text-center">
                      <span className="inline-flex items-center justify-center gap-1 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                        Học sinh
                        <span className="material-symbols-outlined text-lg">chevron_right</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PortalTablePagination
            from={pageFrom}
            to={pageTo}
            total={myHomeroomClasses.length}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            noun="lớp"
          />
        </div>
      ) : null}
    </div>
  )
}
