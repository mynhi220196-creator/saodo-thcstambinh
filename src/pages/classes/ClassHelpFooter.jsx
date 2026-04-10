export default function ClassHelpFooter() {
  return (
    <div className="mt-10 p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-primary/5">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-primary">Cấu trúc lớp &amp; niên khóa</h4>
          <p className="text-sm text-on-surface-variant">
            Mỗi lớp gắn với một năm học; đổi năm trong bộ lọc để xem lịch sử hoặc lớp đang hoạt động.
          </p>
        </div>
      </div>
      <button
        type="button"
        className="px-5 py-2.5 text-sm font-bold text-primary bg-white rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 self-start sm:self-center"
      >
        Hướng dẫn phân lớp
      </button>
    </div>
  )
}
