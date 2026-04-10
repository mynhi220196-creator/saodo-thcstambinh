export default function StudentFabActions({ onAdd, onImport }) {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
      <button
        type="button"
        onClick={onImport}
        className="w-14 h-14 bg-white text-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform border border-outline-variant/10 group"
        aria-label="Import Excel"
      >
        <span className="material-symbols-outlined group-hover:translate-y-0.5 transition-transform">upload_file</span>
      </button>
      <button
        type="button"
        onClick={onAdd}
        className="w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform group"
        aria-label="Thêm học sinh"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </button>
    </div>
  )
}
