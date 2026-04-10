# 📋 NGHIỆP VỤ TỔNG QUAN DỰ ÁN — HỆ THỐNG QUẢN LÝ SAO ĐỎ

> **Phiên bản:** 1.0
> **Cập nhật:** 04/04/2026
> **Đối tượng áp dụng:** Trường THCS & THPT

---

## 1. GIỚI THIỆU DỰ ÁN

### 1.1 Bối cảnh

Trong các trường THCS và THPT tại Việt Nam, mô hình **Sao Đỏ** (hay còn gọi là Hội đồng Tự quản Học sinh) là một hình thức tự quản học sinh, trong đó một nhóm học sinh được phân công nhiệm vụ theo dõi, ghi nhận kỷ luật, nề nếp và các hoạt động thi đua của các lớp học.

Hiện tại, quá trình ghi nhận, tổng hợp và xử lý điểm thi đua vẫn được thực hiện thủ công qua sổ sách giấy tờ, dẫn đến nhiều hạn chế:

- Dữ liệu phân tán, khó tổng hợp và tra cứu.
- Thiếu minh bạch trong quá trình ghi nhận điểm.
- Giáo viên không có công cụ để cập nhật thông tin nhanh ở từng tiết học.
- Ban quản lý khó nắm được tình hình tổng thể theo thời gian thực.

### 1.2 Mục tiêu dự án

Xây dựng một nền tảng phần mềm giúp **số hóa toàn bộ quy trình quản lý thi đua** trong nhà trường, bao gồm:

- Quản lý hạng mục điểm thi đua (cộng điểm / trừ điểm).
- Phân công nhiệm vụ cho đội Sao Đỏ.
- Ghi nhận hành vi vi phạm hoặc xuất sắc theo thời gian thực.
- Tổng hợp điểm theo lớp, theo tuần, tháng, học kỳ.
- Minh bạch hóa thông tin thi đua cho giáo viên và ban giám hiệu.

---

## 2. CÁC CHỦ THỂ (ACTORS)

Hệ thống có **3 actor chính**, mỗi actor có vai trò và quyền hạn riêng biệt:

| Actor | Tên gọi | Mô tả |
|---|---|---|
| 👑 **Admin** | Ban Giám Hiệu / Quản trị viên | Quản lý toàn bộ hệ thống, thiết lập cấu hình, phân công |
| 📚 **Giáo Viên** | Giáo viên bộ môn / chủ nhiệm | Xem và cập nhật điểm thi đua trong tiết học |
| 🔴 **Sao Đỏ** | Học sinh Sao Đỏ | Ghi nhận thông tin vi phạm / thành tích ngoài tiết học |

---

## 3. PHÂN TÍCH NGHIỆP VỤ THEO ACTOR

---

### 3.1 👑 ADMIN — Ban Giám Hiệu / Quản Trị Viên

#### Vai trò
Admin là người sở hữu toàn bộ quyền quản trị hệ thống. Admin thiết lập nền tảng vận hành cho toàn bộ chu kỳ thi đua của trường.

#### Nghiệp vụ chính

**A. Quản lý người dùng**
- Tạo, chỉnh sửa, vô hiệu hóa tài khoản cho Giáo viên và Sao Đỏ.
- Phân quyền theo vai trò (Giáo viên bộ môn, Giáo viên chủ nhiệm, Sao Đỏ).
- Quản lý thông tin giáo viên, lớp học, học sinh.

**B. Quản lý cơ cấu tổ chức**
- Tạo và quản lý danh sách lớp học (khối 6 → khối 12 hoặc tương đương).
- Phân công giáo viên chủ nhiệm cho từng lớp.
- Quản lý danh sách học sinh theo lớp.

**C. Quản lý hạng mục thi đua (Tiêu chí điểm)**
- Định nghĩa các **hạng mục cộng điểm** (ví dụ: ăn mặc đúng đồng phục, giơ tay phát biểu, có thành tích học tập...).
- Định nghĩa các **hạng mục trừ điểm** (ví dụ: đi học muộn, không mang dụng cụ học tập, nói chuyện riêng, sử dụng điện thoại...).
- Cấu hình số điểm tương ứng cho từng hạng mục.
- Kích hoạt / vô hiệu hóa hạng mục theo từng thời điểm.

**D. Quản lý phân công Sao Đỏ**
- Tạo và quản lý danh sách thành viên Sao Đỏ (từ danh sách học sinh).
- Lên **lịch trực** cho Sao Đỏ (theo ngày, theo tuần).
- Phân công khu vực / khối lớp phụ trách cho từng Sao Đỏ.
- Theo dõi hoạt động ghi nhận của từng Sao Đỏ.

**E. Quản lý chu kỳ thi đua**
- Thiết lập **chu kỳ tính điểm** (theo tuần, tháng, học kỳ).
- Khởi động và kết thúc một chu kỳ thi đua.
- Xem và duyệt kết quả tổng hợp điểm cuối chu kỳ.

