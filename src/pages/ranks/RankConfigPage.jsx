import { useCallback, useEffect, useState } from 'react'
import AdminShell from '../../components/layout/AdminShell.jsx'
import RankBadge from '../../components/RankBadge.jsx'
import {
  createConductRank,
  deleteConductRank,
  subscribeConductRanks,
  updateConductRank,
} from '../../lib/conductRanksFirestore.js'
import RankModal from './RankModal.jsx'

export default function RankConfigPage() {
  const [ranks, setRanks] = useState([])
  const [loadError, setLoadError] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [banner, setBanner] = useState('')

  useEffect(() => {
    return subscribeConductRanks(
      (list) => {
        setLoadError('')
        setRanks(list)
        setHydrated(true)
      },
      (e) => {
        setLoadError(e?.message ?? 'Không tải được danh sách huy hiệu.')
        setHydrated(true)
      },
    )
  }, [])

  const showBanner = useCallback((msg) => {
    setBanner(msg)
    if (msg) window.setTimeout(() => setBanner(''), 4000)
  }, [])

  const handleSubmit = useCallback(
    async (payload) => {
      setBusy(true)
      try {
        if (editing) await updateConductRank(editing.id, payload)
        else await createConductRank(payload)
        setModalOpen(false)
        setEditing(null)
        showBanner(editing ? 'Đã cập nhật mức huy hiệu.' : 'Đã thêm mức huy hiệu.')
      } catch (e) {
        window.alert(e?.message ?? 'Không lưu được.')
      } finally {
        setBusy(false)
      }
    },
    [editing, showBanner],
  )

  const handleToggle = useCallback(
    async (row) => {
      try {
        await updateConductRank(row.id, { enabled: !row.enabled })
      } catch (e) {
        window.alert(e?.message ?? 'Không đổi được trạng thái.')
      }
    },
    [],
  )

  const handleDelete = useCallback(
    async (row) => {
      if (!window.confirm(`Xóa mức «${row.name}»? Thao tác không thể hoàn tác.`)) return
      try {
        await deleteConductRank(row.id)
        showBanner('Đã xóa mức huy hiệu.')
      } catch (e) {
        window.alert(e?.message ?? 'Không xóa được.')
      }
    },
    [showBanner],
  )

  return (
    <AdminShell activeKey="huy-hieu" headerTitle="Thi đua · Huy hiệu" searchPlaceholder="">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-extrabold text-primary">Mức huy hiệu thi đua</h1>
          <p className="text-on-surface-variant text-sm mt-2 max-w-2xl">
            Tạo các mức huy hiệu theo <span className="font-semibold text-on-surface">ngưỡng điểm tuần</span>. Lớp đạt ngưỡng cao nhất sẽ nhận huy hiệu tương ứng khi Ban giám hiệu công bố BXH tuần.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 shrink-0"
        >
          <span className="material-symbols-outlined text-xl">add</span>
          Thêm mức
        </button>
      </div>

      {banner ? (
        <p className="text-sm font-semibold rounded-xl px-4 py-3 mb-4 text-green-800 bg-green-50 dark:bg-green-950/30 dark:text-green-200">{banner}</p>
      ) : null}
      {loadError ? (
        <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3 mb-4">{loadError}</p>
      ) : null}

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        {!hydrated ? (
          <p className="px-6 py-12 text-center text-on-surface-variant text-sm">Đang tải…</p>
        ) : ranks.length === 0 ? (
          <div className="px-6 py-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">workspace_premium</span>
            <p className="font-medium text-on-surface">Chưa có mức huy hiệu nào</p>
            <p className="text-sm mt-1">Bấm «Thêm mức» để tạo, ví dụ: Vàng ≥100, Bạc ≥80, Đồng ≥60.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="bg-surface-container-low/40 text-[11px] font-extrabold uppercase tracking-wider text-on-surface-variant">
                  <th className="px-5 py-3">Huy hiệu</th>
                  <th className="px-5 py-3 text-center">Ngưỡng điểm</th>
                  <th className="px-5 py-3">Mô tả</th>
                  <th className="px-5 py-3 text-center">Trạng thái</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {ranks.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low/30">
                    <td className="px-5 py-4">
                      <RankBadge name={r.name} icon={r.icon} color={r.color} size="md" />
                    </td>
                    <td className="px-5 py-4 text-center tabular-nums font-extrabold text-on-surface">≥ {r.minPoints}</td>
                    <td className="px-5 py-4 text-sm text-on-surface-variant max-w-[260px]">{r.description || '—'}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(r)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          r.enabled
                            ? 'bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-100'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {r.enabled ? 'Đang bật' : 'Đã tắt'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(r)
                            setModalOpen(true)
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(r)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-error bg-error-container/20 border border-error/25 hover:bg-error-container/40"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RankModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        onSubmit={handleSubmit}
        editing={editing}
        busy={busy}
      />
    </AdminShell>
  )
}
