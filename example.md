# Danh sách Endpoint API Dành cho Quản trị viên Tổng (Admin)

Dựa trên cấu trúc Database Pickaboo (hệ thống đặt sân đa chi nhánh, đa sân), dưới đây là bản thiết kế chi tiết các API dành cho role `ADMIN`.

Tất cả các API dưới đây đều yêu cầu xác thực **Bearer Token** và quyền (role) = `ADMIN`. Base path: `/api/admin`

---

## 1. Quản lý Người dùng & Phân quyền (Users & Roles) ✅

*Hệ thống dùng chung bảng User. Admin cấp cao có quyền phân công Manager hoặc Owner cho các chi nhánh.*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/admin/users` | Xem danh sách tất cả người dùng (Phân trang, lọc theo `role`, tìm kiếm theo tên/email/SĐT) | Query: `?page=1&size=10&role=MANAGER&search=keyword` |
| GET | `/api/admin/users/{id}` | Xem chi tiết thông tin một người dùng cụ thể | - |
| PATCH | `/api/admin/users/{id}/status` | Khóa/Mở Khóa tài khoản (`isActive`) khi có dấu hiệu vi phạm hệ thống. Không thể khóa tài khoản ADMIN. | `{ "isActive": false, "reason": "Bomb đặt sân" }` |
| PATCH | `/api/admin/users/{id}/role` | Cấp/Hạ quyền người dùng (VD: Nâng Customer lên làm MANAGER chi nhánh). Không thể thay đổi role ADMIN hoặc nâng lên ADMIN. | `{ "role": "MANAGER" }` |

---

## 2. Quản lý Chi nhánh (Branches Management) ✅

*Quản trị mạng lưới các cơ sở/chi nhánh hoạt động trên nền tảng.*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/admin/branches` | Danh sách chi nhánh (Phân trang, tìm kiếm theo tên/địa chỉ/hotline) | Query: `?search=CauGiay&page=1&size=10` |
| GET | `/api/admin/branches/{id}` | Xem chi tiết chi nhánh (Bao gồm danh sách `courts`, `services` và thông tin Manager) | - |
| POST | `/api/branches/create` | *(Đã có)* Tạo mới chi nhánh (Admin/Owner). Owner bắt buộc assign `managerId`. Validate manager có role MANAGER. | `{ "name": "Pickaboo Cầu Giấy", "address": "...", "hotline": "...", "managerId": 12 }` |
| POST | `/api/branches/update?id=X` | *(Đã có)* Cập nhật thông tin chi nhánh / Đổi quản lý (Admin/Owner). | `{ "name": "...", "address": "...", "hotline": "...", "managerId": 15 }` |

---

## 3. Khai báo & Quản lý Sân (Courts Management) ✅

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/courts/by-branch?branchId=X` | *(Đã có - Public)* Danh sách sân thuộc một chi nhánh | Query: `?branchId=5` |
| POST | `/api/courts/create` | *(Đã có - Admin/Owner)* Thêm mới sân vào chi nhánh | `{ "branchId": 5, "name": "Sân Thảm 1", "courtType": "INDOOR" }` |
| PATCH | `/api/admin/courts/{id}/status` | Tạm khóa sân / Bảo trì / Mở lại. Status: `AVAILABLE`, `MAINTENANCE`, `OCCUPIED` | `{ "status": "MAINTENANCE" }` |

---

## 4. Quản lý Bảng Giá Động (Price Policies) ✅

*Cấu hình biểu giá chuẩn cho dịch vụ đặt sân linh hoạt theo giờ, theo ngày.*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/admin/price-policies` | Danh sách cấu hình giá (Lọc theo `branchId`, `courtId`, `isActive`. Phân trang) | Query: `?branchId=5&isActive=true&page=1&size=10` |
| POST | `/api/price-policies/create` | *(Đã có)* Tạo chính sách giá mới. Validate time range, branch/court tồn tại. | `{ "name": "Giá Giờ Vàng", "branchId": 5, "courtId": null, "dayOfWeek": 2, "startTime": "17:00:00", "endTime": "21:00:00", "pricePerHour": 150000, "isActive": true }` |
| POST | `/api/price-policies/update?id=X` | *(Đã có)* Cập nhật chính sách giá. Validate time range, branch/court. | `{ "name": "...", "branchId": 5, "dayOfWeek": 2, "startTime": "17:00:00", "endTime": "21:00:00", "pricePerHour": 180000 }` |
| DELETE | `/api/admin/price-policies/{id}` | Soft-delete: đặt `isActive=false` (không xóa khỏi DB). Chính sách bị vô hiệu sẽ không áp dụng khi tính giá. | - |

> **Ghi chú:** Có thể tạo giá đè nhau, API cần check Validations ko bị conflict khung giờ (Overlap time). Service hiện tại chọn policy overlap lớn nhất với khung giờ booking.

---

## 5. Quản lý Danh mục (Categories Management) ✅

