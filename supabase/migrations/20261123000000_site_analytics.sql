create table if not exists public.site_analytics_events (
  id text primary key,
  visitor_id text not null,
  session_id text not null,
  path text not null check (path in ('/', '/pendaftaran', '/peserta')),
  referrer_host text not null default 'direct',
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  created_at timestamptz not null default now()
);

create index if not exists site_analytics_created_at_idx
  on public.site_analytics_events(created_at);
create index if not exists site_analytics_visitor_created_at_idx
  on public.site_analytics_events(visitor_id, created_at);
create index if not exists site_analytics_session_created_at_idx
  on public.site_analytics_events(session_id, created_at);

alter table public.site_analytics_events enable row level security;
revoke all on public.site_analytics_events from public, anon, authenticated;
grant all on public.site_analytics_events to service_role;