**F. Báo cáo & Thống kê**
- Xem bảng xếp hạng thi đua theo lớp theo thời gian thực.
- Báo cáo tổng hợp điểm theo tuần / tháng / học kỳ.
- Thống kê các vi phạm phổ biến nhất, lớp có thành tích tốt/kém.
- Xuất báo cáo (PDF / Excel).

---

### 3.2 📚 GIÁO VIÊN — Giáo Viên Bộ Môn & Chủ Nhiệm

#### Vai trò
Giáo viên có quyền theo dõi và ghi nhận điểm thi đua **trong phạm vi tiết học** của mình. Đặc biệt, giáo viên chủ nhiệm có quyền xem tổng hợp điểm của lớp mình phụ trách.

#### Phân loại Giáo Viên

| Loại | Quyền hạn |
|---|---|
| **Giáo viên bộ môn** | Ghi nhận điểm trong tiết dạy, xem điểm lớp đang dạy |
| **Giáo viên chủ nhiệm** | Ghi nhận điểm lớp chủ nhiệm, xem toàn bộ lịch sử điểm lớp, phản hồi |

#### Nghiệp vụ chính

**A. Quản lý lịch dạy**
- Xem thời khóa biểu của mình theo tuần.
- Truy cập nhanh vào tiết học hiện tại hoặc sắp diễn ra.

**B. Ghi nhận điểm trong tiết học**
- Trong một tiết học, giáo viên có thể:
  - **Cộng điểm** cho học sinh / cả lớp theo các hạng mục được định nghĩa sẵn.
  - **Trừ điểm** cho học sinh / cả lớp theo hạng mục vi phạm.
- Ghi chú bổ sung cho mỗi lần ghi nhận.
- Xác nhận/lưu thông tin sau tiết học.

**C. Xem điểm thi đua**
- **(Giáo viên bộ môn):** Xem lịch sử điểm của các lớp mình đã dạy.
- **(Giáo viên chủ nhiệm):** Xem toàn bộ lịch sử điểm lớp mình phụ trách (bao gồm điểm từ Sao Đỏ và các giáo viên khác).
- Xem chi tiết từng lần ghi nhận (ai ghi, hạng mục nào, thời điểm nào).

**D. Chỉnh sửa & Phản hồi**
- Giáo viên chủ nhiệm có thể **yêu cầu chỉnh sửa** (flag) một bản ghi điểm nếu phát hiện sai sót.
- Gửi phản hồi / ghi chú giải trình lên Admin.

---

### 3.3 🔴 SAO ĐỎ — Học Sinh Sao Đỏ

#### Vai trò
Sao Đỏ là những học sinh được Ban Giám Hiệu chọn và phân công đi **kiểm tra, giám sát** toàn trường trong các khung giờ quy định (trước giờ học, giờ ra chơi, giờ ăn trưa...). Họ ghi nhận thông tin trực tiếp trên thiết bị di động.

#### Nghiệp vụ chính

**A. Xem lịch trực**
- Xem lịch phân công trực của bản thân.
- Nhận thông báo nhắc lịch trực sắp đến.

**B. Ghi nhận điểm thi đua**
- Trong ca trực được phân công:
  - Chọn **lớp** cần ghi nhận.
  - Chọn **hạng mục** (cộng hoặc trừ điểm) từ danh sách có sẵn.
  - *(Tùy chọn)* Chọn cụ thể **học sinh** vi phạm / được khen.
  - Thêm ghi chú mô tả tình huống.
  - *(Tùy chọn)* Đính kèm ảnh làm bằng chứng.
- Xác nhận và nộp bản ghi.

**C. Xem lịch sử ghi nhận**
- Xem lại toàn bộ các bản ghi mình đã nộp trong ca trực.
- Theo dõi trạng thái bản ghi (đã xác nhận / đang chờ duyệt).

**D. Hạn chế quyền hạn**
- Sao Đỏ **không thể chỉnh sửa hoặc xóa** bản ghi đã nộp (chỉ Admin mới có quyền này).
- Sao Đỏ **chỉ được ghi nhận trong thời gian ca trực** của mình.
- Sao Đỏ **không thể xem** điểm tổng hợp của các lớp khác.

---

## 4. QUY TRÌNH NGHIỆP VỤ TỔNG QUAN (WORKFLOW)

### 4.1 Quy trình thiết lập hệ thống (Admin — Đầu năm/học kỳ)

```
Admin tạo tài khoản → Thiết lập lớp học & học sinh
→ Cấu hình hạng mục điểm (+/-) → Phân công Sao Đỏ
→ Lên lịch trực Sao Đỏ → Mở chu kỳ thi đua
```

### 4.2 Quy trình ghi nhận điểm trong tiết học (Giáo Viên)

```
Giáo viên đăng nhập → Chọn tiết học đang dạy
→ Chọn học sinh / lớp → Chọn hạng mục (+/-)
→ Nhập ghi chú → Lưu bản ghi điểm
→ Hệ thống tổng hợp tự động
```

### 4.3 Quy trình ghi nhận điểm ngoài tiết học (Sao Đỏ)

