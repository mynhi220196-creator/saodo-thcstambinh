export default function ConductRuleTableRow({ rule, onToggleEnabled, onEdit, onDelete }) {
  const isReward = rule.type === 'reward'

  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="px-6 py-5 text-sm font-medium text-primary whitespace-nowrap">{rule.code}</td>
      <td className="px-6 py-5">
        <span className="text-sm font-semibold text-on-surface">{rule.name}</span>
      </td>
      <td className="px-6 py-5">
        <span className="text-xs px-3 py-1 bg-surface-container-high text-on-surface-variant rounded-full font-medium">
          {rule.category}
        </span>
      </td>
      <td className="px-6 py-5 text-center">
        {isReward ? (
          <span className="px-3 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded-full">
            THƯỞNG (+)
          </span>
        ) : (
          <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded-full">
            PHẠT (-)
          </span>
        )}
      </td>
      <td className="px-6 py-5 text-center">
        <span
          className={`text-sm font-headline font-bold tabular-nums ${isReward ? 'text-primary' : 'text-error'}`}
        >
          {rule.points > 0 ? `+${rule.points}` : rule.points}
        </span>
      </td>
      <td className="px-6 py-5 max-w-[14rem] lg:max-w-xs">
        <p className="text-xs text-on-surface-variant truncate" title={rule.description}>
          {rule.description}
        </p>
      </td>
      <td className="px-6 py-5 text-center">
        <button
          type="button"
          role="switch"
          aria-checked={rule.enabled}
          onClick={() => onToggleEnabled(rule.id, !rule.enabled)}
          className={`inline-flex items-center h-6 w-11 shrink-0 rounded-full relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            rule.enabled ? 'bg-primary-container' : 'bg-outline-variant/30'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
              rule.enabled ? 'left-[22px]' : 'left-1'
            }`}
          />
        </button>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(rule)}
            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-fixed rounded-lg"
            title="Sửa"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(rule)}
            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg"
            title="Xóa"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  )
}
