export default function UserFabActions({ onCreate, onExport }) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
      <button
        type="button"
        onClick={onExport}
        className="w-14 h-14 bg-white text-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-outline-variant/10 group"
        aria-label="Xuất danh sách CSV"
      >
        <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">
          download
        </span>
      </button>
      <button
        type="button"
        onClick={onCreate}
        className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
        aria-label="Tạo người dùng mới"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">
          person_add
        </span>
      </button>
    </div>
  )
}
