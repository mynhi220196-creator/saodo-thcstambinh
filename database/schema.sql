-- ============================================================
-- SCHEMA: Hệ thống Quản lý Sao Đỏ
-- Database: PostgreSQL (Supabase)
-- Phiên bản: 1.0 — 05/04/2026
-- ============================================================

-- Bật extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'RED_STAR');
CREATE TYPE score_type AS ENUM ('PLUS', 'MINUS');
CREATE TYPE cycle_type AS ENUM ('WEEKLY', 'MONTHLY', 'SEMESTER');
CREATE TYPE cycle_status AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE record_status AS ENUM ('CONFIRMED', 'FLAGGED', 'REMOVED');
CREATE TYPE flag_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE duty_shift_name AS ENUM ('MORNING', 'NOON', 'AFTERNOON');
CREATE TYPE schedule_status AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE notification_type AS ENUM (
  'CYCLE_CLOSED',
  'FLAG_RESOLVED',
  'RECORD_REMOVED',
  'DUTY_REMINDER'
);

-- ============================================================
-- 1. PROFILES (mở rộng từ auth.users của Supabase)
-- ============================================================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  avatar_url      TEXT,                        -- Cloudinary URL
  role            user_role NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'Thông tin người dùng mở rộng từ Supabase Auth';

-- ============================================================
-- 2. SYSTEM SETTINGS (Cài đặt hệ thống)
-- ============================================================

CREATE TABLE system_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_name     TEXT NOT NULL DEFAULT 'Trường THCS & THPT',
  school_logo_url TEXT,                        -- Cloudinary URL
  school_address  TEXT,
  academic_year   TEXT NOT NULL DEFAULT '2025-2026',  -- VD: "2025-2026"
  semester1_start DATE,
  semester1_end   DATE,
  semester2_start DATE,
  semester2_end   DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by      UUID REFERENCES profiles(id)
);

COMMENT ON TABLE system_settings IS 'Cấu hình thông tin chung của trường';

-- ============================================================
-- 3. DUTY SHIFTS (Ca trực — cấu hình mẫu)
-- ============================================================

CREATE TABLE duty_shifts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            duty_shift_name NOT NULL,
  display_name    TEXT NOT NULL,               -- VD: "Ca Sáng"
  start_time      TIME NOT NULL,               -- VD: 06:45
  end_time        TIME NOT NULL,               -- VD: 07:15
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE duty_shifts IS 'Cấu hình các ca trực trong ngày (sáng/trưa/chiều)';

-- ============================================================
-- 4. CLASSES (Lớp học)
-- ============================================================

CREATE TABLE classes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,               -- VD: "10A1"
  grade           SMALLINT NOT NULL,           -- VD: 10, 11, 12 / 6, 7, 8, 9
  academic_year   TEXT NOT NULL,               -- VD: "2025-2026"
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, academic_year)
);

COMMENT ON TABLE classes IS 'Danh sách lớp học';

-- ============================================================
-- 5. STUDENTS (Học sinh)
-- ============================================================

CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_code    TEXT NOT NULL UNIQUE,        -- Mã học sinh
  full_name       TEXT NOT NULL,
  gender          gender,
  date_of_birth   DATE,
  class_id        UUID NOT NULL REFERENCES classes(id),
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE students IS 'Danh sách học sinh';

-- ============================================================
-- 6. TEACHERS (Thông tin giáo viên)
-- ============================================================

CREATE TABLE teachers (
  id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  subject         TEXT,                        -- Môn dạy (với GV bộ môn)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teachers IS 'Thông tin bổ sung của giáo viên';

-- ============================================================
-- 7. HOMEROOM ASSIGNMENTS (Phân công Chủ nhiệm)
-- ============================================================

CREATE TABLE homeroom_assignments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      UUID NOT NULL REFERENCES teachers(id),
  class_id        UUID NOT NULL REFERENCES classes(id),
  academic_year   TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, academic_year),             -- 1 lớp chỉ có 1 GVCN/năm
  UNIQUE(teacher_id, academic_year)            -- 1 GV chỉ chủ nhiệm 1 lớp/năm
);

COMMENT ON TABLE homeroom_assignments IS 'Phân công giáo viên chủ nhiệm cho lớp học';

