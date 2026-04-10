import TeacherShell from '../../components/layout/TeacherShell.jsx'
import AccountPasswordSection from '../../components/account/AccountPasswordSection.jsx'

export default function TeacherAccountPage() {
  return (
    <TeacherShell activeKey="tai-khoan" headerTitle="Tài khoản" searchPlaceholder="—">
      <div className="max-w-lg">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Cổng Giáo viên</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-[#0d5c3f] dark:text-emerald-300">Tài khoản</span>
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-[#0d5c3f] dark:text-emerald-100 mb-2">Đổi mật khẩu</h2>
        <p className="text-on-surface-variant text-sm mb-8">
          Xác thực mật khẩu hiện tại trước khi đặt mật khẩu mới.
        </p>
        <AccountPasswordSection />
      </div>
    </TeacherShell>
  )
}
