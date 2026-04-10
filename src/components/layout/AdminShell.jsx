import AdminTopBar from './AdminTopBar.jsx'
import SidebarNav from './SidebarNav.jsx'

export default function AdminShell({ activeKey, headerTitle, searchPlaceholder, children, contentClassName }) {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <SidebarNav activeKey={activeKey} />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface">
          <AdminTopBar title={headerTitle} searchPlaceholder={searchPlaceholder} />
          <div className={`flex-1 min-w-0 overflow-y-auto ${contentClassName ?? 'p-8'}`}>{children}</div>
        </main>
      </div>
    </div>
  )
}