-- ============================================================
-- 8. TIMETABLE SLOTS (Thời khoá biểu)
-- ============================================================

CREATE TABLE timetable_slots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      UUID NOT NULL REFERENCES teachers(id),
  class_id        UUID NOT NULL REFERENCES classes(id),
  subject         TEXT NOT NULL,
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 2 AND 8),  -- 2=Thứ 2, 8=CN
  period_number   SMALLINT NOT NULL CHECK (period_number BETWEEN 1 AND 10),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  academic_year   TEXT NOT NULL,
  week_from       DATE,                        -- Áp dụng từ tuần
  week_to         DATE,                        -- Đến tuần
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE timetable_slots IS 'Thời khoá biểu — liên kết GV với lớp và tiết học';

-- ============================================================
-- 9. RED STAR MEMBERS (Thành viên Sao Đỏ)
-- ============================================================

CREATE TABLE red_star_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id),  -- Tài khoản login
  student_id      UUID NOT NULL REFERENCES students(id),  -- Học sinh tương ứng
  academic_year   TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, academic_year)            -- 1 học sinh chỉ là Sao Đỏ 1 lần/năm
);

COMMENT ON TABLE red_star_members IS 'Danh sách học sinh là thành viên Sao Đỏ';

-- ============================================================
-- 10. DUTY SCHEDULES (Lịch trực Sao Đỏ)
-- ============================================================

CREATE TABLE duty_schedules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  red_star_id     UUID NOT NULL REFERENCES red_star_members(id),
  shift_id        UUID NOT NULL REFERENCES duty_shifts(id),
  duty_date       DATE NOT NULL,
  area_note       TEXT,                   -- Khu vực / khối lớp phụ trách
  status          schedule_status NOT NULL DEFAULT 'UPCOMING',
  started_at      TIMESTAMPTZ,            -- Khi Sao Đỏ bấm "Bắt đầu ca"
  ended_at        TIMESTAMPTZ,            -- Khi kết thúc ca
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE duty_schedules IS 'Lịch trực được phân công cho từng Sao Đỏ';

-- Bảng liên kết: lớp nào nằm trong khu vực phụ trách của 1 ca trực
CREATE TABLE duty_schedule_classes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id     UUID NOT NULL REFERENCES duty_schedules(id) ON DELETE CASCADE,
  class_id        UUID NOT NULL REFERENCES classes(id),
  UNIQUE(schedule_id, class_id)
);

COMMENT ON TABLE duty_schedule_classes IS 'Danh sách lớp phụ trách trong 1 ca trực';

-- ============================================================
-- 11. SCORE CATEGORIES (Hạng mục Thi đua)
-- ============================================================

CREATE TABLE score_categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  score_type      score_type NOT NULL,         -- PLUS / MINUS
  points          NUMERIC(5,1) NOT NULL CHECK (points > 0),  -- Luôn dương, type quyết định +/-
  icon_url        TEXT,                        -- Cloudinary URL
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES profiles(id)
);

COMMENT ON TABLE score_categories IS 'Hạng mục tiêu chí điểm thi đua (+/-)';

-- ============================================================
-- 12. COMPETITION CYCLES (Chu kỳ Thi đua)
-- ============================================================

CREATE TABLE competition_cycles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,               -- VD: "Tuần 12 — T4/2026"
  cycle_type      cycle_type NOT NULL,
  status          cycle_status NOT NULL DEFAULT 'ACTIVE',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  default_score   NUMERIC(6,1) NOT NULL DEFAULT 100, -- Điểm khởi đầu mỗi lớp
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id),
  CONSTRAINT no_cycle_overlap EXCLUDE USING gist (
    daterange(start_date, end_date, '[]') WITH &&
  ) WHERE (status = 'ACTIVE')                 -- Không cho tạo 2 chu kỳ ACTIVE trùng thời gian
);

COMMENT ON TABLE competition_cycles IS 'Chu kỳ thi đua (tuần/tháng/học kỳ)';

-- ============================================================
-- 13. SCORE RECORDS (Bản ghi Điểm)
-- ============================================================

