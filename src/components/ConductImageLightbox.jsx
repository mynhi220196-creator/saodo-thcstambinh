import { useEffect, useMemo, useState } from 'react'

function normalizeUrls(urls) {
  return Array.isArray(urls) ? urls.map((u) => String(u ?? '').trim()).filter(Boolean) : []
}

/**
 * Dải thumbnail ảnh minh chứng — bấm để mở lightbox (zoom).
 * @param {object} props
 * @param {string[]|undefined} props.urls
 * @param {(allUrls: string[], index: number) => void} props.onOpen
 * @param {number} [props.maxThumbs=3]
 */
export function ConductRecordImageStrip({ urls, onOpen, maxThumbs = 3 }) {
  const list = useMemo(() => normalizeUrls(urls), [urls])
  if (list.length === 0) {
    return <span className="text-on-surface-variant text-xs">—</span>
  }
  const shown = list.slice(0, maxThumbs)
  const rest = list.length - shown.length
  return (
    <div className="flex flex-wrap items-center gap-1 max-w-[160px]">
      {shown.map((u, i) => (
        <button
          key={`${u}-${i}`}
          type="button"
          onClick={() => onOpen(list, i)}
          className="block w-9 h-9 rounded-md overflow-hidden border border-outline-variant/25 shrink-0 bg-black/5 hover:ring-2 hover:ring-emerald-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          title="Xem phóng to"
        >
          <img src={u} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </button>
      ))}
      {rest > 0 ? (
        <button
          type="button"
          onClick={() => onOpen(list, maxThumbs)}
          className="min-w-[2.25rem] h-9 px-1 rounded-md border border-outline-variant/25 bg-surface-container-high text-[11px] font-extrabold text-primary hover:bg-surface-container-highest tabular-nums"
          title="Xem thêm ảnh"
        >
          +{rest}
        </button>
      ) : null}
    </div>
  )
}

/**
 * Lightbox toàn màn: zoom ảnh, ← → nhiều ảnh, Escape đóng.
 */
export default function ConductImageLightbox({ open, urls, startIndex = 0, onClose }) {
  const list = useMemo(() => normalizeUrls(urls), [urls])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (!open || list.length === 0) return
    const i = Math.min(Math.max(0, startIndex), list.length - 1)
    setIdx(i)
  }, [open, startIndex, list])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open || list.length === 0) return undefined
    function onKey(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'ArrowLeft' && list.length > 1) {
        e.preventDefault()
        setIdx((i) => (i - 1 + list.length) % list.length)
      }
      if (e.key === 'ArrowRight' && list.length > 1) {
        e.preventDefault()
        setIdx((i) => (i + 1) % list.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, list.length, onClose])

  if (!open || list.length === 0) return null

  const url = list[idx]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Xem ảnh">
      <button type="button" className="absolute inset-0 bg-black/90 backdrop-blur-sm" aria-label="Đóng" onClick={onClose} />
      <button
        type="button"
        onClick={onClose}
        className="fixed top-3 right-3 z-[210] w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/25 shadow-lg"
        aria-label="Đóng"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-2 sm:p-4 pointer-events-none">
        <div className="pointer-events-auto relative flex flex-col items-center max-w-full max-h-full">
          {list.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIdx((i) => (i - 1 + list.length) % list.length)
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 -translate-x-1 sm:-translate-x-2"
              aria-label="Ảnh trước"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_left</span>
            </button>
          ) : null}
          {list.length > 1 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIdx((i) => (i + 1) % list.length)
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/20 translate-x-1 sm:translate-x-2"
              aria-label="Ảnh sau"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">chevron_right</span>
            </button>
          ) : null}
          <img
            src={url}
            alt=""
            className="max-h-[min(88vh,900px)] max-w-[min(96vw,1200px)] w-auto h-auto object-contain rounded-lg shadow-2xl select-none"
            draggable={false}
          />
          {list.length > 1 ? (
            <p className="text-white/75 text-xs font-semibold tabular-nums mt-2">
              {idx + 1} / {list.length}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
