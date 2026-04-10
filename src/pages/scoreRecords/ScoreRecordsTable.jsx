import ScoreRecordTableRow from './ScoreRecordTableRow.jsx'

const COLUMNS = [
  { key: 'id', label: 'Mã / Thời gian' },
  { key: 'student', label: 'Học sinh' },
  { key: 'rule', label: 'Tiêu chí' },
  { key: 'points', label: 'Điểm', align: 'center' },
  { key: 'recorder', label: 'Người ghi' },
  { key: 'note', label: 'Ghi chú' },
  { key: 'images', label: 'Ảnh' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'actions', label: 'Thao tác', align: 'right' },
]

export default function ScoreRecordsTable({
  records,
  onApprove,
  onReject,
  onFlag,
  onClearAdminFlag,
  onDeleteRecord,
  onOpenConductImages,
  actionsDisabled = false,
}) {
  if (records.length === 0) {
    return (
      <div className="px-6 py-16 text-center text-on-surface-variant">
        <span className="material-symbols-outlined text-4xl text-outline-variant mb-2 block">search_off</span>
        <p className="font-medium text-on-surface">Không có bản ghi phù hợp</p>
        <p className="text-sm mt-1 max-w-md mx-auto">
          Thử đổi khoảng thời gian, lớp hoặc từ khóa tìm kiếm.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1220px]">
        <thead>
          <tr className="bg-surface-container-low/40">
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-4 text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider ${
                  col.align === 'center' ? 'text-center' : ''
                } ${col.align === 'right' ? 'text-right' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10">
          {records.map((record) => (
            <ScoreRecordTableRow
              key={record.rowKey ?? record.id}
              record={record}
              onApprove={onApprove}
              onReject={onReject}
              onFlag={onFlag}
              onClearAdminFlag={onClearAdminFlag}
              onDeleteRecord={onDeleteRecord}
              onOpenConductImages={onOpenConductImages}
              actionsDisabled={actionsDisabled}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
