create table if not exists public.batches (
  id text primary key,
  batch_name text not null,
  program_type text not null,
  description text not null default '',
  start_date text not null,
  end_date text not null,
  quota text not null default '0',
  training_fee text not null default '',
  payment_instructions text not null default '',
  is_active text not null default 'false',
  fields_json text not null default '[]'
);

create table if not exists public.registrants (
  id text primary key,
  batch_id text not null references public.batches(id) on update cascade on delete restrict,
  batch_name text not null,
  program_type text not null,
  full_name text not null,
  whatsapp text not null,
  email text not null default '',
  registration_code text not null unique,
  portal_token text not null unique,
  status text not null default 'pending',
  answers_json text not null default '{}',
  notes text not null default '',
  feedback text not null default '',
  created_at text not null,
  notification_status text not null default 'pending'
);

create table if not exists public.payments (
  id text primary key,
  registrant_id text not null references public.registrants(id) on update cascade on delete restrict,
  registration_code text not null,
  full_name text not null,
  whatsapp text not null,
  amount_declared text not null,
  amount_approved text not null default '',
  receipt_url text not null default '',
  receipt_name text not null default '',
  status text not null default 'pending',
  rejection_reason text not null default '',
  created_at text not null,
  reviewed_at text not null default '',
  notification_status text not null default 'pending'
);

create table if not exists public.content (
  id text primary key,
  type text not null default '',
  title text not null default '',
  caption text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  sort_order text not null default '0',
  is_active text not null default 'true',
  extra text not null default ''
);

create index if not exists registrants_batch_id_idx on public.registrants(batch_id);
create index if not exists registrants_status_idx on public.registrants(status);
create index if not exists payments_registrant_id_idx on public.payments(registrant_id);
create index if not exists payments_status_idx on public.payments(status);
create index if not exists content_type_idx on public.content(type);

create table if not exists public.sheet_sync_outbox (
  id bigint generated always as identity primary key,
  entity text not null check (entity in ('batches', 'registrants', 'payments', 'content')),
  record_id text not null,
  operation text not null check (operation in ('INSERT', 'UPDATE', 'DELETE')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  claimed_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create index if not exists sheet_sync_outbox_pending_idx
  on public.sheet_sync_outbox(status, next_attempt_at, id);
create index if not exists sheet_sync_outbox_record_idx
  on public.sheet_sync_outbox(entity, record_id, id);

create or replace function public.enqueue_sheet_sync()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  row_data jsonb;
begin
  if current_setting('app.skip_sheet_sync', true) = 'true' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  insert into public.sheet_sync_outbox(entity, record_id, operation, payload)
  values (tg_table_name, row_data ->> 'id', tg_op, row_data);
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create or replace function public.import_sheet_records(p_table text, p_records jsonb)
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  update_columns text;
  affected integer;
begin
  if p_table not in ('batches', 'registrants', 'payments', 'content') then
    raise exception 'Unsupported import table: %', p_table;
  end if;
  if jsonb_typeof(p_records) is distinct from 'array' then
    raise exception 'Import records must be a JSON array';
  end if;

  select string_agg(format('%1$I = EXCLUDED.%1$I', column_name), ', ' order by ordinal_position)
  into update_columns
  from information_schema.columns
  where table_schema = 'public'
    and table_name = p_table
    and column_name <> 'id';
  if update_columns is null then
    raise exception 'No importable columns found for table: %', p_table;
  end if;

  perform set_config('app.skip_sheet_sync', 'true', true);
  execute format(
    'insert into public.%1$I select * from jsonb_populate_recordset(null::public.%1$I, $1) on conflict (id) do update set %2$s',
    p_table,
    update_columns
  ) using p_records;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

drop trigger if exists batches_sheet_sync on public.batches;
create trigger batches_sheet_sync after insert or update or delete on public.batches
for each row execute function public.enqueue_sheet_sync();

drop trigger if exists registrants_sheet_sync on public.registrants;
create trigger registrants_sheet_sync after insert or update or delete on public.registrants
for each row execute function public.enqueue_sheet_sync();

drop trigger if exists payments_sheet_sync on public.payments;
create trigger payments_sheet_sync after insert or update or delete on public.payments
for each row execute function public.enqueue_sheet_sync();

drop trigger if exists content_sheet_sync on public.content;
create trigger content_sheet_sync after insert or update or delete on public.content
for each row execute function public.enqueue_sheet_sync();

create or replace function public.claim_sheet_sync_jobs(p_limit integer default 20)
returns setof public.sheet_sync_outbox
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  with candidates as (
    select queued.id
    from public.sheet_sync_outbox as queued
    where (
      (queued.status = 'pending' and queued.next_attempt_at <= now())
      or (queued.status = 'processing' and queued.claimed_at < now() - interval '10 minutes')
    )
    and not exists (
      select 1
      from public.sheet_sync_outbox as earlier
      where earlier.entity = queued.entity
        and earlier.record_id = queued.record_id
        and earlier.id < queued.id
    )
    order by queued.id
    limit least(greatest(coalesce(p_limit, 20), 1), 100)
    for update skip locked
  )
  update public.sheet_sync_outbox as queued
  set status = 'processing',
      attempts = queued.attempts + 1,
      claimed_at = now()
  from candidates
  where queued.id = candidates.id
  returning queued.*;
end;
$$;

create or replace function public.complete_sheet_sync_job(p_job_id bigint)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.sheet_sync_outbox where id = p_job_id;
$$;

create or replace function public.retry_sheet_sync_job(p_job_id bigint, p_error text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.sheet_sync_outbox
  set status = 'pending',
      claimed_at = null,
      next_attempt_at = now() + make_interval(secs => least(3600, (15 * power(2, least(attempts - 1, 8)))::integer)),
      last_error = left(p_error, 1000)
  where id = p_job_id;
$$;

alter table public.batches enable row level security;
alter table public.registrants enable row level security;
alter table public.payments enable row level security;
alter table public.content enable row level security;
alter table public.sheet_sync_outbox enable row level security;

revoke all on public.batches, public.registrants, public.payments, public.content, public.sheet_sync_outbox
  from public, anon, authenticated;
grant all on public.batches, public.registrants, public.payments, public.content to service_role;
grant all on public.sheet_sync_outbox to service_role;
grant usage, select on sequence public.sheet_sync_outbox_id_seq to service_role;
revoke all on function public.enqueue_sheet_sync() from public, anon, authenticated;
revoke all on function public.import_sheet_records(text, jsonb) from public, anon, authenticated;
revoke all on function public.claim_sheet_sync_jobs(integer) from public, anon, authenticated;
revoke all on function public.complete_sheet_sync_job(bigint) from public, anon, authenticated;
revoke all on function public.retry_sheet_sync_job(bigint, text) from public, anon, authenticated;
grant execute on function public.enqueue_sheet_sync() to service_role;
grant execute on function public.import_sheet_records(text, jsonb) to service_role;
grant execute on function public.claim_sheet_sync_jobs(integer) to service_role;
grant execute on function public.complete_sheet_sync_job(bigint) to service_role;
grant execute on function public.retry_sheet_sync_job(bigint, text) to service_role;
