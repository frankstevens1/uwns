drop policy if exists "No client access to notification push tokens"
on public.notification_push_tokens;

create policy "No client access to notification push tokens"
on public.notification_push_tokens
as restrictive
for all
using (false)
with check (false);

drop policy if exists "No client access to notification delivery attempts"
on public.notification_delivery_attempts;

create policy "No client access to notification delivery attempts"
on public.notification_delivery_attempts
as restrictive
for all
using (false)
with check (false);
