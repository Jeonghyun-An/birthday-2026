-- 은인 명부. Supabase 대시보드 > SQL Editor에서 한 번 실행한다.
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  message text check (message is null or char_length(message) <= 100),
  amount integer not null check (amount between 1000 and 1000000),
  confirmed boolean not null default false,
  created_at timestamptz not null default now()
);

-- 브라우저(anon/authenticated)는 접근 불가. 서버의 service role만 읽고 쓴다.
alter table public.contributions enable row level security;
revoke all on table public.contributions from anon, authenticated;
grant select, insert, update, delete on table public.contributions to service_role;

create index if not exists contributions_created_at_idx
  on public.contributions (created_at desc);
