export default function ScheduleEmptyCell({ onAdd }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full min-h-[88px] border-2 border-dashed border-outline-variant/25 rounded-xl flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary/35 hover:bg-surface-container-low/80 hover:text-primary transition-all"
    >
      <span className="material-symbols-outlined text-[22px] opacity-70">add</span>
      <span className="text-[10px] font-bold uppercase tracking-wide">Phân công</span>
    </button>
  )
}
