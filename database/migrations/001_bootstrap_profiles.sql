-- Chạy file này trong Supabase → SQL Editor nếu lỗi "relation profiles does not exist" khi tạo user.
-- Thứ tự: extension → enum → bảng → hàm + trigger (tự tạo dòng profiles khi có user mới).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'TEACHER', 'RED_STAR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Thông tin người dùng mở rộng từ Supabase Auth';

-- Cập nhật profile khi sửa user (khớp schema.sql)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Sau INSERT vào auth.users → tạo dòng profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
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
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS tối thiểu để app đọc được profile của chính mình
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- INSERT vào profiles do trigger SECURITY DEFINER thực hiện (không cần policy INSERT cho client).

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Sau khi chạy xong: tạo lại user trong Dashboard (hoặc dùng user đã có).
-- Cấp quyền admin (thay UUID bằng id từ auth.users / Table Editor):
--   UPDATE public.profiles SET role = 'ADMIN'::user_role WHERE id = '...';
-- Khi cần đủ RLS + bảng khác, chạy tiếp database/schema.sql (hoặc migration đầy đủ).
-- Nếu lỗi cú pháp trigger với EXECUTE FUNCTION, đổi thành EXECUTE PROCEDURE (Postgres cũ).
