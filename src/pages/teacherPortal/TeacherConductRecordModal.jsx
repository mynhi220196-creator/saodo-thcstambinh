import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  getCloudinaryConfigError,
  isCloudinaryConfigured,
  uploadConductImageToCloudinary,
} from '../../lib/cloudinaryUpload.js'
import { addConductClassRecord } from '../../lib/conductClassRecordsFirestore.js'
import { addConductScoreRecord } from '../../lib/conductScoreRecordsFirestore.js'

const MAX_EVIDENCE_PHOTOS = 5

function filterCriteria(list, query) {
  const t = String(query ?? '').trim().toLowerCase()
  if (!t) return list
  return list.filter((c) => {
    const blob = `${c.name ?? ''} ${c.code ?? ''} ${c.category ?? ''}`.toLowerCase()
    return blob.includes(t)
  })
}

function groupByCategory(list) {
  const m = new Map()
  for (const c of list) {
    const cat = String(c.category ?? '').trim() || 'Khác'
    if (!m.has(cat)) m.set(cat, [])
    m.get(cat).push(c)
  }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'vi'))
}

/** `individual`: một học sinh. `class`: một bản ghi điểm tác phong của lớp (không cộng vào từng em).
 *  `penaltiesOnly`: true cho Đội Sao Đỏ — chỉ hạng mục trừ điểm (khớp Firestore rules). */
