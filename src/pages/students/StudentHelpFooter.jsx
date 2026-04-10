export default function StudentHelpFooter() {
  return (
    <div className="mt-10 p-6 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border border-primary/5">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <span className="material-symbols-outlined text-primary text-2xl">info</span>
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-primary">Cần hỗ trợ nhập / đồng bộ danh sách?</h4>
          <p className="text-sm text-on-surface-variant">
            Tải file mẫu cột tiêu đề chuẩn; cột ngày sinh dùng định dạng <strong>dd/mm/yyyy</strong> (hoặc yyyy-mm-dd / ô Ngày Excel).
            Import: chọn lớp đích rồi chọn .xlsx. Liên hệ phòng IT nếu cần kết nối SIS.
          </p>
        </div>
      </div>
      <a
        href="/mau-nhap-hoc-sinh.xlsx"
        download
        className="px-5 py-2.5 text-sm font-bold text-primary bg-white rounded-xl shadow-sm hover:shadow-md transition-all shrink-0 self-start sm:self-center text-center"
      >
        File mẫu Excel
      </a>
    </div>
  )
}
