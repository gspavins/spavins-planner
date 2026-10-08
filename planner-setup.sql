-- ============================================================
-- Spavins Planner — database setup
-- Run ONCE in the Supabase SQL editor of the SAME project the
-- Spavins Calendar uses. Safe to run again (it checks first).
-- It only ADDS two new tables; the calendar's tables are untouched.
-- ============================================================

-- ---------- People the planner assigns lifts and tasks to ----------
-- Separate from the calendar's "people" list (Gav, Sue, ...) on purpose.
create table if not exists planner_people (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color_index int not null default 0,   -- which colour from the app's palette
  sort_order int not null default 0,
  created_at timestamptz default now()
);

insert into planner_people (name, color_index, sort_order) values
  ('Gavin', 0, 1),
  ('Viv',   1, 2),
  ('Ann',   2, 3),
  ('Lyn',   3, 4)
on conflict (name) do nothing;

-- ---------- Lifts and tasks ----------
create table if not exists planner_tasks (
  id uuid primary key default gen_random_uuid(),
  task_date date not null,
  start_time time,                              -- empty = "Any time"
  kind text not null default 'task' check (kind in ('lift', 'task')),
  title text not null,
  notes text,
  person_id uuid references planner_people(id) on delete set null,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists planner_tasks_date_idx on planner_tasks (task_date);

-- ---------- Row Level Security (same trusting-family model) ----------
alter table planner_people enable row level security;
alter table planner_tasks  enable row level security;

drop policy if exists "planner_people_select" on planner_people;
drop policy if exists "planner_people_insert" on planner_people;
drop policy if exists "planner_people_update" on planner_people;
drop policy if exists "planner_people_delete" on planner_people;
create policy "planner_people_select" on planner_people for select to authenticated using (true);
create policy "planner_people_insert" on planner_people for insert to authenticated with check (true);
create policy "planner_people_update" on planner_people for update to authenticated using (true);
create policy "planner_people_delete" on planner_people for delete to authenticated using (true);

drop policy if exists "planner_tasks_select" on planner_tasks;
drop policy if exists "planner_tasks_insert" on planner_tasks;
drop policy if exists "planner_tasks_update" on planner_tasks;
drop policy if exists "planner_tasks_delete" on planner_tasks;
create policy "planner_tasks_select" on planner_tasks for select to authenticated using (true);
create policy "planner_tasks_insert" on planner_tasks for insert to authenticated with check (true);
create policy "planner_tasks_update" on planner_tasks for update to authenticated using (true);
create policy "planner_tasks_delete" on planner_tasks for delete to authenticated using (true);

-- ---------- Live updates ----------
-- The planner listens to its own two tables plus the calendar's
-- events / event_people (already switched on by the calendar's scripts).
do $$
declare t text;
begin
  foreach t in array array['planner_people', 'planner_tasks', 'events', 'event_people'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
