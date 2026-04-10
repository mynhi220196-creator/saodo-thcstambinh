# Danh sách Chức năng Dành cho Giáo viên (Teacher)

Dựa trên nghiệp vụ hệ thống Sao Đỏ (trường THCS, THPT), dưới đây là toàn bộ chức năng dành cho role `TEACHER` — bao gồm **Giáo viên bộ môn** và **Giáo viên chủ nhiệm**.

FE kết nối trực tiếp **Firebase** (Auth, Firestore/Realtime DB) và **Cloudinary** (lưu trữ hình ảnh bằng chứng nếu có).

> **Phân biệt quyền:**
> - `TEACHER_SUBJECT` — Giáo viên bộ môn: chỉ ghi nhận điểm trong tiết dạy của mình.
> - `TEACHER_HOMEROOM` — Giáo viên chủ nhiệm: xem toàn bộ lịch sử điểm lớp chủ nhiệm, có thể ghi nhận điểm bất kỳ lúc nào, được phép flag bản ghi sai.

---

## 1. Xác thực (Authentication)

*Giáo viên đăng nhập bằng tài khoản do Admin tạo, thông qua Firebase Authentication.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Đăng nhập | Đăng nhập bằng email/password qua Firebase Auth | Chuyển hướng về Dashboard sau khi thành công |
| Đăng xuất | Huỷ session Firebase, xoá token local | Redirect về trang Login |
| Quên mật khẩu | Gửi email reset password qua Firebase Auth | Dùng built-in của Firebase |
| Đổi mật khẩu | Giáo viên tự đổi mật khẩu của mình | Xác thực mật khẩu cũ trước khi cho đổi |

---

## 2. Hồ sơ Cá nhân (My Profile)

*Giáo viên xem và cập nhật thông tin cá nhân của mình.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem hồ sơ | Xem thông tin: họ tên, email, SĐT, ảnh đại diện, vai trò, lớp phụ trách | Không cho xem email của người khác |
| Cập nhật hồ sơ | Chỉnh sửa: họ tên, SĐT, ảnh đại diện (upload lên Cloudinary) | Không được tự thay đổi email hoặc vai trò |

---

## 3. Thời khoá biểu (My Timetable)

*Giáo viên xem lịch dạy của mình — là căn cứ để hệ thống validate quyền ghi nhận điểm của Giáo viên bộ môn.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem thời khóa biểu | Xem lịch dạy theo tuần (thứ, tiết, lớp, môn học) | Lọc được theo tuần cụ thể |
| Xem tiết học hôm nay | Danh sách các tiết đang/sắp diễn ra trong ngày hiện tại | Dùng để truy cập nhanh vào ghi nhận điểm |
| Xem chi tiết tiết học | Thông tin tiết: lớp, môn, thứ, giờ bắt đầu/kết thúc, danh sách học sinh lớp đó | - |

---

## 4. Ghi nhận Điểm Thi đua (Score Recording)

*Chức năng cốt lõi của Giáo viên. Mỗi bản ghi được gắn với tiết học cụ thể (với GV bộ môn) hoặc thời điểm bất kỳ (với GVCN).*

### 4.1 Tạo bản ghi điểm

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Ghi nhận điểm nhanh từ tiết học | Từ màn hình tiết học → chọn hạng mục (+/-) → chọn đối tượng → xác nhận | `TEACHER_SUBJECT` chỉ ghi trong tiết đang dạy theo TKB; `TEACHER_HOMEROOM` không bị giới hạn thời gian |
| Chọn đối tượng ghi nhận | Áp dụng cho **cả lớp** hoặc **từng học sinh** cụ thể | Tìm kiếm học sinh trong danh sách lớp |
| Chọn hạng mục điểm | Chọn từ danh sách hạng mục do Admin cấu hình (lọc `isActive=true`) | Hiển thị rõ loại: 🟢 Cộng điểm / 🔴 Trừ điểm và số điểm tương ứng |
| Thêm ghi chú | Nhập mô tả tình huống (tuỳ chọn) | Giới hạn 500 ký tự |
| Xác nhận & Lưu | Xác nhận thông tin trước khi nộp, sau đó ghi vào Firestore | Hiển thị popup tóm tắt để kiểm tra lại trước khi submit |

