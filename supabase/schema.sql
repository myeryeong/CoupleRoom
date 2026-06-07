create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  avatar_type text not null default 'peach',
  couple_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique,
  user1_id uuid not null references auth.users(id) on delete cascade,
  user2_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint couples_two_people_check check (user2_id is null or user1_id <> user2_id)
);

alter table public.profiles
  drop constraint if exists profiles_couple_id_fkey,
  add constraint profiles_couple_id_fkey foreign key (couple_id) references public.couples(id) on delete set null;

create table if not exists public.room_presence (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  x numeric not null default 120,
  y numeric not null default 200,
  is_online boolean not null default true,
  last_seen timestamptz not null default now(),
  unique (couple_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  sender_nickname text not null default '익명',
  content text not null check (length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.messages
  add column if not exists sender_nickname text not null default '익명';

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

alter table public.interactions
  drop constraint if exists interactions_type_check,
  add constraint interactions_type_check check (type in ('hug', 'kiss', 'pat'));

create table if not exists public.room_furniture (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  type text not null check (type in ('sofa', 'table', 'plant', 'lamp', 'rug')),
  x numeric not null default 80,
  y numeric not null default 100,
  rotation numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  active_date date not null unique
);

create table if not exists public.daily_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.daily_questions(id) on delete cascade,
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answer text not null check (length(answer) between 1 and 1000),
  created_at timestamptz not null default now(),
  unique (question_id, couple_id, user_id)
);

create index if not exists profiles_couple_id_idx on public.profiles (couple_id);
create index if not exists room_presence_couple_id_idx on public.room_presence (couple_id);
create index if not exists messages_couple_created_idx on public.messages (couple_id, created_at desc);
create index if not exists idx_messages_couple_id_created_at on public.messages (couple_id, created_at);
create index if not exists interactions_couple_created_idx on public.interactions (couple_id, created_at desc);
create index if not exists room_furniture_couple_idx on public.room_furniture (couple_id);
create index if not exists daily_answers_couple_idx on public.daily_answers (couple_id, question_id);

do $$
begin
  alter publication supabase_realtime add table public.room_presence;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.interactions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.room_furniture;
exception when duplicate_object then null;
end $$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.room_presence enable row level security;
alter table public.messages enable row level security;
alter table public.interactions enable row level security;
alter table public.room_furniture enable row level security;
alter table public.daily_questions enable row level security;
alter table public.daily_answers enable row level security;

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.couples c
    where c.id = target_couple_id
      and auth.uid() in (c.user1_id, c.user2_id)
  );
$$;

create or replace function public.has_answered_question(target_question_id uuid, target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.daily_answers a
    where a.question_id = target_question_id
      and a.couple_id = target_couple_id
      and a.user_id = auth.uid()
  );
$$;

drop policy if exists "profiles read own or partner" on public.profiles;
create policy "profiles read own or partner"
on public.profiles for select
using (id = auth.uid() or public.is_couple_member(couple_id));

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
on public.profiles for insert
with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "couples read member or open invite" on public.couples;
create policy "couples read member or open invite"
on public.couples for select
using (auth.uid() in (user1_id, user2_id) or user2_id is null);

drop policy if exists "couples create own" on public.couples;
create policy "couples create own"
on public.couples for insert
with check (user1_id = auth.uid());

drop policy if exists "couples join open invite" on public.couples;
create policy "couples join open invite"
on public.couples for update
using (user2_id is null or auth.uid() in (user1_id, user2_id))
with check (auth.uid() in (user1_id, user2_id));

drop policy if exists "presence read couple" on public.room_presence;
create policy "presence read couple"
on public.room_presence for select
using (public.is_couple_member(couple_id));

drop policy if exists "presence upsert self" on public.room_presence;
create policy "presence upsert self"
on public.room_presence for all
using (user_id = auth.uid() and public.is_couple_member(couple_id))
with check (user_id = auth.uid() and public.is_couple_member(couple_id));

drop policy if exists "messages read couple" on public.messages;
create policy "messages read couple"
on public.messages for select
using (public.is_couple_member(couple_id));

drop policy if exists "messages insert self" on public.messages;
create policy "messages insert self"
on public.messages for insert
with check (sender_id = auth.uid() and public.is_couple_member(couple_id));

drop policy if exists "interactions read couple" on public.interactions;
create policy "interactions read couple"
on public.interactions for select
using (public.is_couple_member(couple_id));

drop policy if exists "interactions insert self" on public.interactions;
create policy "interactions insert self"
on public.interactions for insert
with check (sender_id = auth.uid() and public.is_couple_member(couple_id));

drop policy if exists "furniture read couple" on public.room_furniture;
create policy "furniture read couple"
on public.room_furniture for select
using (public.is_couple_member(couple_id));

drop policy if exists "furniture write couple" on public.room_furniture;
create policy "furniture write couple"
on public.room_furniture for all
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

drop policy if exists "questions read signed in" on public.daily_questions;
create policy "questions read signed in"
on public.daily_questions for select
using (auth.role() = 'authenticated');

drop policy if exists "answers read couple after own answer" on public.daily_answers;
create policy "answers read couple after own answer"
on public.daily_answers for select
using (
  public.is_couple_member(couple_id)
  and public.has_answered_question(question_id, couple_id)
);

drop policy if exists "answers insert own" on public.daily_answers;
create policy "answers insert own"
on public.daily_answers for insert
with check (user_id = auth.uid() and public.is_couple_member(couple_id));

drop policy if exists "answers update own" on public.daily_answers;
create policy "answers update own"
on public.daily_answers for update
using (user_id = auth.uid() and public.is_couple_member(couple_id))
with check (user_id = auth.uid() and public.is_couple_member(couple_id));

insert into public.daily_questions (question, active_date)
values
  ('오늘 서로에게 가장 고마웠던 순간은 언제였나요?', current_date),
  ('최근에 함께하고 싶었던 시간은 언제였나요?', current_date + interval '1 day'),
  ('요즘 나에게 바라는 작은 일이 있다면 무엇인가요?', current_date + interval '2 day')
on conflict (active_date) do nothing;

-- 개발 초기에 RLS가 막혀 디버깅이 어려우면 Supabase SQL Editor에서 아래처럼 임시로 끌 수 있습니다.
-- alter table public.messages disable row level security;
-- alter table public.room_presence disable row level security;
-- alter table public.room_furniture disable row level security;
-- 운영 전에는 반드시 다시 enable row level security를 적용하고 정책을 검토하세요.
