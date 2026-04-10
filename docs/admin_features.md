# Danh sách Chức năng Dành cho Admin (Ban Giám Hiệu / Quản trị viên)

Dựa trên nghiệp vụ hệ thống Sao Đỏ (trường THCS, THPT), dưới đây là toàn bộ chức năng dành cho role `ADMIN`.

FE kết nối trực tiếp **Firebase** (Auth, Firestore/Realtime DB) và **Cloudinary** (lưu trữ hình ảnh).

---

## 1. Xác thực & Quản lý Tài khoản (Authentication & Account)

*Admin đăng nhập qua Firebase Authentication. Tài khoản Admin được khởi tạo thủ công từ Firebase Console hoặc script.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Đăng nhập | Đăng nhập bằng email/password qua Firebase Auth | Chuyển hướng về Dashboard sau khi thành công |
| Đăng xuất | Huỷ session Firebase, xoá token local | Redirect về trang Login |
| Quên mật khẩu | Gửi email reset password qua Firebase Auth | Dùng built-in của Firebase |
| Đổi mật khẩu | Admin tự đổi mật khẩu của mình | Xác thực mật khẩu cũ trước khi cho đổi |

---

## 2. Quản lý Người dùng (Users Management)

*Admin tạo và quản lý tài khoản cho Giáo viên và Sao Đỏ. Dữ liệu lưu trên Firestore, Auth tạo qua Firebase Admin SDK hoặc Cloud Function.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem danh sách người dùng | Danh sách tất cả tài khoản, lọc theo `role` (TEACHER / RED_STAR), tìm kiếm theo tên | Phân trang phía client |
| Xem chi tiết người dùng | Xem đầy đủ thông tin: họ tên, SĐT, email, vai trò, trạng thái, ngày tạo | - |
| Tạo tài khoản mới | Tạo tài khoản cho Giáo viên hoặc thành viên Sao Đỏ (nhập: họ tên, email, SĐT, role, mật khẩu tạm) | Firebase tạo user, ghi thêm document vào Firestore |
| Chỉnh sửa thông tin | Cập nhật họ tên, SĐT, ảnh đại diện (upload Cloudinary). Không cho thay email | - |
| Khoá / Mở khoá tài khoản | Toggle trạng thái `isActive`. Tài khoản bị khoá không thể đăng nhập | Cập nhật field `disabled` trên Firebase Auth qua Cloud Function |
| Đặt lại mật khẩu | Admin gửi email reset password cho người dùng bất kỳ | Dùng Firebase `sendPasswordResetEmail` |
| Xoá tài khoản | Xoá tài khoản người dùng (soft-delete: đánh dấu `isDeleted=true`) | Không xoá khỏi Firestore, chỉ ẩn khỏi danh sách |

---

## 3. Quản lý Cơ cấu Tổ chức (Organization Structure)

*Thiết lập cấu trúc trường học: khối, lớp, danh sách học sinh. Là nền tảng cho toàn bộ nghiệp vụ thi đua.*

### 3.1 Quản lý Lớp học

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem danh sách lớp | Danh sách lớp toàn trường, lọc theo khối (6, 7, 8... hoặc 10, 11, 12), tìm kiếm theo tên lớp | - |
| Tạo lớp mới | Nhập: tên lớp, khối, năm học, giáo viên chủ nhiệm (chọn từ danh sách GV) | Validate: mỗi GV chỉ chủ nhiệm 1 lớp trong cùng năm học |
| Chỉnh sửa lớp | Cập nhật tên, khối, đổi giáo viên chủ nhiệm | - |
| Xoá / Vô hiệu lớp | Đánh dấu `isActive=false`. Lớp bị vô hiệu không xuất hiện trong các form ghi điểm | Không xoá dữ liệu lịch sử |
| Xem chi tiết lớp | Xem thông tin lớp + danh sách học sinh + GVCN + điểm thi đua hiện tại | - |

### 3.2 Quản lý Học sinh

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem danh sách học sinh | Lọc theo lớp, tìm kiếm theo họ tên hoặc mã học sinh | - |
| Thêm học sinh | Nhập: họ tên, mã học sinh, giới tính, ngày sinh, lớp thuộc về | - |
| Chỉnh sửa học sinh | Cập nhật thông tin cá nhân, chuyển lớp | - |
| Nhập học sinh hàng loạt | Import danh sách từ file CSV/Excel | Parse file phía FE, ghi batch vào Firestore |
| Xoá học sinh | Soft-delete học sinh (ẩn khỏi danh sách nhưng giữ lịch sử ghi điểm) | - |

---

## 4. Quản lý Hạng mục Thi đua (Score Categories)

