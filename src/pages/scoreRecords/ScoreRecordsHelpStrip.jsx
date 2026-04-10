import { Link } from 'react-router-dom'

export default function ScoreRecordsHelpStrip() {
  return (
    <div className="mt-8 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="material-symbols-outlined text-primary text-3xl shrink-0">tips_and_updates</span>
          <div>
            <h3 className="font-headline font-bold text-primary">Quy trình gợi ý</h3>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              Sao Đỏ ghi nhận tại hiện trường → bản ghi ở trạng thái <strong className="text-on-surface">Chờ duyệt</strong>{' '}
              → GVCN hoặc BGH xác nhận. Tiêu chí áp dụng được cấu hình tại{' '}
              <Link to="/admin/conduct-criteria" className="font-bold text-primary hover:underline">
                Hạng mục thi đua
              </Link>
              .
            </p>
          </div>
        </div>
        <Link
          to="/admin/classes"
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-outline-variant/25 text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined">class</span>
          Xem lớp học
        </Link>
      </div>
    </div>
  )
}
