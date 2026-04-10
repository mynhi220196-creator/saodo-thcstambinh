export default function ScheduleLegend() {
  return (
    <div className="bg-gradient-to-br from-red-50/60 to-primary/5 dark:from-red-950/25 dark:to-primary/10 p-5 rounded-2xl border border-red-100/60 dark:border-red-900/30">
      <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">info</span>
        Chú giải
      </h4>
      <ul className="space-y-2.5 text-[11px] font-medium text-on-surface-variant">
        <li className="flex items-start gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1 shrink-0 shadow-sm" />
          <span>Cột &quot;Hôm nay&quot; theo ngày máy; dữ liệu đồng bộ Firestore giữa các admin.</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0 shadow-sm" />
          <span>Ô có ảnh = đã gán đội viên cho ca đang chọn (sáng / chiều / ra chơi).</span>
        </li>
        <li className="flex items-start gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-outline-variant mt-1 shrink-0" />
          <span>Ô nét đứt = trống — bấm để chọn Sao Đỏ từ danh sách profile.</span>
        </li>
      </ul>
    </div>
  )
}