CREATE TABLE score_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id        UUID NOT NULL REFERENCES competition_cycles(id),
  class_id        UUID NOT NULL REFERENCES classes(id),
  student_id      UUID REFERENCES students(id),       -- NULL = áp dụng cả lớp
  category_id     UUID NOT NULL REFERENCES score_categories(id),
  score_type      score_type NOT NULL,                -- Snapshot tại thời điểm ghi
  points          NUMERIC(5,1) NOT NULL,              -- Snapshot điểm tại thời điểm ghi
  note            TEXT,
  image_urls      TEXT[],                             -- Mảng Cloudinary URLs (tối đa 2)
  status          record_status NOT NULL DEFAULT 'CONFIRMED',

  -- Nguồn ghi nhận
  recorded_by     UUID NOT NULL REFERENCES profiles(id),
  recorded_by_role user_role NOT NULL,               -- Snapshot role tại thời điểm ghi
  timetable_slot_id UUID REFERENCES timetable_slots(id), -- NULL nếu Sao Đỏ ghi
  duty_schedule_id  UUID REFERENCES duty_schedules(id),  -- NULL nếu GV ghi

  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Audit trail khi Admin chỉnh sửa
  edited_by       UUID REFERENCES profiles(id),
  edited_at       TIMESTAMPTZ,
  original_points NUMERIC(5,1),                      -- Điểm gốc trước khi sửa
  original_note   TEXT,

  -- Soft delete
  removed_by      UUID REFERENCES profiles(id),
  removed_at      TIMESTAMPTZ,
  removal_reason  TEXT
);

COMMENT ON TABLE score_records IS 'Bản ghi điểm thi đua — bất biến sau khi nộp (chỉ Admin can thiệp)';

-- ============================================================
-- 14. CLASS CYCLE SCORES (Tổng điểm Lớp theo Chu kỳ)
-- ============================================================

CREATE TABLE class_cycle_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cycle_id        UUID NOT NULL REFERENCES competition_cycles(id),
  class_id        UUID NOT NULL REFERENCES classes(id),
  total_score     NUMERIC(8,1) NOT NULL DEFAULT 0,
  plus_total      NUMERIC(8,1) NOT NULL DEFAULT 0,
  minus_total     NUMERIC(8,1) NOT NULL DEFAULT 0,
  record_count    INTEGER NOT NULL DEFAULT 0,
  rank            SMALLINT,                    -- Thứ hạng (cập nhật khi đóng chu kỳ)
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cycle_id, class_id)
);

COMMENT ON TABLE class_cycle_scores IS 'Tổng hợp điểm của từng lớp trong mỗi chu kỳ';

-- ============================================================
-- 15. SCORE RECORD FLAGS (Yêu cầu Chỉnh sửa từ GVCN)
-- ============================================================

