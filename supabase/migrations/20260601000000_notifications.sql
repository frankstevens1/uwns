create table if not exists public.notifications (
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

create index if not exists notifications_user_created_at_idx
on public.notifications (user_id, created_at desc);

create unique index if not exists notifications_user_unique_key_idx
on public.notifications (user_id, unique_key)
where unique_key is not null;

create table if not exists public.notification_preferences (
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

create table if not exists public.notification_push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null default 'native' check (platform in ('native')),
  device_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

create table if not exists public.notification_delivery_attempts (
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

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_push_tokens enable row level security;
alter table public.notification_delivery_attempts enable row level security;

revoke all on table public.notifications from anon, authenticated;
revoke all on table public.notification_preferences from anon, authenticated;
revoke all on table public.notification_push_tokens from anon, authenticated;
revoke all on table public.notification_delivery_attempts from anon, authenticated;

grant select, insert, update, delete on table public.notifications to service_role;
grant select, insert, update, delete on table public.notification_preferences to service_role;
grant select, insert, update, delete on table public.notification_push_tokens to service_role;
grant select, insert, update, delete on table public.notification_delivery_attempts to service_role;

drop policy if exists "Users can read their notifications" on public.notifications;
create policy "Users can read their notifications"
on public.notifications
for select
using (auth.uid() = user_id);

drop policy if exists "Users can read notification preferences" on public.notification_preferences;
create policy "Users can read notification preferences"
on public.notification_preferences
for select
using (auth.uid() = user_id);

alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.notification_preferences;
