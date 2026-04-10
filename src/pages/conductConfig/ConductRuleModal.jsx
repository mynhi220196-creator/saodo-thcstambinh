import { useEffect, useId, useState } from 'react'
import { CATEGORY_OPTIONS_FOR_FORM } from './conductRuleMockData.js'

const TYPES = [
  { value: 'reward', label: 'Thưởng (+)' },
  { value: 'penalty', label: 'Phạt (-)' },
]

export default function ConductRuleModal({ open, onClose, onSubmit, initialRule = null }) {
  const titleId = useId()
  const isEdit = Boolean(initialRule)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Chuyên cần')
  const [type, setType] = useState('penalty')
  const [points, setPoints] = useState('-2')
  const [description, setDescription] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    if (initialRule) {
      setCode(initialRule.code ?? '')
      setName(initialRule.name ?? '')
      setCategory(initialRule.category ?? 'Khác')
      setType(initialRule.type === 'reward' ? 'reward' : 'penalty')
      setPoints(String(initialRule.points ?? ''))
      setDescription(initialRule.description ?? '')
      setEnabled(initialRule.enabled !== false)
    } else {
      setCode('')
      setName('')
      setCategory(CATEGORY_OPTIONS_FOR_FORM[0]?.id ?? 'Chuyên cần')
      setType('penalty')
      setPoints('-2')
      setDescription('')
      setEnabled(true)
    }
  }, [open, initialRule])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim() && !isEdit) {
      setError('Nhập mã hạng mục.')
      return
    }
    if (!name.trim()) {
      setError('Nhập tên hạng mục.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit({
        code: code.trim(),
        name: name.trim(),
        category,
        type,
        points: Number(points),
        description: description.trim(),
        enabled,
        _docId: initialRule?.id,
      })
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3.5 py-2.5 text-sm'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 id={titleId} className="font-headline text-xl font-extrabold text-primary">
          {isEdit ? 'Sửa hạng mục' : 'Thêm hạng mục thi đua'}
        </h2>
        <p className="text-xs text-on-surface-variant mt-1">
          Dữ liệu lưu Firestore <span className="font-mono">conduct_criteria</span>. Mã dùng làm ID tài liệu (không trùng).
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {error ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{error}</p> : null}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Mã hạng mục *</label>
            <input
              className={`${inputClass} disabled:opacity-60`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isEdit}
              placeholder="VD: MS-001"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Tên *</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Nhóm danh mục</label>
            <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORY_OPTIONS_FOR_FORM.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Loại</label>
              <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-1">Điểm</label>
              <input
                className={inputClass}
                type="number"
                step="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>
          <p className="text-[11px] text-on-surface-variant -mt-1">Thưởng: điểm &gt; 0. Phạt: điểm &lt; 0.</p>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Mô tả</label>
            <textarea
              className={`${inputClass} min-h-[88px]`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="rounded border-outline-variant" />
            Đang áp dụng
          </label>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold border border-outline-variant/30">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
            >
              {saving ? 'Đang lưu…' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