```
Sao Đỏ đăng nhập → Xác nhận ca trực
→ Chọn lớp cần ghi nhận → Chọn hạng mục (+/-)
→ Chọn học sinh (nếu cần) → Thêm ghi chú / ảnh
→ Nộp bản ghi → Hệ thống tổng hợp tự động
```

### 4.4 Quy trình tổng kết thi đua (Admin — Cuối tuần/tháng)

```
Hệ thống tổng hợp điểm theo chu kỳ
→ Admin xem bảng xếp hạng
→ Xác nhận kết quả → Xuất báo cáo
→ Công bố kết quả cho giáo viên chủ nhiệm
→ Mở chu kỳ mới
```

---

## 5. CÁC THỰC THỂ DỮ LIỆU CHÍNH

| Thực thể | Mô tả |
|---|---|
| **User** | Tài khoản người dùng (Admin / Giáo viên / Sao Đỏ) |
| **Class** | Lớp học |
| **Student** | Học sinh |
| **Teacher** | Thông tin giáo viên và lớp phụ trách |
| **RedStarMember** | Thành viên Sao Đỏ |
| **RedStarSchedule** | Lịch trực của Sao Đỏ |
| **ScoreCategory** | Hạng mục điểm (+/-) |
| **ScoreRecord** | Bản ghi điểm (ai ghi, lớp nào, học sinh nào, hạng mục nào) |
| **CompetitionCycle** | Chu kỳ thi đua (tuần / tháng / học kỳ) |
| **ClassScore** | Điểm tổng hợp của từng lớp theo chu kỳ |
| **Timetable** | Thời khóa biểu (liên kết giáo viên với lớp, tiết học) |

---

## 6. QUY TẮC NGHIỆP VỤ QUAN TRỌNG

1. **Tính bất biến của bản ghi:** Sau khi Sao Đỏ nộp bản ghi, bản ghi đó **không thể tự ý sửa/xóa**. Chỉ Admin mới có quyền can thiệp.

2. **Ràng buộc thời gian:** Sao Đỏ chỉ được ghi nhận điểm trong **khung giờ ca trực** được phân công. Hệ thống sẽ từ chối bản ghi ngoài thời gian này.

3. **Phạm vi quyền Giáo Viên:** Giáo viên bộ môn chỉ được ghi nhận điểm trong **đúng tiết học** mình đang dạy theo thời khóa biểu. Giáo viên chủ nhiệm có thể ghi nhận điểm lớp mình bất kỳ lúc nào.

4. **Tổng hợp điểm tự động:** Hệ thống tự động tính toán và cập nhật điểm tổng của lớp sau mỗi bản ghi được xác nhận. Không cần nhập liệu thủ công vào bảng tổng hợp.

5. **Phân tầng báo cáo:** Giáo viên chủ nhiệm chỉ xem được lớp mình phụ trách. Admin xem được toàn trường.

6. **Tính minh bạch:** Mọi bản ghi điểm đều lưu đầy đủ thông tin: **người ghi, thời điểm, hạng mục, ghi chú**. Không có bản ghi ẩn danh.

7. **Điểm âm:** Hệ thống cho phép tổng điểm của lớp xuống giá trị âm (không bị giới hạn tối thiểu tại 0), phản ánh đúng thực tế thi đua.

---

## 7. TÍNH NĂNG MỞ RỘNG (Gợi ý cho phiên bản tiếp theo)

- 📱 **Ứng dụng di động** dành riêng cho Sao Đỏ (tối ưu trải nghiệm ghi nhận nhanh).
- 🔔 **Thông báo đẩy (Push Notification):** Nhắc lịch trực, thông báo kết quả thi đua.
- 📊 **Dashboard phân tích nâng cao:** Biểu đồ xu hướng vi phạm, điểm mạnh/yếu từng lớp.
- 🏆 **Bảng vinh danh:** Tự động hiển thị lớp xuất sắc nhất trên màn hình thông báo trường.
- 📷 **Gắn ảnh bằng chứng:** Sao Đỏ có thể đính kèm ảnh khi ghi nhận vi phạm.
- 🔁 **Tích hợp hệ thống điểm học bạ:** Liên kết điểm thi đua với điểm rèn luyện trong học bạ điện tử.

---

## 8. TÓM TẮT PHẠM VI DỰ ÁN

| Hạng mục | Chi tiết |
|---|---|
| **Đối tượng người dùng** | Ban Giám Hiệu, Giáo viên, Học sinh Sao Đỏ |
| **Nền tảng** | Web (Admin & Giáo viên), Mobile-friendly (Sao Đỏ) |
| **Nghiệp vụ cốt lõi** | Cấu hình hạng mục điểm, ghi nhận điểm, tổng hợp thi đua, báo cáo |
| **Điểm khác biệt** | Minh bạch, thời gian thực, có dấu vết (audit trail) đầy đủ |
| **Mục tiêu chính** | Thay thế hoàn toàn quy trình sổ sách thủ công |
