import AdminShell from '../../components/layout/AdminShell.jsx'
import AccountPasswordSection from '../../components/account/AccountPasswordSection.jsx'

export default function AdminAccountPage() {
  return (
    <AdminShell activeKey="cai-dat" headerTitle="Tài khoản · Đổi mật khẩu" searchPlaceholder="—">
      <div className="max-w-lg">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
          <span>Hệ thống</span>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary">Tài khoản</span>
        </div>
        <h2 className="editorial-title text-3xl font-extrabold text-primary mb-2">Đổi mật khẩu</h2>
        <p className="text-on-surface-variant text-sm mb-8">
          Xác thực mật khẩu hiện tại trước khi đặt mật khẩu mới (theo quy trình nội bộ).
        </p>
        <AccountPasswordSection />
      </div>
    </AdminShell>
  )
}
