import { ConductRecordImageStrip } from '../../components/ConductImageLightbox.jsx'
import { formatDateTimeVN } from '../../lib/dateFormat.js'
import { sourceLabel } from './scoreRecordMockData.js'

const STATUS = {
  pending: {
    label: 'Chờ duyệt',
    className: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100',
  },
  approved: {
    label: 'Đã duyệt',
    className: 'bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-100',
  },
  rejected: {
    label: 'Từ chối',
    className: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
  },
  flagged: {
    label: 'Xử lý nghiêm',
    className: 'bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-100',
  },
}

const formatWhen = formatDateTimeVN

export default function ScoreRecordTableRow({
  record,
  onApprove,
  onReject,
  onFlag,
  onClearAdminFlag,
  onDeleteRecord,
  onOpenConductImages,
  actionsDisabled = false,
}) {
  const st = STATUS[record.status] ?? STATUS.pending
  const isReward = record.type === 'reward'
  const actionId = record.rowKey ?? record.id

  return (
    <tr className="hover:bg-surface-container-low/40 transition-colors align-top">
      <td className="px-5 py-4 whitespace-nowrap">
        <span className="font-mono text-xs font-bold text-primary">{record.id}</span>
        <p className="text-[11px] text-on-surface-variant mt-1 tabular-nums">{formatWhen(record.at)}</p>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-on-surface">{record.studentName}</p>
        <p className="text-xs text-on-surface-variant font-mono mt-0.5">{record.studentCode}</p>
        <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-primary-fixed/50 text-on-primary-fixed text-[11px] font-bold">
          {record.classCode}
        </span>
      </td>
      <td className="px-5 py-4 min-w-[200px]">
        <p className="text-sm font-medium text-on-surface leading-snug">{record.ruleName}</p>
        <p className="text-[11px] text-on-surface-variant font-mono mt-1">
          {record.ruleCode} · {record.category}
        </p>
      </td>
      <td className="px-5 py-4 text-center">
        <span
          className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-lg text-sm font-extrabold tabular-nums ${
            isReward
              ? 'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200'
          }`}
        >
          {isReward ? '+' : ''}
          {record.points}
        </span>
      </td>
      <td className="px-5 py-4">
        <p className="text-sm text-on-surface font-medium">{record.recordedBy}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{record.role}</p>
        <p className="text-[11px] text-on-surface-variant mt-1">{sourceLabel(record.source)}</p>
      </td>
      <td className="px-5 py-4 max-w-[220px]">
        <p className="text-sm text-on-surface-variant leading-snug line-clamp-2">{record.note}</p>
        {record.location ? (
          <p className="text-[11px] text-on-surface-variant mt-1 flex items-start gap-1">
            <span className="material-symbols-outlined text-sm shrink-0">place</span>
            <span>{record.location}</span>
          </p>
        ) : null}
      </td>
      <td className="px-5 py-4 align-top">
        <ConductRecordImageStrip
          urls={record.image_urls}
          onOpen={onOpenConductImages ?? (() => {})}
        />
      </td>
      <td className="px-5 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold ${st.className}`}>
          {st.label}
        </span>
        {record.status === 'flagged' && record.adminFlaggedAt ? (
          <p className="text-[10px] text-on-surface-variant mt-1 tabular-nums max-w-[9rem]">
            {formatWhen(record.adminFlaggedAt)}
          </p>
        ) : null}
      </td>
      <td className="px-5 py-4 text-right">
        <div className="inline-flex flex-col sm:flex-row gap-1 justify-end">
          {record.status === 'pending' ? (
            <>
              <button
                type="button"
                disabled={actionsDisabled}
                onClick={() => onApprove(actionId)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
              >
                Duyệt
              </button>
              <button
                type="button"
                disabled={actionsDisabled}
                onClick={() => onReject(actionId)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-50"
              >
                Từ chối
              </button>
            </>
          ) : null}
          {record.status !== 'flagged' ? (
            <button
              type="button"
              disabled={actionsDisabled}
              onClick={() => onFlag(actionId)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-error border border-error/30 hover:bg-error-container/30 disabled:opacity-50"
            >
              Gắn cờ nghiêm
            </button>
          ) : (
            <button
              type="button"
              disabled={actionsDisabled}
              onClick={() => onClearAdminFlag?.(actionId)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-surface-container-high text-on-surface hover:bg-surface-container-highest disabled:opacity-50"
            >
              Gỡ cờ
            </button>
          )}
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => onDeleteRecord?.(actionId)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-error bg-error-container/20 border border-error/25 hover:bg-error-container/40 disabled:opacity-50"
          >
            Xóa bản ghi
          </button>
        </div>
      </td>
    </tr>
  )
}
