import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

const SCANNER_ELEMENT_ID = 'saodo-qr-reader'

/**
 * Dừng & dọn camera an toàn: chỉ gọi stop() khi đang quét/tạm dừng,
 * và bọc try/catch vì stop() có thể ném đồng bộ "Cannot stop…" nếu chưa chạy.
 * Đợi promise start (nếu còn) settle trước để tránh dừng khi chưa khởi động xong.
 */
function safeTeardown(scanner, startPromise) {
  if (!scanner) return Promise.resolve()
  const clear = () => {
    try {
      scanner.clear()
    } catch {
      /* noop */
    }
  }
  return Promise.resolve(startPromise)
    .catch(() => {})
    .then(() => {
      let state = null
      try {
        state = scanner.getState()
      } catch {
        state = null
      }
      const running =
        state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED
      if (!running) {
        clear()
        return undefined
      }
      try {
        return scanner.stop().then(clear, clear)
      } catch {
        clear()
        return undefined
      }
    })
}

/**
 * Modal bật camera quét mã QR.
 *
 * props:
 *   open      boolean
 *   onClose   () => void
 *   onResult  (decodedText: string) => void   // gọi 1 lần khi quét thành công
 *   accent    'red' | 'emerald'                // màu nhấn theo cổng
 */
export default function QrScannerModal({ open, onClose, onResult, accent = 'red' }) {
  const handledRef = useRef(false)
  const [error, setError] = useState('')
  const [starting, setStarting] = useState(true)

  useEffect(() => {
    if (!open) return undefined
    handledRef.current = false
    setError('')
    setStarting(true)

    let stopped = false
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, { verbose: false })

    const onScan = (decodedText) => {
      if (handledRef.current) return
      handledRef.current = true
      // Dừng camera trước khi trả kết quả để tránh quét trùng; teardown an toàn nếu gọi lại.
      safeTeardown(scanner, startPromise).finally(() => {
        onResult?.(decodedText)
      })
    }

    const startPromise = scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onScan,
        () => {}, // bỏ qua lỗi từng khung hình
      )
      .then(() => {
        if (!stopped) setStarting(false)
      })
      .catch((e) => {
        if (stopped) return
        setStarting(false)
        setError(
          e?.message?.includes('Permission') || e?.name === 'NotAllowedError'
            ? 'Không truy cập được camera. Hãy cấp quyền camera cho trình duyệt rồi thử lại.'
            : (e?.message ?? 'Không khởi động được camera.'),
        )
      })

    return () => {
      stopped = true
      safeTeardown(scanner, startPromise)
    }
  }, [open, onResult])

  if (!open) return null

  const ring = accent === 'emerald' ? 'ring-emerald-500/40' : 'ring-red-500/40'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quét mã QR học sinh"
        className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-outline-variant/15">
          <h3 className="text-lg font-extrabold text-on-surface">Quét mã QR học sinh</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-surface-container-high text-on-surface-variant"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5">
          <div className={`relative overflow-hidden rounded-xl bg-black ring-2 ${ring}`}>
            <div id={SCANNER_ELEMENT_ID} className="w-full [&_video]:w-full [&_video]:rounded-xl" />
            {starting && !error ? (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
                Đang bật camera…
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="mt-4 text-sm font-semibold text-error bg-error-container/30 rounded-xl px-4 py-3">{error}</p>
          ) : (
            <p className="mt-4 text-xs text-on-surface-variant text-center">
              Đưa mã QR trên thẻ học sinh vào khung hình để tự động điền tên &amp; lớp.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
