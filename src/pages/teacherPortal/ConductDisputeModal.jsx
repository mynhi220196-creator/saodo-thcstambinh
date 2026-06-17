import { useEffect, useState } from 'react'
import { formatDateTimeVN } from '../../lib/dateFormat.js'

const MAX_REASON = 1000

/**
 * Modal GVCN gửi khiếu nại một bản ghi điểm trừ.
 *
 * props:
 *   open      boolean
 *   onClose   () => void
 *   record    bản ghi (snapshotToConductRecord) | null
 *   onSubmit  (reason: string) => void
 *   busy      boolean
 */
export default function ConductDisputeModal({ open, onClose, record, onSubmit, busy = false }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) setReason('')
  }, [open, record?.id])

  if (!open || !record) return null

  const trimmed = reason.trim()
  const canSubmit = trimmed.length > 0 && !busy
  const images = Array.isArray(record.image_urls) ? record.image_urls : []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={busy ? undefined : onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gửi khiếu nại bản ghi tác phong"
        className="relative w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl bg-surface-container-lowest shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-outline-variant/15 bg-amber-50/70 dark:bg-amber-950/30">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-700 dark:text-amber-300">gavel</span>
              Khiếu nại bản ghi
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Gửi lên Ban giám hiệu để phân xử. Điểm vẫn tạm tính cho đến khi có kết quả.
            </p>
          </div>
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
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-on-surface">{record.student_name || '—'}</p>
                <p className="text-sm text-on-surface mt-1 leading-snug">{record.criterion_name || '—'}</p>
                {record.criterion_code ? (
                  <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">{record.criterion_code}</p>
                ) : null}
                <p className="text-xs text-on-surface-variant mt-2">
                  Người ghi: <span className="font-semibold">{record.recorded_by_name || '—'}</span>
                  {record._createdMs ? ` · ${formatDateTimeVN(record._createdMs)}` : ''}
                </p>
              </div>
              <span className="inline-flex shrink-0 min-w-[2.75rem] justify-center px-2 py-1 rounded-lg text-sm font-extrabold tabular-nums bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                {record.points > 0 ? `+${record.points}` : record.points}
              </span>
            </div>
            {images.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((u, i) => (
                  <img
                    key={`${u}-${i}`}
                    src={u}
                    alt={`Minh chứng ${i + 1}`}
                    className="w-16 h-16 object-cover rounded-lg border border-outline-variant/20"
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs italic text-amber-700 dark:text-amber-300">
                Bản ghi này không có ảnh minh chứng.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="dispute-reason" className="block text-sm font-bold text-on-surface mb-1.5">
              Lý do khiếu nại <span className="text-error">*</span>
            </label>
            <textarea
              id="dispute-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
              rows={4}
              autoFocus
              placeholder="Ví dụ: Ảnh minh chứng mờ, không nhìn rõ học sinh; hoặc nội dung vi phạm chưa chính xác…"
              className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
            <p className="text-[11px] text-on-surface-variant mt-1 text-right tabular-nums">
              {trimmed.length}/{MAX_REASON}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-outline-variant/15 bg-surface-container-low/40">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSubmit?.(trimmed)}
            disabled={!canSubmit}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-bold hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">send</span>
            {busy ? 'Đang gửi…' : 'Gửi khiếu nại'}
          </button>
        </div>
      </div>
    </div>
  )
}