*Admin định nghĩa toàn bộ tiêu chí cộng/trừ điểm. Đây là bộ dữ liệu dùng chung cho cả Giáo viên và Sao Đỏ khi ghi nhận.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem danh sách hạng mục | Danh sách tiêu chí thi đua, lọc theo loại (`PLUS` / `MINUS`), trạng thái (`isActive`) | - |
| Tạo hạng mục mới | Nhập: tên hạng mục, mô tả, loại (`PLUS` cộng / `MINUS` trừ), số điểm, icon (upload Cloudinary) | Số điểm luôn nhập dương, hệ thống tự xác định +/- theo loại |
| Chỉnh sửa hạng mục | Cập nhật tên, mô tả, số điểm, icon | Không cho thay đổi loại (`PLUS`/`MINUS`) sau khi đã có bản ghi điểm dùng hạng mục này |
| Kích hoạt / Vô hiệu | Toggle `isActive`. Hạng mục bị vô hiệu sẽ ẩn khỏi form ghi điểm | Không ảnh hưởng bản ghi lịch sử |
| Xoá hạng mục | Soft-delete nếu chưa có bản ghi nào dùng đến | Hiện cảnh báo nếu đã có dữ liệu liên quan |

**Phân quyền ghi (thực tế ứng dụng):** tài khoản **Đội Sao Đỏ** (`RED_STAR`) tại cổng `/sao-do/tac-phong` chỉ chọn hạng mục **trừ điểm (vi phạm)**; ghi **khen / cộng điểm** dành cho giáo viên và quản trị. Firestore rules từ chối tạo bản ghi nếu Sao Đỏ gửi `type != penalty`.

---

## 5. Quản lý Sao Đỏ (Red Star Members)

*Admin chọn học sinh vào đội Sao Đỏ và phân công lịch trực.*

### 5.1 Quản lý Thành viên Sao Đỏ

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem danh sách Sao Đỏ | Danh sách học sinh đang là thành viên Sao Đỏ, lọc theo khối/lớp | Hiển thị kèm tài khoản đã liên kết |
| Thêm thành viên Sao Đỏ | Chọn học sinh từ danh sách → tạo tài khoản login (hoặc liên kết tài khoản đã có) | 1 học sinh chỉ là Sao Đỏ 1 lần trong cùng năm học |
| Chỉnh sửa thông tin | Cập nhật ghi chú, nhiệm kỳ | - |
| Thu hồi thành viên | Đánh dấu `isActive=false` → tước quyền ghi nhận điểm | Lịch trực cũ tự động hủy |

### 5.2 Quản lý Lịch trực

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem lịch trực | Xem lịch theo dạng tuần/ngày, lọc theo thành viên Sao Đỏ | Hiển thị dạng calendar |
| Tạo lịch trực | Phân công: chọn thành viên Sao Đỏ, chọn ngày, chọn ca (sáng/trưa/chiều), khu vực phụ trách | Có thể gán nhiều Sao Đỏ cho cùng 1 ca |
| Chỉnh sửa lịch trực | Cập nhật ca, khu vực, ngày | Chỉ cho phép chỉnh sửa lịch chưa diễn ra |
| Xoá lịch trực | Hủy phân công (chỉ được xoá ca chưa diễn ra) | - |
| Sao chép lịch | Copy lịch trực của tuần này sang tuần tiếp theo | Tiết kiệm thao tác lặp lại hàng tuần |

---

## 6. Quản lý Thời khoá biểu (Timetable)

*Thiết lập thời khóa biểu để giáo viên có thể ghi điểm đúng tiết học của mình.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem thời khóa biểu | Xem theo lớp, theo giáo viên, theo tuần | - |
| Tạo tiết học | Nhập: lớp, giáo viên bộ môn, môn học, thứ, tiết (1-10), tuần áp dụng | - |
| Chỉnh sửa tiết học | Cập nhật giáo viên, môn học, thứ, tiết | - |
| Xoá tiết học | Xoá tiết học khỏi lịch | Cảnh báo nếu đã có bản ghi điểm trong tiết này |
| Nhập thời khóa biểu hàng loạt | Import từ file CSV/Excel | Parse phía FE, ghi batch vào Firestore |

---

## 7. Quản lý Chu kỳ Thi đua (Competition Cycles)