*Hệ thống Master Data phân loại (Categories hiển thị trên App Khách hàng và các mặt hàng bán kèm).*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/categories` | *(Public — không cần đăng nhập)* Lấy danh sách danh mục. Hỗ trợ lọc `isActive` và phân trang. | Query: `?isActive=true&page=1&size=10` |
| POST | `/api/admin/categories/create`| **(Admin)** Tạo danh mục hàng hóa mới | `{ "name": "Nước giải khát", "iconUrl": "link-anh.png", "isActive": true }` |
| POST | `/api/admin/categories/update?id=X`| **(Admin)** Chỉnh sửa tên, icon hoặc vô hiệu hóa danh mục (partial update) | `{ "name": "Đồ uống có gas", "isActive": false }` |

> **Ghi chú:** `GET /api/categories` đã được thêm vào SecurityConfig public endpoints. Các endpoint create/update yêu cầu Bearer Token + role ADMIN.

---

## 6. Quản lý Dịch vụ Bán kèm (Services & Items) ✅

*Tất cả endpoint đã có sẵn trong `AddonServiceController` (`/api/services`). Role check: Admin/Owner/Manager.*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/services/get-by-branch?branchId=X` | *(Đã có - Public)* Danh sách dịch vụ theo chi nhánh (phân trang) | Query: `?branchId=5&page=1&size=10` |
| POST | `/api/services/create` | *(Đã có - Admin/Owner/Manager)* Thêm mới dịch vụ cho chi nhánh | `{ "branchId": 5, "categoryId": 1, "name": "Thuê Vợt X", "unitPrice": 50000, "stock": 10 }` |
| POST | `/api/services/update?id=X` | *(Đã có - Admin/Owner/Manager)* Cập nhật thông tin/giá dịch vụ (partial update). Hỗ trợ `isActive` để ẩn/hiện dịch vụ. | `{ "unitPrice": 60000 }` |

---

## 7. Theo dõi Lịch Đặt Sân Tổng (Bookings Overview) ✅

*Theo dõi toàn bộ lưu lượng đặt sân (dành cho bộ phận Chăm sóc Khách hàng cấp cao).*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/admin/bookings` | Danh sách booking toàn hệ thống (Lọc theo ngày, branch, status. Phân trang) | Query: `?bookingDate=2026-03-30&status=CONFIRMED&branchId=2&page=1&size=10` |
| GET | `/api/bookings/{id}` | *(Đã có)* Xem chi tiết Booking (User, Court, khung giờ). Admin/Manager xem được tất cả. | - |
| GET | `/api/bookings/{id}/payment-transactions` | *(Đã có)* Xem danh sách Transactions liên kết (cọc, thanh toán nốt). | - |
| PATCH | `/api/admin/bookings/{id}/cancel` | Admin force cancel: hủy trực tiếp (bỏ qua PENDING_CANCELLATION). Nếu `refundToWallet=true` + đã cọc → hoàn tiền vào ví. | `{ "cancellationReason": "Chi nhánh mất điện 4 tiếng", "refundToWallet": true }` |

---

## 8. Sổ Cái Tài chính & Giao dịch (Financials & Transactions) ✅

*Kiểm soát toàn bộ dòng tiền của hệ thống (Nạp tiền ví, Booking trả trước, Giao dịch thêm).*

| Method | Endpoint | Mục đích | Body Request / Query |
|--------|----------|----------|----------------------|
| GET | `/api/admin/transactions` | **Sổ Kế Toán:** Xem toàn bộ giao dịch dòng tiền hệ thống. Lọc theo type, status, khoảng ngày. | Query: `?type=PAYMENT&status=SUCCESS&fromDate=2026-03-01&toDate=2026-03-31&page=1&size=20` |
| GET | `/api/wallets/paging` | *(Đã có)* Xem danh sách ví Customers (phân trang). | Query: `?page=1&size=20` |
| POST | `/api/admin/wallets/{walletId}/adjustment` | Nạp tiền / Hoàn tiền trực tiếp vào ví khách. Mọi thao tác lưu vết `[Admin#userId]` trong description. | `{ "amount": 500000, "description": "Refund nạp lỗi qua PayOS ngân hàng", "type": "REFUND" }` |

> **Ghi chú:** API `/adjustment` lưu vết Log đầy đủ: admin ID, description, referenceId tự sinh. Chỉ Admin mới có quyền. Type chỉ chấp nhận `RECHARGE` (nạp) hoặc `REFUND` (hoàn).

---

## Mở rộng sau:
*Tính năng **Dashboard & Analytics** (Khai thác doanh thu hệ thống đa chi nhánh):*
- `GET /api/admin/analytics/revenue` (Doanh thu tổng sàn chia theo Brand/Date)
- `GET /api/admin/analytics/courts-utilization` (Công suất lấp đầy sân / Nhiệt đồ khung giờ vàng)
- `GET /api/admin/analytics/customers` (Thống kê lượng Customer mới / Lượt Retention check-in)
