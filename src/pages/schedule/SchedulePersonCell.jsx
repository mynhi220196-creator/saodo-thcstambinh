import AvatarDisplay from '../../components/AvatarDisplay.jsx'

export default function SchedulePersonCell({ name, avatarUrl, onEdit }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full bg-gradient-to-b from-red-50/80 to-primary/5 dark:from-red-950/20 dark:to-primary/10 p-2 rounded-xl border border-red-100/80 dark:border-red-900/30 flex flex-col items-center gap-1.5 group text-left hover:border-primary/40 hover:shadow-sm transition-all min-h-[88px] justify-center"
    >
      <AvatarDisplay
        src={avatarUrl}
        alt=""
        className="w-9 h-9 shadow-sm ring-2 ring-white dark:ring-slate-800"
        iconClassName="text-lg"
      />
      <span className="text-[11px] font-bold text-center leading-tight text-on-surface line-clamp-2 px-0.5">{name}</span>
      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-primary flex items-center gap-0.5">
        <span className="material-symbols-outlined text-[14px]">edit</span>
        Sửa
      </span>
    </button>
  )
}
