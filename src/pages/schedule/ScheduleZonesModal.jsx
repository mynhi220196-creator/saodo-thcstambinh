import { useEffect, useId, useState } from 'react'
import {
  createDutyZone,
  deleteDutyZone,
  seedDefaultDutyZones,
  updateDutyZone,
} from '../../lib/dutyZonesFirestore.js'
import { AREA_KEY_PRESETS, areaKeyLabel, DEFAULT_DUTY_ZONE_SEEDS } from './scheduleMockData.js'

export default function ScheduleZonesModal({ open, onClose, zones, dutyAssignments }) {
  const titleId = useId()
  const [mode, setMode] = useState(null)
  const [zoneKey, setZoneKey] = useState('')
  const [name, setName] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [areaKey, setAreaKey] = useState('other')
  const [sortOrder, setSortOrder] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setMode(null)
    setZoneKey('')
    setName('')
    setSubtitle('')
    setAreaKey('other')
    setSortOrder(0)
    setIsActive(true)
    setError('')
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function startAdd() {
    setMode('add')
    setZoneKey('')
    setName('')
    setSubtitle('')
    setAreaKey('other')
    setSortOrder(zones.length)
    setIsActive(true)
    setError('')
  }

  function startEdit(z) {
    setMode(z.id)
    setZoneKey(z.id)
    setName(z.name)
    setSubtitle(z.subtitle)
    setAreaKey(z.areaId || 'other')
    setSortOrder(z.sort_order ?? 0)
    setIsActive(z.is_active !== false)
    setError('')
  }

  function cancelForm() {
    setMode(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (mode === 'add') {
        await createDutyZone({
          zoneKey,
          name,
          subtitle,
          area_key: areaKey,
          sort_order: sortOrder,
        })
      } else if (mode && mode !== 'add') {
        await updateDutyZone(mode, {
          name,
          subtitle,
          area_key: areaKey,
          sort_order: sortOrder,
          is_active: isActive,
        })
      }
      cancelForm()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
    } finally {
      setBusy(false)
    }
  }

  async function handleSeed() {
    setBusy(true)
    setError('')
    try {
      await seedDefaultDutyZones(DEFAULT_DUTY_ZONE_SEEDS)
    } catch (err) {
      setError(err?.message ?? 'Không tạo bộ mẫu được.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(z) {
    const hasAssign = dutyAssignments.some((a) => a.zoneId === z.id)
    if (hasAssign) {
      window.alert(
        'Vẫn còn phân công lịch trực gắn mã khu này. Xóa các ô phân công trước, hoặc dùng "Vô hiệu" để ẩn khu khỏi lưới.',
      )
      return
    }
    if (!window.confirm(`Xóa khu "${z.name}" (mã ${z.id})?`)) return
    setBusy(true)
    setError('')
    try {
      await deleteDutyZone(z.id)
      if (mode === z.id) cancelForm()
    } catch (err) {
      setError(err?.message ?? 'Không xóa được.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(z, next) {
    setBusy(true)
    setError('')
    try {
      await updateDutyZone(z.id, { is_active: next })
    } catch (err) {
      setError(err?.message ?? 'Không cập nhật được.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3.5 py-2.5 text-sm'

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl"
      >
        <div className="p-5 border-b border-outline-variant/10 shrink-0">
          <h2 id={titleId} className="font-headline text-xl font-extrabold text-primary">
            Quản lý khu vực trực
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Mỗi khu là một tài liệu <span className="font-mono">duty_zones</span>.{' '}
            <span className="font-semibold text-on-surface">Sửa</span> được tên, mô tả, nhóm lọc, thứ tự và bật/tắt hiển thị.{' '}
            <span className="font-semibold text-on-surface">Mã khu</span> (ID) không đổi — trùng <span className="font-mono">zone_id</span> trong phân công.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={startAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-primary text-white text-sm font-bold disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Thêm khu
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeed}
              className="px-4 py-2 rounded-xl border border-outline-variant/25 text-sm font-semibold text-on-surface hover:bg-surface-container-low"
            >
              Thêm bộ mẫu (3 khu)
            </button>
          </div>

          {mode ? (
            <form onSubmit={handleSubmit} className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-bold text-primary">{mode === 'add' ? 'Khu mới' : 'Sửa khu'}</p>
              {mode === 'add' ? (
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Mã khu * (không đổi sau này)</label>
                  <input
                    className={inputClass}
                    value={zoneKey}
                    onChange={(e) => setZoneKey(e.target.value)}
                    placeholder="vd: cong_truong, san_bong"
                  />
                </div>
              ) : (
                <p className="text-xs font-mono text-on-surface-variant">
                  Mã: <span className="font-bold text-on-surface">{zoneKey}</span>
                </p>
              )}
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Tên hiển thị *</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">Mô tả ngắn</label>
                <input className={inputClass} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Nhóm lọc</label>
                  <select className={inputClass} value={areaKey} onChange={(e) => setAreaKey(e.target.value)}>
                    {AREA_KEY_PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1">Thứ tự</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                  />
                </div>
              </div>
              {mode !== 'add' ? (
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Đang dùng (hiện trên lưới lịch)
                </label>
              ) : null}
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={cancelForm} className="flex-1 py-2 rounded-xl font-bold border border-outline-variant/30">
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex-1 py-2 rounded-xl font-bold text-white bg-primary disabled:opacity-50"
                >
                  {busy ? '…' : 'Lưu'}
                </button>
              </div>
            </form>
          ) : null}

          <ul className="space-y-2">
            {zones.length === 0 ? (
              <li className="text-sm text-on-surface-variant py-4 text-center">Chưa có khu nào. Thêm mới hoặc dùng &quot;bộ mẫu&quot;.</li>
            ) : (
              zones.map((z) => (
                <li
                  key={z.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl border border-outline-variant/15 bg-surface-container-low/40"
                >
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => startEdit(z)}
                    className="flex-1 min-w-0 text-left rounded-lg -m-1 p-1 hover:bg-surface-container-high/80 transition-colors disabled:opacity-60 disabled:hover:bg-transparent"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-on-surface">{z.name}</span>
                      {z.is_active === false ? (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-outline-variant/30 text-on-surface-variant">
                          Vô hiệu
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">{z.subtitle}</p>
                    <p className="text-[10px] font-mono text-on-surface-variant/80 mt-1">
                      {z.id} · {areaKeyLabel(z.areaId)}
                    </p>
                    <p className="text-[10px] text-primary font-bold mt-1.5 sm:hidden">Chạm để sửa tên &amp; mô tả…</p>
                  </button>
                  <div className="flex flex-wrap gap-1 shrink-0 items-center">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => startEdit(z)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-primary font-bold text-sm bg-primary/10 hover:bg-primary/15"
                      title="Sửa tên, mô tả, nhóm lọc…"
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => toggleActive(z, z.is_active === false)}
                      className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high"
                      title={z.is_active === false ? 'Kích hoạt' : 'Vô hiệu'}
                    >
                      <span className="material-symbols-outlined text-lg">
                        {z.is_active === false ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleDelete(z)}
                      className="p-2 rounded-lg text-error hover:bg-error-container/30"
                      title="Xóa"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="p-4 border-t border-outline-variant/10 shrink-0">
          <button type="button" onClick={onClose} className="w-full py-2.5 rounded-xl font-bold border border-outline-variant/30">
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
