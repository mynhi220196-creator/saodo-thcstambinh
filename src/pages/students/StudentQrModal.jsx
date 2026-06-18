import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { encodeStudentQr } from '../../lib/studentQr.js'

const QR_OPTS = { errorCorrectionLevel: 'M', margin: 1, width: 480 }

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Modal xem & in mã QR của MỘT học sinh.
 * props: open, onClose, student { id, code, name, className }
 */
export default function StudentQrModal({ open, onClose, student }) {
  const [dataUrl, setDataUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !student?.id) return undefined
    let cancelled = false
    setError('')
    setDataUrl('')
    QRCode.toDataURL(encodeStudentQr(student.id), QR_OPTS)
      .then((url) => {
        if (!cancelled) setDataUrl(url)
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Không tạo được mã QR.')
      })
    return () => {
      cancelled = true
    }
  }, [open, student?.id])

  if (!open || !student) return null

  function handlePrint() {
    if (!dataUrl) return
    const win = window.open('', '_blank', 'width=480,height=640')
    if (!win) {
      setError('Trình duyệt chặn cửa sổ in. Hãy cho phép pop-up rồi thử lại.')
      return
    }
    win.document.write(`<!doctype html>
<html lang="vi"><head><meta charset="utf-8" />
<title>QR · ${escapeHtml(student.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, "Segoe UI", sans-serif; margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .card { width: 70mm; border: 1px solid #cbd5e1; border-radius: 10px; padding: 6mm; text-align: center; }
  .card img { width: 100%; height: auto; display: block; }
  .name { font-size: 15px; font-weight: 700; margin-top: 4mm; }
  .meta { font-size: 12px; color: #555; margin-top: 1.5mm; }
  @page { margin: 8mm; }
</style></head>
<body>
  <div class="card">
    <img src="${dataUrl}" alt="QR ${escapeHtml(student.code)}" />
    <div class="name">${escapeHtml(student.name)}</div>
    <div class="meta">${escapeHtml(student.code ?? '')} · Lớp ${escapeHtml(student.className ?? '')}</div>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 200); };<\/script>
</body></html>`)
    win.document.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mã QR ${student.name}`}
        className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-outline-variant/15">
          <h3 className="text-lg font-extrabold text-on-surface">Mã QR học sinh</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center">
          {error ? (
            <p className="text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3 w-full">{error}</p>
          ) : dataUrl ? (
            <img src={dataUrl} alt={`QR ${student.code}`} className="w-56 h-56" />
          ) : (
            <div className="w-56 h-56 bg-surface-container-high rounded-lg animate-pulse" />
          )}
          <p className="mt-4 text-lg font-extrabold text-on-surface">{student.name}</p>
          <p className="text-sm font-mono text-on-surface-variant mt-0.5">
            {student.code} · Lớp {student.className ?? '—'}
          </p>
          <p className="text-xs text-on-surface-variant mt-3">
            Quét mã này trên app Sao Đỏ để tự điền tên &amp; lớp khi ghi nhận tác phong.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-outline-variant/15 bg-surface-container-low/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant hover:bg-surface-container-high"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!dataUrl}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-bold hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">print</span>
            In thẻ QR
          </button>
        </div>
      </div>
    </div>
  )
}
