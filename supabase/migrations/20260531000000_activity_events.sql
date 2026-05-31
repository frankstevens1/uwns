create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  platform text not null check (platform in ('web', 'native')),
  metadata jsonb not null default '{}'::jsonb,
  unique_key text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_events_user_occurred_at_idx
on public.activity_events (user_id, occurred_at desc);

create unique index if not exists activity_events_user_unique_key_idx
on public.activity_events (user_id, unique_key)
where unique_key is not null;

alter table public.activity_events enable row level security;

revoke all on table public.activity_events from anon, authenticated;
grant select, insert, update, delete on table public.activity_events to service_role;

drop policy if exists "Users can read their activity events" on public.activity_events;
create policy "Users can read their activity events"
on public.activity_events
for select
using (auth.uid() = user_id);
