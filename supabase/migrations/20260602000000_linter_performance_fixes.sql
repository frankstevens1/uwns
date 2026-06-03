create index if not exists notification_delivery_attempts_user_id_idx
on public.notification_delivery_attempts (user_id);

create index if not exists notification_delivery_attempts_notification_id_idx
on public.notification_delivery_attempts (notification_id);

create index if not exists notifications_source_activity_event_id_idx
on public.notifications (source_activity_event_id);

drop policy if exists "Users can read their activity events"
on public.activity_events;

create policy "Users can read their activity events"
on public.activity_events
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read their notifications"
on public.notifications;

create policy "Users can read their notifications"
on public.notifications
for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read notification preferences"
on public.notification_preferences;

create policy "Users can read notification preferences"
on public.notification_preferences
for select
using ((select auth.uid()) = user_id);