*Mỗi chu kỳ là một đơn vị tính điểm tổng hợp (tuần / tháng / học kỳ). Admin kiểm soát vòng đời của từng chu kỳ.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem danh sách chu kỳ | Lịch sử các chu kỳ đã có, lọc theo trạng thái (`ACTIVE`, `CLOSED`) | - |
| Tạo chu kỳ mới | Nhập: tên chu kỳ, loại (WEEKLY/MONTHLY/SEMESTER), ngày bắt đầu, ngày kết thúc, điểm khởi đầu mặc định | Validate: không được trùng thời gian với chu kỳ đang `ACTIVE` |
| Kết thúc chu kỳ | Đóng chu kỳ → hệ thống chốt điểm, xếp hạng, hiển thị kết quả cuối kỳ | Sau khi đóng không thể thêm bản ghi mới vào chu kỳ này |
| Xem kết quả chu kỳ | Bảng xếp hạng cuối chu kỳ theo lớp, lọc theo khối | Dữ liệu chỉ đọc sau khi đóng |
| Xoá chu kỳ | Chỉ cho phép xoá chu kỳ chưa có bản ghi điểm nào | Cảnh báo mạnh trước khi xác nhận |

---

## 8. Giám sát Bản ghi Điểm (Score Records Oversight)

*Admin có toàn quyền xem và can thiệp vào bất kỳ bản ghi điểm nào trong hệ thống.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem tất cả bản ghi | Danh sách toàn bộ bản ghi điểm, lọc theo: lớp, hạng mục, người ghi, loại (+/-), khoảng thời gian, chu kỳ | Phân trang phía client |
| Xem chi tiết bản ghi | Xem đầy đủ: ai ghi, thời điểm, lớp, học sinh (nếu có), hạng mục, ghi chú, ảnh đính kèm | - |
| Chỉnh sửa bản ghi | Admin có thể sửa ghi chú, hạng mục, số điểm của bất kỳ bản ghi nào | Lưu lại log: `editedBy`, `editedAt`, `originalValue` |
| Xoá bản ghi | Xoá bản ghi sai (soft-delete). Điểm lớp được tự động cập nhật lại | Lưu log xoá để audit |
| Xử lý yêu cầu chỉnh sửa | Xem danh sách flag từ GVCN, duyệt hoặc từ chối yêu cầu sửa bản ghi | Gửi thông báo lại cho GVCN sau khi xử lý |

---

## 9. Báo cáo & Thống kê (Reports & Analytics)

*Cung cấp cái nhìn tổng quan về tình hình thi đua toàn trường theo thời gian thực và lịch sử.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Bảng xếp hạng thi đua | Xếp hạng các lớp theo điểm tổng trong chu kỳ đang chọn, lọc theo khối | Cập nhật realtime qua Firestore listener |
| Thống kê vi phạm | Top hạng mục trừ điểm phổ biến nhất, lớp có nhiều vi phạm nhất | Biểu đồ cột/tròn |
| Thống kê thành tích | Top hạng mục cộng điểm, lớp xuất sắc nhất | Biểu đồ cột/tròn |
| Báo cáo theo lớp | Xem chi tiết lịch sử điểm của 1 lớp cụ thể theo chu kỳ | Bao gồm cả nguồn ghi (GV/Sao Đỏ) |
| Báo cáo theo Sao Đỏ | Thống kê số lượng bản ghi của từng thành viên Sao Đỏ trong chu kỳ | Đánh giá mức độ hoạt động |
| Xuất báo cáo | Xuất bảng xếp hạng / lịch sử điểm ra file Excel hoặc PDF | Xử lý phía FE (SheetJS / jsPDF) |

---

## 10. Cài đặt Hệ thống (System Settings)

*Cấu hình thông tin chung của trường và các thông số vận hành hệ thống.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Thông tin trường | Cập nhật: tên trường, logo (upload Cloudinary), địa chỉ, năm học hiện tại | Logo hiển thị trên báo cáo xuất ra |
| Cấu hình ca trực | Định nghĩa các ca trực mặc định (tên ca, giờ bắt đầu, giờ kết thúc) | VD: Ca sáng 6:45–7:15, Ca nghỉ giữa giờ 9:30–9:45 |
| Cấu hình tiết học | Số tiết/ngày, giờ bắt đầu từng tiết | Dùng để validate thời gian ghi điểm của GV |
| Cấu hình năm học | Thiết lập ngày bắt đầu/kết thúc học kỳ I, II | Ảnh hưởng đến chu kỳ thi đua loại SEMESTER |

---

## Mở rộng sau:

- **Dashboard realtime:** Biểu đồ điểm thi đua cập nhật trực tiếp qua Firestore listener, hiển thị top 3 lớp xuất sắc và top vi phạm trong ngày.
- **Thông báo đẩy (FCM):** Gửi thông báo qua Firebase Cloud Messaging khi có kết quả chu kỳ mới hoặc cảnh báo điểm thấp.
- **Bảng vinh danh:** Màn hình công khai (không cần đăng nhập) hiển thị bảng xếp hạng lớp xuất sắc theo tuần.
- **Tích hợp học bạ điện tử:** Sync điểm rèn luyện từ hệ thống sang học bạ kỹ thuật số.
