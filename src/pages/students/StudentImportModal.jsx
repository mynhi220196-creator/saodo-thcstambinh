import { useEffect, useId, useState } from 'react'
import { parseStudentImportFile } from '../../lib/studentImportExcel.js'

const TEMPLATE_HREF = '/mau-nhap-hoc-sinh.xlsx'

export default function StudentImportModal({ open, onClose, onImport, classOptions }) {
  const titleId = useId()
  const [class_id, setClassId] = useState('')
  const [file, setFile] = useState(null)
  const [parsedRows, setParsedRows] = useState([])
  const [parseWarnings, setParseWarnings] = useState([])
  const [parseError, setParseError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setClassId(classOptions[0]?.id ?? '')
    setFile(null)
    setParsedRows([])
    setParseWarnings([])
    setParseError('')
    setError('')
  }, [open, classOptions])

  async function handleFileChange(e) {
    const f = e.target.files?.[0]
    setFile(f ?? null)
    setParsedRows([])
    setParseWarnings([])
    setParseError('')
    setError('')
    if (!f) return
    const lower = f.name.toLowerCase()
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      setParseError('Chỉ chấp nhận file .xlsx hoặc .xls')
      return
    }
    try {
      const { rows, warnings } = await parseStudentImportFile(f)
      setParsedRows(rows)
      setParseWarnings(warnings)
      if (rows.length === 0) {
        setParseError(warnings[0] ?? 'Không đọc được dòng hợp lệ.')
      }
    } catch (err) {
      setParseError(err?.message ?? 'Không đọc được file Excel.')
    }
  }

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (!class_id) {
      setError('Chọn lớp đích.')
      return
    }
    if (parsedRows.length === 0) {
      setError('Chọn file Excel có ít nhất một dòng hợp lệ (mã_hs + họ_tên).')
      return
    }
    setBusy(true)
    setError('')
    try {
      const n = await onImport(class_id, parsedRows)
      window.alert(`Đã nhập ${n} học sinh.`)
      onClose()
    } catch (err) {
      setError(err?.message ?? 'Import thất bại.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-outline-variant/25 bg-surface-container-lowest px-3.5 py-2.5 text-xs font-mono'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-xl rounded-2xl bg-surface-container-lowest border border-outline-variant/15 shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 id={titleId} className="font-headline text-xl font-extrabold text-primary">
          Import từ Excel
        </h2>
        <p className="text-sm text-on-surface-variant mt-2">
          Sheet đầu tiên; dòng 1 là tiêu đề:{' '}
          <code className="font-mono text-[11px]">mã_hs</code>, <code className="font-mono text-[11px]">họ_tên</code>,{' '}
          <code className="font-mono text-[11px]">giới_tính</code>, <code className="font-mono text-[11px]">ngày_sinh</code>,{' '}
          <code className="font-mono text-[11px]">sdt_phụ_huynh</code> (cột cuối tuỳ chọn). Giới tính: Nam/Nữ.{' '}
          <span className="font-semibold text-on-surface">Ngày sinh</span> (giống file mẫu):{' '}
          <strong>dd/mm/yyyy</strong> hoặc <strong>yyyy-mm-dd</strong>, hoặc ô kiểu <strong>Ngày</strong> trong Excel (không nhập nhầm
          tháng/ngày kiểu Mỹ).
        </p>
        <p className="text-sm mt-2">
          <a
            href={TEMPLATE_HREF}
            download
            className="font-bold text-primary underline underline-offset-2 hover:opacity-90"
          >
            Tải file mẫu (.xlsx)
          </a>
        </p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {error ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{error}</p> : null}
          {parseError ? <p className="text-sm font-semibold text-error bg-error-container/30 rounded-lg px-3 py-2">{parseError}</p> : null}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Lớp đích *</label>
            <select
              className="w-full rounded-xl border border-outline-variant/25 px-3.5 py-2.5 text-sm"
              value={class_id}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">— Chọn —</option>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant mb-1">Chọn file Excel *</label>
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className={`${inputClass} text-sm file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary`}
              onChange={handleFileChange}
            />
            {file ? (
              <p className="text-xs text-on-surface-variant mt-1.5">
                Đã chọn: <span className="font-mono font-semibold text-on-surface">{file.name}</span>
                {parsedRows.length > 0 ? (
                  <span className="block mt-1 text-emerald-800 dark:text-emerald-200 font-bold">
                    {parsedRows.length} học sinh sẽ được nhập
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
          {parseWarnings.length > 0 ? (
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-950 dark:text-amber-100 max-h-28 overflow-y-auto">
              <p className="font-bold mb-1">Ghi chú</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {parseWarnings.slice(0, 12).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              {parseWarnings.length > 12 ? <p className="mt-1 opacity-80">… và {parseWarnings.length - 12} dòng khác</p> : null}
            </div>
          ) : null}
          {parsedRows.length > 0 ? (
            <div className="rounded-xl border border-outline-variant/15 overflow-hidden">
              <p className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant px-3 py-2 bg-surface-container-high/80">
                Xem trước (tối đa 8 dòng)
              </p>
              <div className="overflow-x-auto max-h-40 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-on-surface-variant border-b border-outline-variant/10">
                      <th className="px-2 py-1.5 font-bold">Mã</th>
                      <th className="px-2 py-1.5 font-bold">Họ tên</th>
                      <th className="px-2 py-1.5 font-bold">Giới tính</th>
                      <th className="px-2 py-1.5 font-bold">Ngày sinh</th>
                      <th className="px-2 py-1.5 font-bold">SĐT PH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 8).map((r, i) => (
                      <tr key={i} className="border-b border-outline-variant/5">
                        <td className="px-2 py-1.5 font-mono">{r.student_code}</td>
                        <td className="px-2 py-1.5">{r.full_name}</td>
                        <td className="px-2 py-1.5">{r.gender}</td>
                        <td className="px-2 py-1.5 font-mono">{r.date_of_birth ? r.date_of_birth.split('-').reverse().join('/') : '—'}</td>
                        <td className="px-2 py-1.5 font-mono">{r.guardian_phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold border border-outline-variant/30">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={busy || parsedRows.length === 0}
              className="flex-1 py-2.5 rounded-xl font-bold text-on-primary bg-gradient-to-r from-primary to-primary-container disabled:opacity-60"
            >
              {busy ? 'Đang ghi…' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
