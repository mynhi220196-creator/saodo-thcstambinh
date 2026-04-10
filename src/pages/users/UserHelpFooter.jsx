import { Link } from 'react-router-dom'

export default function UserHelpFooter() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0">shield_lock</span>
          <div>
            <h3 className="font-headline font-bold text-primary">Phân quyền</h3>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              Giáo viên đồng bộ từ hồ sơ tổ chuyên môn; Sao Đỏ có quyền ghi nhận tác phong theo khối được giao.
              Quản trị viên toàn quyền cấu hình hệ thống.
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-2xl shrink-0">link</span>
          <div>
            <h3 className="font-headline font-bold text-primary">Liên kết nhanh</h3>
            <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
              <Link to="/admin/teachers" className="font-bold text-primary hover:underline">
                Quản lý giáo viên
              </Link>
              {' · '}
              <Link to="/admin/sao-do/members" className="font-bold text-primary hover:underline">
                Thành viên Sao Đỏ
              </Link>
              {' · '}
              <Link to="/admin/score-records" className="font-bold text-primary hover:underline">
                Bản ghi điểm
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