CREATE TABLE score_record_flags (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_id       UUID NOT NULL REFERENCES score_records(id),
  flagged_by      UUID NOT NULL REFERENCES profiles(id),   -- GVCN
  reason          TEXT NOT NULL,
  status          flag_status NOT NULL DEFAULT 'PENDING',
  resolved_by     UUID REFERENCES profiles(id),            -- Admin xử lý
  resolved_at     TIMESTAMPTZ,
  resolution_note TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE score_record_flags IS 'Yêu cầu xem lại bản ghi điểm từ Giáo viên chủ nhiệm';

-- ============================================================
-- 16. NOTIFICATIONS (Thông báo)
-- ============================================================

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id    UUID NOT NULL REFERENCES profiles(id),
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  related_id      UUID,                        -- ID liên quan (cycle_id, flag_id, record_id...)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Thông báo hệ thống gửi đến người dùng';

-- ============================================================
-- INDEXES — Tối ưu query thường dùng
-- ============================================================

-- Tra cứu bản ghi theo lớp + chu kỳ (query phổ biến nhất)
CREATE INDEX idx_score_records_cycle_class ON score_records(cycle_id, class_id);
-- Tra cứu bản ghi của 1 người ghi
CREATE INDEX idx_score_records_recorded_by ON score_records(recorded_by);
-- Tra cứu bản ghi theo trạng thái
CREATE INDEX idx_score_records_status ON score_records(status) WHERE status != 'CONFIRMED';
-- Tra cứu lịch sử bản ghi theo thời gian
CREATE INDEX idx_score_records_recorded_at ON score_records(recorded_at DESC);
-- Tra cứu tổng điểm lớp theo chu kỳ
CREATE INDEX idx_class_cycle_scores_cycle ON class_cycle_scores(cycle_id, total_score DESC);
-- Tra cứu lịch trực theo ngày
CREATE INDEX idx_duty_schedules_date ON duty_schedules(duty_date, status);
-- Tra cứu thông báo chưa đọc
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
-- Tra cứu học sinh theo lớp
CREATE INDEX idx_students_class ON students(class_id) WHERE is_deleted = FALSE;
-- Tra cứu thời khoá biểu theo GV
CREATE INDEX idx_timetable_teacher ON timetable_slots(teacher_id, day_of_week);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_classes_updated_at
  BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_red_star_members_updated_at
  BEFORE UPDATE ON red_star_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_duty_schedules_updated_at
  BEFORE UPDATE ON duty_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_score_categories_updated_at
  BEFORE UPDATE ON score_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tự động tạo / cập nhật class_cycle_scores sau mỗi bản ghi điểm
CREATE OR REPLACE FUNCTION sync_class_cycle_score()
RETURNS TRIGGER AS $$
DECLARE
  v_delta NUMERIC(8,1);
BEGIN
  -- Tính delta điểm
  IF TG_OP = 'INSERT' THEN
    v_delta := CASE WHEN NEW.score_type = 'PLUS' THEN NEW.points ELSE -NEW.points END;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Khi status chuyển sang REMOVED: trừ lại điểm cũ
    IF NEW.status = 'REMOVED' AND OLD.status != 'REMOVED' THEN
      v_delta := CASE WHEN OLD.score_type = 'PLUS' THEN -OLD.points ELSE OLD.points END;
    -- Khi chỉnh sửa điểm: tính chênh lệch
    ELSIF NEW.points != OLD.points AND NEW.status != 'REMOVED' THEN
      v_delta := (CASE WHEN NEW.score_type = 'PLUS' THEN NEW.points ELSE -NEW.points END)
               - (CASE WHEN OLD.score_type = 'PLUS' THEN OLD.points ELSE -OLD.points END);
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Upsert vào class_cycle_scores
  INSERT INTO class_cycle_scores (cycle_id, class_id, total_score, plus_total, minus_total, record_count)
  VALUES (
    COALESCE(NEW.cycle_id, OLD.cycle_id),
    COALESCE(NEW.class_id, OLD.class_id),
    v_delta,
    CASE WHEN COALESCE(NEW.score_type, OLD.score_type) = 'PLUS' THEN ABS(v_delta) ELSE 0 END,
    CASE WHEN COALESCE(NEW.score_type, OLD.score_type) = 'MINUS' THEN ABS(v_delta) ELSE 0 END,
    CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END
  )
  ON CONFLICT (cycle_id, class_id) DO UPDATE SET
    total_score  = class_cycle_scores.total_score  + v_delta,
    plus_total   = class_cycle_scores.plus_total   + CASE WHEN COALESCE(NEW.score_type, OLD.score_type) = 'PLUS' THEN ABS(v_delta) ELSE 0 END,
    minus_total  = class_cycle_scores.minus_total  + CASE WHEN COALESCE(NEW.score_type, OLD.score_type) = 'MINUS' THEN ABS(v_delta) ELSE 0 END,
    record_count = class_cycle_scores.record_count + CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE 0 END,
    updated_at   = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_score_on_insert
  AFTER INSERT ON score_records
  FOR EACH ROW EXECUTE FUNCTION sync_class_cycle_score();

CREATE TRIGGER trg_sync_score_on_update
  AFTER UPDATE ON score_records
  FOR EACH ROW EXECUTE FUNCTION sync_class_cycle_score();

-- Tự động tạo profile sau khi user đăng ký qua Supabase Auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Người dùng mới'),
    CASE NEW.raw_user_meta_data->>'role'
      WHEN 'ADMIN' THEN 'ADMIN'::user_role
      WHEN 'TEACHER' THEN 'TEACHER'::user_role
      WHEN 'TEACHER_SUBJECT' THEN 'TEACHER'::user_role
      WHEN 'TEACHER_HOMEROOM' THEN 'TEACHER'::user_role
      WHEN 'RED_STAR' THEN 'RED_STAR'::user_role
      ELSE 'RED_STAR'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE students                ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers                ENABLE ROW LEVEL SECURITY;
ALTER TABLE homeroom_assignments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_slots         ENABLE ROW LEVEL SECURITY;
ALTER TABLE red_star_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_schedules          ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_schedule_classes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE duty_shifts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_cycles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_records           ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_cycle_scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_record_flags      ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications           ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings         ENABLE ROW LEVEL SECURITY;

-- Helper function: lấy role của user hiện tại
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── PROFILES ──────────────────────────────────────────────
-- Xem: chính mình hoặc Admin
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR current_user_role() = 'ADMIN');

