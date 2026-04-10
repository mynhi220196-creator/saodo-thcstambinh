# Danh sách Chức năng Dành cho Sao Đỏ (Red Star Member)

Dựa trên nghiệp vụ hệ thống Sao Đỏ (trường THCS, THPT), dưới đây là toàn bộ chức năng dành cho role `RED_STAR`.

FE kết nối trực tiếp **Firebase** (Auth, Firestore/Realtime DB) và **Cloudinary** (upload ảnh bằng chứng khi ghi nhận).

> **Đặc điểm của role này:**
> - Sao Đỏ chỉ được ghi nhận điểm **trong khung giờ ca trực** được Admin phân công.
> - Bản ghi sau khi nộp là **bất biến** — không thể tự sửa hoặc xoá.
> - Phạm vi xem dữ liệu rất hẹp — chỉ thấy lịch trực của mình và bản ghi do mình tạo.

---

## 1. Xác thực (Authentication)

*Sao Đỏ đăng nhập bằng tài khoản do Admin tạo, thông qua Firebase Authentication.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Đăng nhập | Đăng nhập bằng email/password qua Firebase Auth | Giao diện tối giản, tối ưu cho mobile |
| Đăng xuất | Huỷ session Firebase, xoá token local | Redirect về trang Login |
| Quên mật khẩu | Gửi email reset password qua Firebase Auth | Dùng built-in của Firebase |
| Đổi mật khẩu | Tự đổi mật khẩu của mình | Xác thực mật khẩu cũ trước khi cho đổi |

---

## 2. Hồ sơ Cá nhân (My Profile)

*Sao Đỏ xem thông tin cá nhân, không được tự thay đổi vai trò hoặc lớp.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem hồ sơ | Xem: họ tên, lớp, ảnh đại diện, trạng thái thành viên Sao Đỏ | Chỉ đọc, không chỉnh sửa vai trò |
| Cập nhật ảnh đại diện | Chụp ảnh hoặc chọn từ thư viện → upload lên Cloudinary | Thay đổi ngay lập tức sau upload |

---

## 3. Lịch trực (My Duty Schedule)

*Màn hình trung tâm của Sao Đỏ — hiển thị ngay sau khi đăng nhập. Sao Đỏ tra cứu lịch trực và xác nhận bắt đầu ca.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem lịch trực sắp tới | Danh sách các ca trực trong 7 ngày tới: ngày, ca (sáng/trưa/chiều), khu vực phụ trách | Hiển thị nổi bật ca trực hôm nay |
| Xem lịch trực theo tháng | Dạng calendar tháng — highlight các ngày có ca trực | Tap vào ngày để xem chi tiết ca |
| Xem chi tiết ca trực | Thông tin ca: tên ca, giờ bắt đầu, giờ kết thúc, khu vực/khối lớp phụ trách | - |
| Xác nhận bắt đầu ca | Nhấn "Bắt đầu ca trực" trong khung giờ hợp lệ để mở quyền ghi nhận điểm | Chỉ cho phép bắt đầu trong khoảng ±15 phút so với giờ bắt đầu ca |
| Kết thúc ca trực | Nhấn "Kết thúc ca" — hệ thống đóng quyền ghi nhận thêm bản ghi cho ca này | Tự động kết thúc khi quá giờ kết thúc ca |

---

## 4. Ghi nhận Điểm Thi đua (Score Recording)

*Chức năng cốt lõi. Toàn bộ thao tác ghi nhận phải diễn ra trong ca trực đang hoạt động.*

