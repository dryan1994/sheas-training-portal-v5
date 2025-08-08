-- sql/schema.sql
create table if not exists public.managers (
  id bigserial primary key,
  user_id uuid not null unique,
  email text,
  display_name text,
  role text default 'manager' check (role in ('manager','creator')),
  seen_intro boolean default false,
  created_at timestamptz default now()
);
create table if not exists public.firefighters (
  id bigserial primary key,
  first_name text not null,
  last_name text not null,
  station text,
  rank text,
  email text unique,
  created_at timestamptz default now()
);
create table if not exists public.courses (
  id bigserial primary key,
  name text not null unique,
  priority int default 9999,
  type text,
  duration_days_default int,
  refresher_interval_years int,
  created_at timestamptz default now()
);
create table if not exists public.sessions (
  id bigserial primary key,
  course_id bigint references public.courses(id) on delete cascade,
  part_name text,
  start_date date,
  end_date date,
  location text,
  capacity int,
  created_at timestamptz default now()
);
create table if not exists public.enrolments (
  id bigserial primary key,
  firefighter_id bigint references public.firefighters(id) on delete cascade,
  session_id bigint references public.sessions(id) on delete cascade,
  status text default 'planned' check (status in ('planned','confirmed','completed','no-show','cancelled')),
  completed_at date,
  needs_refresher boolean default false,
  created_at timestamptz default now()
);
create or replace view public.firefighter_course_completion as
select f.id as firefighter_id,f.first_name,f.last_name,c.id as course_id,c.name as course_name,max(e.completed_at) as last_completed_at,bool_or(e.needs_refresher) as needs_refresher
from public.firefighters f
left join public.enrolments e on e.firefighter_id=f.id
left join public.sessions s on s.id=e.session_id
left join public.courses c on c.id=s.course_id
group by 1,2,3,4,5;
create or replace function public.count_refresher_by_course() returns table(course_name text, needs bigint) language sql security definer set search_path=public as $$
  select c.name as course_name,count(*)::bigint as needs
  from public.enrolments e join public.sessions s on s.id=e.session_id join public.courses c on c.id=s.course_id
  where e.needs_refresher is true group by c.name order by c.name;
$$;
alter table public.managers enable row level security;
alter table public.firefighters enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.enrolments enable row level security;
drop policy if exists "managers_self_access" on public.managers;
create policy "managers_self_access" on public.managers for select using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "ff_read_all" on public.firefighters;
create policy "ff_read_all" on public.firefighters for select using (auth.role()='authenticated');
drop policy if exists "ff_write_creator_only" on public.firefighters;
create policy "ff_write_creator_only" on public.firefighters for insert with check (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role='creator')) for update using (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role='creator')) for delete using (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role='creator'));
drop policy if exists "courses_read_all" on public.courses;
create policy "courses_read_all" on public.courses for select using (auth.role()='authenticated');
drop policy if exists "courses_write_creator_only" on public.courses;
create policy "courses_write_creator_only" on public.courses for insert with check (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role='creator')) for update using (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role='creator')) for delete using (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role='creator'));
drop policy if exists "sessions_read_all" on public.sessions;
create policy "sessions_read_all" on public.sessions for select using (auth.role()='authenticated');
drop policy if exists "sessions_write_managers" on public.sessions;
create policy "sessions_write_managers" on public.sessions for insert with check (auth.role()='authenticated') for update using (auth.role()='authenticated') for delete using (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role in ('creator')));
drop policy if exists "enrolments_read_all" on public.enrolments;
create policy "enrolments_read_all" on public.enrolments for select using (auth.role()='authenticated');
drop policy if exists "enrolments_write_managers" on public.enrolments;
create policy "enrolments_write_managers" on public.enrolments for insert with check (auth.role()='authenticated') for update using (auth.role()='authenticated') for delete using (exists (select 1 from public.managers m where m.user_id=auth.uid() and m.role in ('creator')));
create or replace function public.enrolments_after_ins_upd() returns trigger language plpgsql as $$
begin
  if NEW.status='completed' then NEW.needs_refresher := coalesce(NEW.needs_refresher,false); end if;
  return NEW;
end; $$;
drop trigger if exists trg_enrolments_after on public.enrolments;
create trigger trg_enrolments_after before insert or update on public.enrolments for each row execute function public.enrolments_after_ins_upd();