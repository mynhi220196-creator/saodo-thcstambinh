export default function ConductStatsCards({ stats }) {
  const { totalRules, rewardCount, penaltyCount, enabledCount, updatedLabel, topPenalty } = stats

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-primary">
        <p className="text-sm font-medium text-on-surface-variant mb-1">Tổng hạng mục</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <h3 className="text-3xl font-headline font-extrabold text-primary tabular-nums">{totalRules}</h3>
          <span className="text-xs font-bold text-primary px-2 py-1 bg-primary-fixed rounded-lg w-fit">{updatedLabel}</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">Firestore · <span className="font-mono">conduct_criteria</span></p>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-secondary">
        <p className="text-sm font-medium text-on-surface-variant mb-1">Điểm thưởng (+)</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <h3 className="text-3xl font-headline font-extrabold text-secondary tabular-nums">{rewardCount}</h3>
          <span className="text-xs font-bold text-secondary-fixed-dim bg-secondary-container/30 px-2 py-1 rounded-lg w-fit">
            Trong hệ thống
          </span>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-error">
        <p className="text-sm font-medium text-on-surface-variant mb-1">Điểm phạt (-)</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <h3 className="text-3xl font-headline font-extrabold text-error tabular-nums">{penaltyCount}</h3>
          <span className="text-xs font-bold text-error bg-error-container px-2 py-1 rounded-lg w-fit">
            Trong hệ thống
          </span>
        </div>
      </div>
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border-l-4 border-tertiary">
        <p className="text-sm font-medium text-on-surface-variant mb-1">Đang bật / Mức phạt cao nhất</p>
        <div className="flex flex-col">
          <h3 className="text-lg font-headline font-bold text-tertiary leading-tight mt-1 tabular-nums">
            {enabledCount} đang áp dụng
          </h3>
          <p className="text-xs text-on-surface-variant mt-2 leading-snug">
            {topPenalty ? (
              <>
                Phạt nặng nhất (điểm âm nhỏ nhất):{' '}
                <span className="font-semibold text-on-surface">{topPenalty.name}</span> ({topPenalty.points} điểm)
              </>
            ) : (
              'Chưa có hạng mục phạt'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