### 4.2 Quản lý bản ghi trong tiết học

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem bản ghi vừa tạo trong tiết | Danh sách các bản ghi trong tiết học hiện tại theo thứ tự thời gian | Realtime update qua Firestore |
| Chỉnh sửa bản ghi vừa tạo | Chỉ được sửa bản ghi **do mình tạo**, **trong cùng tiết học đang diễn ra** | Sau khi tiết kết thúc hoặc đã nộp thì không cho sửa |
| Xoá bản ghi vừa tạo | Xoá bản ghi **do mình tạo** trong tiết học hiện tại | Cảnh báo xác nhận trước khi xoá |

---

## 5. Xem Lịch sử Điểm (Score History)

*Giáo viên xem lịch sử ghi nhận điểm theo phạm vi quyền của mình.*

### 5.1 Giáo viên bộ môn (`TEACHER_SUBJECT`)

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem lịch sử tiết đã dạy | Danh sách các tiết đã dạy theo tuần/tháng | Lọc theo lớp, thời gian |
| Xem bản ghi theo tiết | Toàn bộ bản ghi điểm của 1 tiết học cụ thể (do mình tạo) | Chỉ xem được bản ghi của tiết mình dạy |

### 5.2 Giáo viên chủ nhiệm (`TEACHER_HOMEROOM`)

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem tổng hợp điểm lớp | Tổng điểm hiện tại của lớp trong chu kỳ đang chạy, lịch sử các chu kỳ trước | Chỉ xem được lớp mình chủ nhiệm |
| Xem toàn bộ lịch sử bản ghi | Tất cả bản ghi điểm của lớp (từ GV bộ môn, Sao Đỏ, chính GVCN) | Lọc theo: người ghi, loại (+/-), hạng mục, khoảng thời gian |
| Xem chi tiết bản ghi | Thông tin đầy đủ: ai ghi, thời điểm, hạng mục, đối tượng, ghi chú, ảnh (nếu có) | - |
| Xem điểm theo từng học sinh | Lọc lịch sử bản ghi theo 1 học sinh cụ thể trong lớp | Hỗ trợ theo dõi cá nhân học sinh |
| Xem bảng xếp hạng lớp theo chu kỳ | So sánh điểm lớp mình với các lớp khác trong khối (chỉ xem thứ hạng, không xem chi tiết lớp khác) | - |

---

## 6. Phản hồi & Yêu cầu Chỉnh sửa (Feedback & Flag)

*Chức năng dành riêng cho `TEACHER_HOMEROOM` khi phát hiện bản ghi bất thường trong lớp mình.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Flag bản ghi nghi sai | Đánh dấu 🚩 một bản ghi cần xem lại, kèm lý do giải trình | Bản ghi vẫn được tính điểm cho đến khi Admin xử lý |
| Xem trạng thái đã flag | Danh sách bản ghi đã flag kèm trạng thái: `PENDING` / `APPROVED` / `REJECTED` | Thông báo khi Admin xử lý xong |
| Huỷ flag | Rút lại yêu cầu flag nếu tự xử lý được | Chỉ huỷ được khi trạng thái còn `PENDING` |

---

## 7. Thông báo (Notifications)

*Giáo viên nhận thông báo liên quan đến lớp học và các sự kiện thi đua.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Nhận thông báo kết quả chu kỳ | Thông báo khi Admin chốt một chu kỳ thi đua: kết quả xếp hạng lớp mình | `TEACHER_HOMEROOM` nhận thông báo chi tiết |
| Nhận thông báo xử lý flag | Kết quả Admin duyệt/từ chối yêu cầu chỉnh sửa bản ghi | Kèm ghi chú giải thích của Admin |
| Xem danh sách thông báo | Lịch sử tất cả thông báo đã nhận, đánh dấu đã đọc / chưa đọc | - |

---

## Mở rộng sau:

- **Ghi nhận điểm offline:** Cache bản ghi khi mất kết nối, tự động sync lên Firestore khi có mạng trở lại.
- **Điểm danh tích hợp:** Trong tiết học, GV điểm danh học sinh vắng → tự động tạo bản ghi trừ điểm hạng mục "vắng không phép".
- **Thống kê cá nhân GV:** Tổng số tiết đã dạy, số bản ghi điểm đã tạo, tỉ lệ cộng/trừ điểm — hỗ trợ đánh giá phong cách quản lý lớp.
