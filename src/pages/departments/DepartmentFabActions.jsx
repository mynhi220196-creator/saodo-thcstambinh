export default function DepartmentFabActions({ onAddTeam }) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
      <button
        type="button"
        className="w-14 h-14 bg-white text-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-outline-variant/10 group"
        aria-label="In sơ đồ tổ"
      >
        <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">print</span>
      </button>
      <button
        type="button"
        onClick={onAddTeam}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
        aria-label="Thêm tổ"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  )
}