### 4.1 Tạo bản ghi điểm

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Chọn lớp cần ghi nhận | Chọn lớp từ danh sách các lớp thuộc **khu vực phụ trách** trong ca trực | Không thể ghi nhận lớp ngoài phạm vi phụ trách |
| Chọn hạng mục điểm | Chọn từ danh sách hạng mục (`isActive=true`): 🟢 cộng điểm / 🔴 trừ điểm, kèm số điểm | Giao diện 2 tab riêng biệt: Cộng / Trừ |
| Chọn đối tượng | Áp dụng cho **cả lớp** hoặc **học sinh cụ thể** | Tìm kiếm nhanh theo tên trong danh sách lớp |
| Thêm ghi chú | Mô tả ngắn về tình huống ghi nhận (tuỳ chọn) | Giới hạn 300 ký tự |
| Đính kèm ảnh bằng chứng | Chụp ảnh trực tiếp hoặc chọn từ thư viện → upload lên Cloudinary (tuỳ chọn) | Tối đa 2 ảnh / bản ghi; resize ảnh trước khi upload |
| Xác nhận & Nộp | Hiển thị popup tóm tắt toàn bộ thông tin → xác nhận → ghi vào Firestore | Sau khi nộp, bản ghi **không thể sửa hoặc xoá** |

### 4.2 Ràng buộc khi ghi nhận

| Ràng buộc | Mô tả | Xử lý |
|-----------|-------|-------|
| Ngoài ca trực | Không cho tạo bản ghi nếu chưa xác nhận bắt đầu ca hoặc ca đã kết thúc | Hiển thị thông báo và khoá nút ghi nhận |
| Ngoài khu vực phụ trách | Không hiển thị lớp ngoài phạm vi khu vực ca trực | Danh sách lớp được lọc theo ca |
| Ca đã đóng | Không thể thêm bản ghi vào ca đã kết thúc | Chỉ xem lại, không tạo mới |

---

## 5. Lịch sử Ghi nhận (My Records)

*Sao Đỏ xem lại các bản ghi đã nộp — chỉ xem được bản ghi do chính mình tạo.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Xem bản ghi trong ca hiện tại | Danh sách bản ghi đã nộp trong ca đang trực, theo thứ tự thời gian | Realtime update qua Firestore |
| Xem lịch sử theo ca trực | Tất cả bản ghi theo từng ca đã trực (phân nhóm theo ngày/ca) | Lọc theo khoảng thời gian |
| Xem chi tiết bản ghi | Đầy đủ thông tin: lớp, học sinh, hạng mục, điểm, ghi chú, ảnh, thời điểm nộp | Chỉ đọc — không có nút chỉnh sửa |
| Xem trạng thái bản ghi | `CONFIRMED` (đã tính vào điểm) / `FLAGGED` (đang bị GVCN yêu cầu xem lại) / `REMOVED` (Admin đã xoá) | Hiển thị badge trạng thái rõ ràng |

---

## 6. Thông báo (Notifications)

*Sao Đỏ nhận thông báo liên quan đến lịch trực và trạng thái bản ghi đã nộp.*

| Chức năng | Mô tả | Ghi chú |
|-----------|-------|---------|
| Nhắc nhở lịch trực | Thông báo trước ca trực 30 phút | Dùng Firebase Cloud Messaging (FCM) |
| Thông báo bản ghi bị xoá | Khi Admin xoá một bản ghi do mình tạo — kèm lý do | Giúp Sao Đỏ rút kinh nghiệm |
| Xem danh sách thông báo | Lịch sử tất cả thông báo, đánh dấu đã đọc/chưa đọc | - |

---

## Mở rộng sau:

- **Ghi nhận offline:** Cache bản ghi khi mất kết nối (ở khu vực sóng yếu trong trường), tự động sync khi có mạng trở lại — có cơ chế kiểm tra ca trực còn hiệu lực lúc sync không.
- **Quét QR lớp học:** Mỗi lớp có một mã QR dán ngoài cửa, Sao Đỏ quét để chọn lớp nhanh thay vì tìm trong danh sách.
- **Thống kê cá nhân:** Số ca đã trực, tổng số bản ghi đã nộp, tỉ lệ cộng/trừ điểm — để Ban Giám Hiệu đánh giá mức độ hoạt động của từng Sao Đỏ.
- **Xếp hạng Sao Đỏ tích cực:** Bảng vinh danh nội bộ dành cho Sao Đỏ có nhiều bản ghi hợp lệ nhất trong tháng.
