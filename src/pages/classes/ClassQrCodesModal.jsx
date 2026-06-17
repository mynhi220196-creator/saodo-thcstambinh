import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { encodeStudentQr } from '../../lib/studentQr.js'

/** Tùy chọn tạo QR: mức sửa lỗi M đủ bền khi in & dán lên thẻ. */
const QR_OPTS = { errorCorrectionLevel: 'M', margin: 1, width: 320 }

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Modal hiển thị lưới mã QR cho từng học sinh trong một lớp (admin),
 * kèm nút In ra giấy A4 để cắt dán lên thẻ học sinh.
 *
 * props:
 *   open       boolean
 *   onClose    () => void
 *   classMeta  { code, school_year, grade, room }
 *   students   [{ id, student_code, full_name }]
 */
export default function ClassQrCodesModal({ open, onClose, classMeta, students }) {
  const [qrMap, setQrMap] = useState({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const roster = useMemo(
    () =>
      (students ?? [])
        .filter((s) => s && s.id && s.is_deleted !== true)
        .slice()
        .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'vi')),
    [students],
  )

  useEffect(() => {
    if (!open) return undefined
    let cancelled = false
    setBusy(true)
    setError('')
    setQrMap({})
    ;(async () => {
      try {
        const entries = await Promise.all(
          roster.map(async (s) => {
            const url = await QRCode.toDataURL(encodeStudentQr(s.id), QR_OPTS)
            return [s.id, url]
          }),
        )
        if (cancelled) return
        setQrMap(Object.fromEntries(entries))
      } catch (e) {
        if (!cancelled) setError(e?.message ?? 'Không tạo được mã QR.')
      } finally {
        if (!cancelled) setBusy(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [open, roster])

  if (!open) return null

  const classCode = classMeta?.code ?? '—'
  const schoolYear = classMeta?.school_year ?? ''

  function handlePrint() {
    const win = window.open('', '_blank', 'width=900,height=1200')
    if (!win) {
      setError('Trình duyệt chặn cửa sổ in. Hãy cho phép pop-up rồi thử lại.')
      return
    }
    const cards = roster
      .map((s) => {
        const img = qrMap[s.id]
        if (!img) return ''
        return `
          <div class="card">
            <img src="${img}" alt="QR ${escapeHtml(s.student_code)}" />
            <div class="name">${escapeHtml(s.full_name)}</div>
            <div class="meta">${escapeHtml(s.student_code ?? '')} · Lớp ${escapeHtml(classCode)}</div>
          </div>`
      })
      .join('')

    win.document.write(`<!doctype html>
<html lang="vi"><head><meta charset="utf-8" />
<title>Thẻ QR · Lớp ${escapeHtml(classCode)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, "Segoe UI", sans-serif; margin: 0; padding: 12mm; color: #111; }
  h1 { font-size: 16px; margin: 0 0 2mm; }
  .sub { font-size: 12px; color: #555; margin: 0 0 6mm; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm; }
  .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 4mm; text-align: center;
          page-break-inside: avoid; break-inside: avoid; }
  .card img { width: 100%; height: auto; display: block; }
  .name { font-size: 12px; font-weight: 700; margin-top: 2mm; line-height: 1.2; }
  .meta { font-size: 10px; color: #555; margin-top: 1mm; }
  @page { size: A4; margin: 10mm; }
  @media print { .no-print { display: none; } }
</style></head>
<body>
  <h1>Thẻ QR học sinh — Lớp ${escapeHtml(classCode)}${schoolYear ? ` (${escapeHtml(schoolYear)})` : ''}</h1>
  <p class="sub">${roster.length} học sinh · Quét QR trên app Sao Đỏ để ghi nhận tác phong.</p>
  <div class="grid">${cards}</div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };<\/script>
</body></html>`)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mã QR lớp ${classCode}`}
        className="relative w-full max-w-5xl max-h-[88vh] flex flex-col rounded-2xl bg-surface-container-lowest shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-outline-variant/15 bg-surface-container-low/60">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-on-surface">Mã QR học sinh · Lớp {classCode}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {roster.length} học sinh{schoolYear ? ` · ${schoolYear}` : ''} · In ra để dán lên thẻ học sinh.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              disabled={busy || roster.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              In thẻ QR
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {error ? (
            <p className="mb-4 text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3">{error}</p>
          ) : null}
          {busy ? (
            <p className="text-sm text-on-surface-variant py-10 text-center">Đang tạo mã QR…</p>
          ) : roster.length === 0 ? (
            <p className="text-sm text-on-surface-variant py-10 text-center">Lớp chưa có học sinh.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {roster.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col items-center rounded-xl border border-outline-variant/20 bg-surface-container-low/40 p-3 text-center"
                >
                  {qrMap[s.id] ? (
                    <img src={qrMap[s.id]} alt={`QR ${s.student_code}`} className="w-full max-w-[160px] h-auto" />
                  ) : (
                    <div className="w-full max-w-[160px] aspect-square bg-surface-container-high rounded" />
                  )}
                  <p className="mt-2 text-sm font-bold text-on-surface leading-tight">{s.full_name}</p>
                  <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                    {s.student_code} · Lớp {classCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
