create extension if not exists vector;

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_key text unique not null,
  subscription_tier text default 'starter',
  created_at timestamptz default now()
);

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  face_vector vector(128) not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists attendance_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  employee_id uuid not null references employees (id) on delete cascade,
  timestamp timestamptz default now(),
  status text not null check (status in ('check_in', 'check_out'))
);

create or replace view attendance_feed_view as
select
  logs.id,
  logs.org_id,
  logs.timestamp,
  logs.status,
  employees.name as employee_name,
  (employees.metadata->>'department')::text as department
from attendance_logs logs
join employees on employees.id = logs.employee_id;

create or replace function match_employee_embedding(input_vector vector(128), org_id uuid)
returns table (employee_id uuid, name text, score double precision)
language sql stable
as $$
  select id, name, 1 - (face_vector <=> input_vector) as score
  from employees
  where org_id = match_employee_embedding.org_id
  order by face_vector <-> input_vector
  limit 3;
$$;

create or replace function attendance_trend_series(org_id uuid)
returns table (label text, percentage numeric)
language sql stable
as $$
  with daily as (
    select
      date_trunc('day', timestamp) as day,
      count(*) filter (where status = 'check_in') as check_ins,
      count(*) filter (
        where status = 'check_in'
          and employees.metadata ->> 'late' is distinct from 'true'
      ) as on_time
    from attendance_logs
    left join employees on employees.id = attendance_logs.employee_id
    where attendance_logs.org_id = attendance_trend_series.org_id
      and timestamp >= now() - interval '14 days'
    group by 1
    order by 1 asc
  )
  select to_char(day, 'Mon DD') as label,
         case when check_ins = 0 then 0 else round(on_time::numeric / check_ins * 100, 2) end as percentage
  from daily;
$$;

create or replace function peak_hour_heatmap(org_id uuid)
returns table (hour integer, count bigint)
language sql stable
as $$
  select extract(hour from timestamp)::integer as hour,
         count(*)
  from attendance_logs
  where org_id = peak_hour_heatmap.org_id
    and timestamp >= now() - interval '7 days'
  group by 1
  order by 1;
$$;

create or replace function late_comer_alerts(org_id uuid)
returns table (employee_name text, first_seen timestamptz, minutes_late integer)
language sql stable
as $$
  with first_checkins as (
    select
      employees.name,
      min(attendance_logs.timestamp) as first_seen
    from attendance_logs
    join employees on employees.id = attendance_logs.employee_id
    where attendance_logs.org_id = late_comer_alerts.org_id
      and attendance_logs.status = 'check_in'
      and attendance_logs.timestamp >= date_trunc('day', now())
    group by employees.name
  )
  select
    name as employee_name,
    first_seen,
    greatest(extract(epoch from first_seen - date_trunc('day', first_seen) - interval '9 hours') / 60, 0)::integer as minutes_late
  from first_checkins
  where extract(hour from first_seen) >= 9
  order by minutes_late desc
  limit 10;
$$;

create or replace view attendance_summary_view as
select
  org_id,
  count(*) filter (where status = 'check_in' and timestamp::date = current_date) as total_check_ins,
  coalesce(
    count(*) filter (where status = 'check_in' and timestamp::date = current_date and (employees.metadata->>'late') is distinct from 'true')
      ::numeric / nullif(count(*) filter (where status = 'check_in' and timestamp::date = current_date), 0),
    0
  ) as on_time_rate,
  (select count(*) from employees e where e.org_id = logs.org_id) as active_employees
from attendance_logs logs
join employees on employees.id = logs.employee_id
group by org_id;

create policy "tenant orgs" on organizations
  for select using (true);

create policy "tenant employees" on employees
  for all using (org_id = (auth.jwt() ->> 'organization_id')::uuid)
  with check (org_id = (auth.jwt() ->> 'organization_id')::uuid);

create policy "tenant logs" on attendance_logs
  for all using (org_id = (auth.jwt() ->> 'organization_id')::uuid)
  with check (org_id = (auth.jwt() ->> 'organization_id')::uuid);

alter table organizations enable row level security;
alter table employees enable row level security;
alter table attendance_logs enable row level security;
