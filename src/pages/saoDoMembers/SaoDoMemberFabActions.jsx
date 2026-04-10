import { Link } from 'react-router-dom'

export default function SaoDoMemberFabActions() {
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-30">
      <Link
        to="/admin/users"
        className="w-14 h-14 bg-gradient-to-br from-red-600 to-primary text-white rounded-full shadow-lg shadow-red-600/25 flex items-center justify-center hover:scale-110 transition-transform group"
        aria-label="Thêm tài khoản Sao Đỏ"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">add</span>
      </Link>
    </div>
  )
}