export default function TeacherConductRecordModal({
  mode = 'individual',
  open,
  onClose,
  student,
  classMeta,
  schoolYear,
  criteria,
  teacherUid,
  teacherName,
  onRecorded,
  penaltiesOnly = false,
}) {
  const titleId = useId()
  const searchId = useId()
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const [tab, setTab] = useState('reward')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const [evidenceUrls, setEvidenceUrls] = useState([])
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const rewards = useMemo(() => criteria.filter((c) => c.type === 'reward' && c.enabled !== false), [criteria])
  const penalties = useMemo(() => criteria.filter((c) => c.type === 'penalty' && c.enabled !== false), [criteria])

  const filteredRewards = useMemo(() => filterCriteria(rewards, query), [rewards, query])
  const filteredPenalties = useMemo(() => filterCriteria(penalties, query), [penalties, query])

  const activeList = penaltiesOnly || tab === 'penalty' ? filteredPenalties : filteredRewards
  const grouped = useMemo(() => groupByCategory(activeList), [activeList])

  useEffect(() => {
    if (!open) return
    setTab(penaltiesOnly ? 'penalty' : 'reward')
    setQuery('')
    setSearchOpen(false)
    setSelected(null)
    setNote('')
    setEvidenceUrls([])
    setUploading(false)
    setError('')
    setBusy(false)
  }, [open, mode, student?.id, classMeta?.id, penaltiesOnly])

  useEffect(() => {
    if (selected && selected.type !== tab) {
      setSelected(null)
    }
  }, [tab, selected])

  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleImageFiles(fileList) {
    const files = fileList ? Array.from(fileList) : []
    if (files.length === 0) return
    if (!isCloudinaryConfigured()) {
      setError(getCloudinaryConfigError())
      return
    }
    const room = MAX_EVIDENCE_PHOTOS - evidenceUrls.length
    if (room <= 0) return
    const take = files.slice(0, room)
    setUploading(true)
    setError('')
    try {
      const next = [...evidenceUrls]
      for (const f of take) {
        const url = await uploadConductImageToCloudinary(f)
        next.push(url)
      }
      setEvidenceUrls(next)
    } catch (err) {
      setError(err?.message ?? 'Upload ảnh thất bại.')
    } finally {
      setUploading(false)
    }
  }

  function removeEvidenceAt(index) {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selected || !classMeta || !teacherUid) return
    if (mode === 'individual' && !student) return
    if (penaltiesOnly && selected.type !== 'penalty') {
      setError('Tài khoản Sao Đỏ chỉ được ghi nhận vi phạm (trừ điểm).')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'class') {
        await addConductClassRecord({
          class_id: classMeta.id,
          class_code: classMeta.code ?? '',
          school_year: schoolYear,
          criterion_id: selected.id,
          criterion_code: selected.code ?? selected.id,
          criterion_name: selected.name ?? '',
          type: selected.type,
          points: selected.points,
          note,
          recorded_by: teacherUid,
          recorded_by_name: teacherName ?? '',
          image_urls: evidenceUrls,
        })
        onRecorded?.({ mode: 'class' })
      } else {
        await addConductScoreRecord({
          student_id: student.id,
          student_name: student.full_name ?? '',
          class_id: classMeta.id,
          class_code: classMeta.code ?? '',
          school_year: schoolYear,
          criterion_id: selected.id,
          criterion_code: selected.code ?? selected.id,
          criterion_name: selected.name ?? '',
          type: selected.type,
          points: selected.points,
          note,
          recorded_by: teacherUid,
          recorded_by_name: teacherName ?? '',
          image_urls: evidenceUrls,
        })
        onRecorded?.({ mode: 'individual' })
      }
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Không lưu được.')
    } finally {
      setBusy(false)
    }
  }

  if (!open || !classMeta) return null
  if (mode === 'individual' && !student) return null

  const isRewardTab = !penaltiesOnly && tab === 'reward'
  let emptyHint = ''
  if (activeList.length === 0) {
    emptyHint = query.trim()
      ? 'Không có hạng mục khớp tìm kiếm.'
      : isRewardTab
        ? 'Chưa có hạng mục cộng điểm.'
        : 'Chưa có hạng mục trừ điểm.'
  }

  function closeSearch() {
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md max-h-[min(90vh,640px)] overflow-hidden flex flex-col rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl"
      >
        <div className="px-3 py-2.5 sm:px-4 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 id={titleId} className="font-headline text-base font-extrabold text-[#0d5c3f] dark:text-emerald-100 truncate">
              {penaltiesOnly ? 'Ghi nhận vi phạm' : 'Ghi nhận tác phong'}
            </h2>
            {mode === 'class' ? (
              <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-900 dark:bg-teal-900/50 dark:text-teal-100">
                Lớp
              </span>
            ) : (
              <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-slate-200/80 text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                HS
              </span>
            )}
          </div>
          {mode === 'class' ? (
            <p className="text-xs text-on-surface font-semibold truncate mt-0.5" title="Điểm tập thể, không vào từng học sinh">
              Lớp {classMeta.code ?? '—'} · tập thể
            </p>
          ) : (
            <p className="text-xs text-on-surface truncate mt-0.5 font-medium">
              {student.full_name ?? '—'}{' '}
              <span className="text-on-surface-variant font-mono font-normal">
                {student.student_code ?? '—'} · {classMeta.code ?? '—'}
              </span>
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 px-3 sm:px-4 pt-2.5 pb-2 space-y-2">
            {error ? (
              <p className="text-xs font-semibold text-error bg-error-container/30 rounded-lg px-2.5 py-1.5">{error}</p>
            ) : null}

            <div className="flex items-stretch gap-2">
              {penaltiesOnly ? (
                <div
                  className="flex flex-1 items-center rounded-lg px-3 py-2 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50"
                  role="status"
                >
                  <span className="text-xs font-extrabold text-rose-900 dark:text-rose-100">
                    Chỉ vi phạm · trừ điểm ({penalties.length} hạng mục)
                  </span>
                </div>
              ) : (
                <div
                  className="flex flex-1 rounded-lg p-0.5 bg-surface-container-high border border-outline-variant/15"
                  role="tablist"
                  aria-label="Loại điểm"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isRewardTab}
                    onClick={() => setTab('reward')}
                    className={`flex-1 min-w-0 py-1.5 px-2 rounded-md text-xs font-extrabold transition-all ${
                      isRewardTab
                        ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="tabular-nums text-sm leading-none">+</span>
                    <span className="block text-[9px] font-bold opacity-75 mt-0.5">Cộng ({rewards.length})</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={!isRewardTab}
                    onClick={() => setTab('penalty')}
                    className={`flex-1 min-w-0 py-1.5 px-2 rounded-md text-xs font-extrabold transition-all ${
                      !isRewardTab
                        ? 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    <span className="tabular-nums text-sm leading-none">−</span>
                    <span className="block text-[9px] font-bold opacity-75 mt-0.5">Trừ ({penalties.length})</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
                aria-expanded={searchOpen}
                aria-controls={searchOpen ? 'conduct-criteria-search-panel' : undefined}
                className={`shrink-0 flex flex-col items-center justify-center w-11 rounded-lg border text-xs font-extrabold transition-colors ${
                  searchOpen || query.trim()
                    ? 'border-primary bg-primary-fixed/25 text-primary dark:bg-primary-container/20'
                    : 'border-outline-variant/25 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                title={searchOpen ? 'Đóng tìm kiếm' : 'Tìm hạng mục'}
              >
                <span className="material-symbols-outlined text-xl leading-none">
                  {searchOpen ? 'close' : 'search'}
                </span>
              </button>
            </div>

            {searchOpen ? (
              <div id="conduct-criteria-search-panel" className="relative">
                <label htmlFor={searchId} className="sr-only">
                  Tìm hạng mục
                </label>
                <span className="absolute inset-y-0 left-2.5 flex items-center text-on-surface-variant pointer-events-none">
                  <span className="material-symbols-outlined text-lg">search</span>
                </span>
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tên, mã, nhóm…"
                  autoComplete="off"
                  autoFocus
                  className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-high pl-9 pr-2 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            ) : null}
          </div>

          <div className="flex-1 min-h-0 px-3 sm:px-4 pb-1">
            <div
              className={`h-full max-h-[min(36vh,220px)] sm:max-h-[min(40vh,260px)] overflow-y-auto rounded-lg border ${
                isRewardTab
                  ? 'border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/15 dark:bg-emerald-950/10'
                  : 'border-rose-100 dark:border-rose-900/40 bg-rose-50/10 dark:bg-rose-950/10'
              }`}
            >
              {activeList.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-6 px-3">{emptyHint}</p>
              ) : (
                grouped.map(([category, items]) => (
                  <div key={category}>
                    <div
                      className={`sticky top-0 z-[1] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider border-b ${
                        isRewardTab
                          ? 'bg-emerald-100/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-800'
                          : 'bg-rose-100/95 dark:bg-rose-950/85 text-rose-900 dark:text-rose-200 border-rose-200/60 dark:border-rose-900/50'
                      }`}
                    >
                      {category}
                    </div>
                    <ul className="divide-y divide-outline-variant/10">
                      {items.map((c) => {
                        const on = selected?.id === c.id
                        return (
                          <li key={c.id}>
                            <button
                              type="button"
                              onClick={() => setSelected(c)}
                              className={`w-full flex items-center justify-between gap-2 text-left px-2.5 py-2 text-xs sm:text-sm transition-colors ${
                                on
                                  ? isRewardTab
                                    ? 'bg-emerald-100/80 dark:bg-emerald-900/40 ring-1 ring-inset ring-emerald-400/40'
                                    : 'bg-rose-100/80 dark:bg-rose-900/35 ring-1 ring-inset ring-rose-400/35'
                                  : 'hover:bg-surface-container-high/80 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <span className="min-w-0 font-medium text-on-surface leading-snug">
                                <span className="block truncate">{c.name}</span>
                                {c.code ? (
                                  <span className="block text-[9px] font-mono text-on-surface-variant truncate mt-0.5">
                                    {c.code}
                                  </span>
                                ) : null}
                              </span>
                              <span
                                className={`shrink-0 text-xs sm:text-sm font-extrabold tabular-nums ${
                                  isRewardTab
                                    ? 'text-emerald-700 dark:text-emerald-300'
                                    : 'text-rose-700 dark:text-rose-300'
                                }`}
                              >
                                {c.points > 0 ? `+${c.points}` : c.points}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="shrink-0 px-3 sm:px-4 pb-3 pt-2 space-y-2 border-t border-outline-variant/10 bg-surface-container-lowest">
            {selected ? (
              <p className="text-[11px] text-on-surface-variant line-clamp-2">
                <span className="font-bold text-on-surface">Đã chọn:</span> {selected.name}{' '}
                <span
                  className={`font-mono font-bold ${
                    selected.type === 'penalty'
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  ({selected.points > 0 ? `+${selected.points}` : selected.points})
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-on-surface-variant">Chọn một hạng mục ở danh sách.</p>
            )}

            <div>
              <label className="block text-[10px] font-bold text-on-surface-variant mb-0.5">Ghi chú</label>
              <textarea
                className="w-full rounded-lg border border-outline-variant/25 bg-surface-container-high px-2.5 py-1.5 text-xs min-h-[48px] resize-y"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={mode === 'class' ? 'Tuỳ chọn…' : 'Tuỳ chọn…'}
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high/40 px-2.5 py-2 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-on-surface-variant">Ảnh minh chứng</span>
                <span className="text-[10px] font-semibold tabular-nums text-on-surface-variant">
                  {evidenceUrls.length}/{MAX_EVIDENCE_PHOTOS}
                </span>
              </div>
              {!isCloudinaryConfigured() ? (
                <p className="text-[10px] text-amber-800 dark:text-amber-200 leading-snug bg-amber-50/80 dark:bg-amber-950/30 rounded px-1.5 py-1">
                  {getCloudinaryConfigError()}
                </p>
              ) : null}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                className="sr-only"
                onChange={(e) => {
                  handleImageFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                capture="environment"
                className="sr-only"
                onChange={(e) => {
                  handleImageFiles(e.target.files)
                  e.target.value = ''
                }}
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <button
                  type="button"
                  disabled={uploading || evidenceUrls.length >= MAX_EVIDENCE_PHOTOS || !isCloudinaryConfigured()}
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-surface-container-lowest border border-outline-variant/25 hover:bg-surface-container-high disabled:opacity-45"
                >
                  <span className="material-symbols-outlined text-base">photo_library</span>
                  Thư viện
                </button>
                <button
                  type="button"
                  disabled={uploading || evidenceUrls.length >= MAX_EVIDENCE_PHOTOS || !isCloudinaryConfigured()}
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-surface-container-lowest border border-outline-variant/25 hover:bg-surface-container-high disabled:opacity-45"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  Camera
                </button>
                {uploading ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm animate-pulse">cloud_upload</span>
                    Đang tải…
                  </span>
                ) : null}
              </div>
              {evidenceUrls.length > 0 ? (
                <ul className="flex flex-wrap gap-1.5 pt-0.5">
                  {evidenceUrls.map((url, i) => (
                    <li key={`${url}-${i}`} className="relative group w-12 h-12 shrink-0 rounded-md overflow-hidden border border-outline-variant/20 bg-black/5">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeEvidenceAt(i)}
                        disabled={uploading || busy}
                        className="absolute inset-0 flex items-center justify-center bg-slate-900/55 text-white opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold"
                        aria-label="Xóa ảnh"
                      >
                        <span className="material-symbols-outlined text-xl">close</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="flex gap-2 pt-0.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm font-bold border border-outline-variant/30"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={busy || uploading || !selected}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
              >
                {busy
                  ? 'Đang lưu…'
                  : mode === 'class'
                    ? penaltiesOnly
                      ? 'Lưu vi phạm lớp'
                      : 'Lưu điểm lớp'
                    : penaltiesOnly
                      ? 'Lưu vi phạm'
                      : 'Lưu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