-- Tự cập nhật hồ sơ của mình
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admin toàn quyền
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ── CLASSES ───────────────────────────────────────────────
-- Tất cả đã đăng nhập đều đọc được
CREATE POLICY "classes_select_all" ON classes FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Chỉ Admin ghi
CREATE POLICY "classes_admin_write" ON classes FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ── STUDENTS ──────────────────────────────────────────────
CREATE POLICY "students_select_all" ON students FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_deleted = FALSE);

CREATE POLICY "students_admin_write" ON students FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ── SCORE CATEGORIES ──────────────────────────────────────
CREATE POLICY "score_categories_select_all" ON score_categories FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "score_categories_admin_write" ON score_categories FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ── COMPETITION CYCLES ────────────────────────────────────
CREATE POLICY "cycles_select_all" ON competition_cycles FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "cycles_admin_write" ON competition_cycles FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ── SCORE RECORDS ─────────────────────────────────────────
-- Admin xem tất cả
CREATE POLICY "records_admin_all" ON score_records FOR ALL
  USING (current_user_role() = 'ADMIN');

-- Giáo viên: xem bản ghi lớp mình làm GVCN (theo homeroom_assignments)
CREATE POLICY "records_homeroom_select" ON score_records FOR SELECT
  USING (
    current_user_role() = 'TEACHER' AND
    class_id IN (
      SELECT ha.class_id FROM homeroom_assignments ha
      WHERE ha.teacher_id = auth.uid()
    )
  );

-- Giáo viên: xem bản ghi mình tạo
CREATE POLICY "records_teacher_select_own" ON score_records FOR SELECT
  USING (
    current_user_role() = 'TEACHER' AND
    recorded_by = auth.uid()
  );

-- Giáo viên: tạo bản ghi (quyền GVCN vs tiết học xử lý ở tầng ứng dụng / TKB)
CREATE POLICY "records_teacher_insert" ON score_records FOR INSERT
  WITH CHECK (
    current_user_role() = 'TEACHER' AND
    recorded_by = auth.uid()
  );

-- Sao Đỏ: xem bản ghi mình tạo
CREATE POLICY "records_redstar_select_own" ON score_records FOR SELECT
  USING (
    current_user_role() = 'RED_STAR' AND
    recorded_by = auth.uid()
  );

-- Sao Đỏ: tạo bản ghi
CREATE POLICY "records_redstar_insert" ON score_records FOR INSERT
  WITH CHECK (
    current_user_role() = 'RED_STAR' AND
    recorded_by = auth.uid()
  );

-- ── CLASS CYCLE SCORES ────────────────────────────────────
CREATE POLICY "class_scores_select_all" ON class_cycle_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ── DUTY SCHEDULES ────────────────────────────────────────
-- Admin xem tất cả
CREATE POLICY "duty_admin_all" ON duty_schedules FOR ALL
  USING (current_user_role() = 'ADMIN');

-- Sao Đỏ: chỉ xem lịch của mình
CREATE POLICY "duty_redstar_select_own" ON duty_schedules FOR SELECT
  USING (
    current_user_role() = 'RED_STAR' AND
    red_star_id IN (
      SELECT id FROM red_star_members WHERE profile_id = auth.uid()
    )
  );

-- Sao Đỏ: cập nhật trạng thái ca của mình (started_at, ended_at, status)
CREATE POLICY "duty_redstar_update_own" ON duty_schedules FOR UPDATE
  USING (
    current_user_role() = 'RED_STAR' AND
    red_star_id IN (
      SELECT id FROM red_star_members WHERE profile_id = auth.uid()
    )
  );

