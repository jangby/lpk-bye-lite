create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Store these two values in Supabase Vault before scheduling:
--   name: sheet_sync_url    value: https://YOUR-VERCEL-DOMAIN/api/sync-sheets
--   name: sheet_sync_secret value: the same random value as CRON_SECRET
-- Then run this schedule once from the Supabase SQL Editor.
select cron.schedule(
  'lpk-bye-sheet-mirror',
  '* * * * *',
  $job$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'sheet_sync_url' limit 1),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'sheet_sync_secret' limit 1)
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 10000
    );
  $job$
);
