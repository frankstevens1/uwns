-- UWNS demo bootstrap migration.
-- This is the full first-time setup for the current demo schema.

create table public.activity_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_name text not null,
  platform text not null check (platform in ('web', 'native')),
  metadata jsonb not null default '{}'::jsonb,
  unique_key text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index activity_events_user_occurred_at_idx
on public.activity_events (user_id, occurred_at desc);

create unique index activity_events_user_unique_key_idx
on public.activity_events (user_id, unique_key)
where unique_key is not null;

alter table public.activity_events enable row level security;

revoke all on table public.activity_events from anon, authenticated;
grant select, insert, update, delete on table public.activity_events to service_role;

create policy "Users can read their activity events"
on public.activity_events
for select
using ((select auth.uid()) = user_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_key text not null,
  type text not null,
  title text not null,
  body text not null,
  platform text check (platform in ('web', 'native')),
  href text,
  in_app_visible boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  unique_key text,
  source_activity_event_id uuid references public.activity_events(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_user_created_at_idx
on public.notifications (user_id, created_at desc);

create unique index notifications_user_unique_key_idx
on public.notifications (user_id, unique_key)
where unique_key is not null;

create index notifications_source_activity_event_id_idx
on public.notifications (source_activity_event_id);

alter table public.notifications enable row level security;

revoke all on table public.notifications from anon, authenticated;
grant select on table public.notifications to authenticated;
grant select, insert, update, delete on table public.notifications to service_role;

create policy "Users can read their notifications"
on public.notifications
for select
using ((select auth.uid()) = user_id);

create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_key text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default true,
  push_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, group_key)
);

alter table public.notification_preferences enable row level security;

revoke all on table public.notification_preferences from anon, authenticated;
grant select on table public.notification_preferences to authenticated;
grant select, insert, update, delete on table public.notification_preferences to service_role;

create policy "Users can read notification preferences"
on public.notification_preferences
for select
using ((select auth.uid()) = user_id);

create table public.notification_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null default 'native' check (platform in ('native')),
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table public.notification_push_tokens enable row level security;

revoke all on table public.notification_push_tokens from anon, authenticated;
grant select, insert, update, delete on table public.notification_push_tokens to service_role;

create policy "No client access to notification push tokens"
on public.notification_push_tokens
as restrictive
for all
using (false)
with check (false);

create table public.notification_delivery_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete set null,
  channel text not null check (channel in ('email', 'push')),
  status text not null check (status in ('sent', 'skipped', 'failed')),
  provider text not null,
  target text,
  response jsonb not null default '{}'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index notification_delivery_attempts_user_id_idx
on public.notification_delivery_attempts (user_id);

create index notification_delivery_attempts_notification_id_idx
on public.notification_delivery_attempts (notification_id);

alter table public.notification_delivery_attempts enable row level security;

revoke all on table public.notification_delivery_attempts from anon, authenticated;
grant select, insert, update, delete on table public.notification_delivery_attempts to service_role;

create policy "No client access to notification delivery attempts"
on public.notification_delivery_attempts
as restrictive
for all
using (false)
with check (false);

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.notification_preferences;

do $$
begin
  if exists (
    select 1
    from pg_extension
    where extname = 'pg_graphql'
  ) then
    execute 'drop extension pg_graphql';
  end if;
end;
$$;
