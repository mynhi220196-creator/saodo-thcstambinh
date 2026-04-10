-- Chạy thủ công trên PostgreSQL/Supabase nếu DB đã tồn tại enum cũ (TEACHER_SUBJECT / TEACHER_HOMEROOM).
-- B1: thêm nhãn TEACHER (bỏ qua nếu đã có).
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'TEACHER';

-- B2: gộp dữ liệu hồ sơ (chạy sau B1; có thể cần reconnect session tùy phiên bản PG).
UPDATE profiles
SET role = 'TEACHER'::user_role
WHERE role::text IN ('TEACHER_SUBJECT', 'TEACHER_HOMEROOM');

-- Lưu ý: không thể xoá bỏ giá trị enum cũ khỏi kiểu user_role chỉ bằng ALTER đơn giản;
-- project mới nên dùng schema.sql / 001_bootstrap_profiles.sql đã cập nhật.