-- ── SCORE RECORD FLAGS ────────────────────────────────────
-- Admin xem và xử lý tất cả
CREATE POLICY "flags_admin_all" ON score_record_flags FOR ALL
  USING (current_user_role() = 'ADMIN');

-- GVCN: flag chỉ hợp lệ khi bản ghi thuộc lớp mình chủ nhiệm
CREATE POLICY "flags_homeroom_select" ON score_record_flags FOR SELECT
  USING (
    current_user_role() = 'TEACHER' AND
    flagged_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM score_records sr
      INNER JOIN homeroom_assignments ha ON ha.class_id = sr.class_id AND ha.teacher_id = auth.uid()
      WHERE sr.id = record_id
    )
  );

CREATE POLICY "flags_homeroom_insert" ON score_record_flags FOR INSERT
  WITH CHECK (
    current_user_role() = 'TEACHER' AND
    flagged_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM score_records sr
      INNER JOIN homeroom_assignments ha ON ha.class_id = sr.class_id AND ha.teacher_id = auth.uid()
      WHERE sr.id = record_id
    )
  );

CREATE POLICY "flags_homeroom_delete_pending" ON score_record_flags FOR DELETE
  USING (
    current_user_role() = 'TEACHER' AND
    flagged_by = auth.uid() AND
    status = 'PENDING' AND
    EXISTS (
      SELECT 1 FROM score_records sr
      INNER JOIN homeroom_assignments ha ON ha.class_id = sr.class_id AND ha.teacher_id = auth.uid()
      WHERE sr.id = record_id
    )
  );

-- ── NOTIFICATIONS ─────────────────────────────────────────
CREATE POLICY "notif_select_own" ON notifications FOR SELECT
  USING (recipient_id = auth.uid());

CREATE POLICY "notif_update_own" ON notifications FOR UPDATE
  USING (recipient_id = auth.uid());

CREATE POLICY "notif_admin_insert" ON notifications FOR INSERT
  WITH CHECK (current_user_role() = 'ADMIN');

-- ── SYSTEM SETTINGS ───────────────────────────────────────
CREATE POLICY "settings_select_all" ON system_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "settings_admin_write" ON system_settings FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ── DUTY SHIFTS ───────────────────────────────────────────
CREATE POLICY "shifts_select_all" ON duty_shifts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "shifts_admin_write" ON duty_shifts FOR ALL
  USING (current_user_role() = 'ADMIN');

-- ============================================================
-- SEED DATA — Dữ liệu mẫu khởi tạo
-- ============================================================

-- Ca trực mặc định
INSERT INTO duty_shifts (name, display_name, start_time, end_time) VALUES
  ('MORNING',   'Ca Sáng',         '06:45', '07:15'),
  ('NOON',      'Ca Giữa Giờ',    '09:30', '09:50'),
  ('AFTERNOON', 'Ca Chiều',        '16:30', '17:00');

-- Cài đặt hệ thống mặc định
INSERT INTO system_settings (school_name, academic_year, semester1_start, semester1_end, semester2_start, semester2_end)
VALUES ('Trường THCS & THPT', '2025-2026', '2025-09-05', '2026-01-15', '2026-01-19', '2026-05-31');

-- Hạng mục điểm mẫu
-- (Cần có profile Admin trước khi insert created_by)
-- INSERT INTO score_categories (name, score_type, points, description) VALUES
--   ('Đồng phục đúng quy định',       'PLUS',  2,   'Mặc đúng đồng phục, gọn gàng'),
--   ('Giơ tay phát biểu tích cực',    'PLUS',  1,   'Tham gia xây dựng bài học'),
--   ('Đi học đúng giờ',               'PLUS',  1,   'Có mặt đúng giờ vào lớp'),
--   ('Đi học muộn',                   'MINUS', 2,   'Vào lớp sau giờ quy định'),
--   ('Không mang dụng cụ học tập',    'MINUS', 1,   'Thiếu sách vở, bút...'),
--   ('Sử dụng điện thoại trong lớp',  'MINUS', 3,   'Vi phạm nội quy điện thoại'),
--   ('Nói chuyện riêng trong giờ',    'MINUS', 1,   'Làm ảnh hưởng lớp học'),
--   ('Xả rác không đúng nơi quy định','MINUS', 2,   'Vi phạm vệ sinh môi trường');
