import SaoDoShell from '../../components/layout/SaoDoShell.jsx'
import AccountPasswordSection from '../../components/account/AccountPasswordSection.jsx'

export default function SaoDoAccountPage() {
  return (
    <SaoDoShell activeKey="tai-khoan" headerTitle="Tài khoản" searchPlaceholder="—">
      <div className="max-w-lg">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Đội Sao Đỏ</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-red-800 dark:text-red-300">Tài khoản</span>
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-red-900 dark:text-red-100 mb-2">Đổi mật khẩu</h2>
        <p className="text-on-surface-variant text-sm mb-8">
          Xác thực mật khẩu hiện tại trước khi đặt mật khẩu mới.
        </p>
        <AccountPasswordSection />
      </div>
    </SaoDoShell>
  )
}
