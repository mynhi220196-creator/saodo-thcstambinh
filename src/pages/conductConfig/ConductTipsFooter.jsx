export default function ConductTipsFooter() {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-primary-container/20 to-secondary-container/20 p-6 rounded-xl border border-primary-container/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm shrink-0">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              lightbulb
            </span>
          </div>
          <div className="min-w-0">
            <h4 className="font-headline font-bold text-primary mb-1">Mẹo quản lý</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Mỗi hạng mục là một tài liệu Firestore (mã = ID). Thưởng cần điểm dương, phạt cần điểm âm. Có thể xuất CSV theo
              bộ lọc để kiểm tra hoặc sao lưu nhanh.
            </p>
          </div>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col justify-center items-center text-center">
        <span className="material-symbols-outlined text-3xl text-secondary mb-2">support_agent</span>
        <h4 className="font-headline font-bold text-on-surface">Cần hỗ trợ?</h4>
        <p className="text-xs text-on-surface-variant mb-4">Liên hệ IT để được hướng dẫn cấu hình hệ thống.</p>
        <button type="button" className="text-xs font-bold text-primary hover:underline underline-offset-4">
          Xem tài liệu hướng dẫn
        </button>
      </div>
    </div>
  )
}
