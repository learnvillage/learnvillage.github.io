-- ============================================================
-- LearnVillage：站內表單的資料表與權限
-- 用法：Supabase 專案 → 左側 SQL Editor → New query → 貼上整份 → Run
-- 可以重複執行（已存在的表不會被刪掉）。
--
-- 安全設計：
--   * 一般訪客（anon）只能「新增」資料，而且只能填指定欄位；
--     不能讀、不能改、不能刪，也不能自己設定 status / admin_note。
--   * 讀取與審核之後由「站長登入」的管理頁處理（第二步再加）。
--     在那之前，請在 Supabase 的 Table Editor 查看資料。
--   * 不收孩子的全名或學校：預約只收年級。
-- ============================================================

-- ---------- 1. 體驗課預約（家長填寫） ----------
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  course_id        text not null check (char_length(course_id) between 1 and 40),
  guardian_name    text not null check (char_length(guardian_name) between 1 and 40),
  contact_email    text check (contact_email is null or (char_length(contact_email) <= 120 and contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')),
  contact_line     text check (contact_line is null or char_length(contact_line) <= 60),
  student_grade    text not null check (char_length(student_grade) between 1 and 20),
  experience       text check (experience is null or char_length(experience) <= 200),
  preferred_slots  text not null check (char_length(preferred_slots) between 1 and 300),
  note             text check (note is null or char_length(note) <= 1000),
  guardian_consent boolean not null check (guardian_consent),
  status           text not null default 'new' check (status in ('new', 'contacted', 'scheduled', 'done', 'cancelled')),
  admin_note       text,
  -- Email 和 LINE 至少要留一個
  constraint bookings_contact_required check (coalesce(contact_email, '') <> '' or coalesce(contact_line, '') <> '')
);

-- ---------- 2. 教材投稿（創作者） ----------
create table if not exists public.material_submissions (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  author_name         text not null check (char_length(author_name) between 1 and 40),
  contact_email       text not null check (char_length(contact_email) <= 120 and contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  title               text not null check (char_length(title) between 1 and 80),
  category            text not null check (category in ('Scratch', 'Python', '程式邏輯', '其他')),
  level               text not null check (level in ('beginner', 'intermediate', 'advanced')),
  learning_goals      text not null check (char_length(learning_goals) between 1 and 1000),
  estimated_minutes   int  check (estimated_minutes is null or estimated_minutes between 1 and 180),
  link_url            text check (link_url is null or (char_length(link_url) <= 500 and link_url ~* '^https?://')),
  license_choice      text not null check (char_length(license_choice) between 1 and 80),
  originality_consent boolean not null check (originality_consent),
  note                text check (note is null or char_length(note) <= 1000),
  status              text not null default 'review' check (status in ('review', 'approved', 'rejected')),
  admin_note          text
);

-- ---------- 3. 教師申請 ----------
create table if not exists public.teacher_applications (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  display_name  text not null check (char_length(display_name) between 1 and 40),
  contact_email text not null check (char_length(contact_email) <= 120 and contact_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  specialties   text not null check (char_length(specialties) between 1 and 200),
  experience    text not null check (char_length(experience) between 1 and 1000),
  age_groups    text not null check (char_length(age_groups) between 1 and 100),
  bio           text not null check (char_length(bio) between 1 and 1000),
  consent       boolean not null check (consent),
  status        text not null default 'review' check (status in ('review', 'approved', 'rejected')),
  admin_note    text
);

-- ---------- 權限：RLS 一定開啟 ----------
alter table public.bookings             enable row level security;
alter table public.material_submissions enable row level security;
alter table public.teacher_applications enable row level security;

-- 先收回所有預設權限，再只開放「新增指定欄位」
revoke all on public.bookings, public.material_submissions, public.teacher_applications from anon, authenticated;

grant insert (course_id, guardian_name, contact_email, contact_line, student_grade,
              experience, preferred_slots, note, guardian_consent)
  on public.bookings to anon;

grant insert (author_name, contact_email, title, category, level, learning_goals,
              estimated_minutes, link_url, license_choice, originality_consent, note)
  on public.material_submissions to anon;

grant insert (display_name, contact_email, specialties, experience, age_groups, bio, consent)
  on public.teacher_applications to anon;

drop policy if exists "anon can submit" on public.bookings;
create policy "anon can submit" on public.bookings
  for insert to anon with check (true);

drop policy if exists "anon can submit" on public.material_submissions;
create policy "anon can submit" on public.material_submissions
  for insert to anon with check (true);

drop policy if exists "anon can submit" on public.teacher_applications;
create policy "anon can submit" on public.teacher_applications
  for insert to anon with check (true);

-- 沒有任何 select / update / delete 的 policy → 訪客完全讀不到資料。
