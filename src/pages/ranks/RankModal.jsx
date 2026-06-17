import { useEffect, useState } from 'react'
import { RANK_COLORS } from '../../lib/conductRanksFirestore.js'
import RankBadge from '../../components/RankBadge.jsx'

const ICON_OPTIONS = [
  'military_tech',
  'workspace_premium',
  'trophy',
  'star',
  'emoji_events',
  'verified',
  'shield',
  'diamond',
  'local_fire_department',
  'bolt',
]

const EMPTY = { name: '', icon: 'military_tech', color: 'gold', minPoints: '', description: '', enabled: true }

/**
 * Modal tạo/sửa mức huy hiệu.
 * props: open, onClose, onSubmit(payload), editing (row|null), busy
 */
export default function RankModal({ open, onClose, onSubmit, editing = null, busy = false }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setError('')
    if (editing) {
      setForm({
        name: editing.name ?? '',
        icon: editing.icon || 'military_tech',
        color: editing.color || 'gold',
        minPoints: String(editing.minPoints ?? ''),
        description: editing.description ?? '',
        enabled: editing.enabled !== false,
      })
    } else {
      setForm(EMPTY)
    }
  }, [open, editing])

  if (!open) return null

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Nhập tên mức huy hiệu.')
      return
    }
    if (form.minPoints === '' || Number.isNaN(Number(form.minPoints))) {
      setError('Nhập ngưỡng điểm hợp lệ.')
      return
    }
    onSubmit?.({
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      minPoints: Number(form.minPoints),
      description: form.description.trim(),
      enabled: form.enabled,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={busy ? undefined : onClose} aria-hidden />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-surface-container-lowest shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-outline-variant/15">
          <h3 className="text-lg font-extrabold text-on-surface">
            {editing ? 'Sửa mức huy hiệu' : 'Thêm mức huy hiệu'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant disabled:opacity-50"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex items-center justify-center py-2">
            <RankBadge name={form.name || 'Xem trước'} icon={form.icon} color={form.color} size="lg" />
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Tên mức <span className="text-error">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="VD: Vàng / Xuất sắc / Lá cờ đầu"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">
                Ngưỡng điểm tối thiểu <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={form.minPoints}
                onChange={(e) => set('minPoints', e.target.value)}
                placeholder="VD: 80"
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
              />
              <p className="text-[11px] text-on-surface-variant mt-1">Lớp đạt ≥ ngưỡng này (và là mức cao nhất đạt được) sẽ nhận huy hiệu.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1.5">Màu</label>
              <select
                value={form.color}
                onChange={(e) => set('color', e.target.value)}
                className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
              >
                {RANK_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Biểu tượng</label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => set('icon', ic)}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${
                    form.icon === ic
                      ? 'border-primary bg-primary-fixed/40 text-primary'
                      : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  title={ic}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{ic}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-on-surface mb-1.5">Mô tả (tuỳ chọn)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <input type="checkbox" checked={form.enabled} onChange={(e) => set('enabled', e.target.checked)} />
            Kích hoạt mức này
          </label>

          {error ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-3 py-2">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-outline-variant/15 bg-surface-container-low/40">
          <button type="button" onClick={onClose} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50">
            Hủy
          </button>
          <button type="submit" disabled={busy} className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50">
            {busy ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Thêm mức'}
          </button>
        </div>
      </form>
    </div>
  )
}
