# Moving fertilikey.org from the Arcustech VPS to Cloudflare

The site now runs as one Cloudflare Worker. Static files in `public/` are served as Worker assets. `src/index.js` answers `/api/institutions/` and `/api/search-log/` from a D1 database (SQLite), which replaces MySQL. Only `institutions` and `searchLog` move. The other MySQL tables (`conflict_log`, `programs_*`, `temp_*`) and the stored procedures are the data-prep pipeline, and the site never reads them.

## One-time setup

```bash
npm install
npm --prefix lib install
npx wrangler login
npx wrangler d1 create fertilikey
```

Paste the printed `database_id` into `wrangler.jsonc`.

## Move the data

1. Dump the two tables on the VPS. Use the production database name and user from the VPS `.env`.

   ```bash
   mysqldump --single-transaction --skip-triggers --no-tablespaces --default-character-set=utf8mb4 -u <user> -p <db_name> institutions searchLog > fertilikey-prod.sql
   ```

2. Copy it to `backup/fertilikey-prod.sql` locally (gitignored, since `searchLog` holds visitor IPs) and convert it:

   ```bash
   npm run db:convert -- backup/fertilikey-prod.sql --schema-out migrations/0001_initial.sql --data-out backup/fertilikey-prod.data.sql
   ```

   Read `migrations/0001_initial.sql` before applying it. It is generated from the live schema, so it should be committed.

3. Load it into D1:

   ```bash
   npx wrangler d1 migrations apply fertilikey --remote
   npx wrangler d1 execute fertilikey --remote --file backup/fertilikey-prod.data.sql
   npx wrangler d1 execute fertilikey --remote --file scripts/searchlog-eastern-to-utc.sql
   ```

   The last command moves the old `searchLog.date_created` values from the VPS's Eastern time to UTC, which is what D1 writes. Run it once per load.

   Use `--local` instead of `--remote` to load the same data for `npm run dev`.

## Deploy and test before cutover

```bash
npm run deploy
```

The Worker comes up on its `*.workers.dev` URL with no change to fertilikey.org. Search for a few institutions there and compare the result cards with the live site.

## Cutover

1. Take a fresh dump and convert it as above, then reload D1 so `searchLog` is current. Searches logged on the VPS after this dump are not carried over.

   ```bash
   npx wrangler d1 execute fertilikey --remote --command "DELETE FROM searchLog; DELETE FROM institutions"
   npx wrangler d1 execute fertilikey --remote --file backup/fertilikey-prod.data.sql
   npx wrangler d1 execute fertilikey --remote --file scripts/searchlog-eastern-to-utc.sql
   ```

2. In the Cloudflare dashboard, delete the `fertilikey.org` and `www` DNS records that point at the VPS. Cloudflare will not attach a Worker custom domain while those records exist.
3. Run `npm run deploy` with the `routes` block in `wrangler.jsonc`. The cutover was done on 2026-11-17. Since then `routes` is always on and the `workers.dev` address is off. Cloudflare creates the DNS records and certificates for both hostnames. The Worker redirects `www` and plain http to `https://fertilikey.org`, as `.htaccess` did.

Rollback: comment the routes out, deploy, and restore the old DNS records. The VPS is untouched until you shut it down.

## Refreshing institution data later

Build `institutions` in local MySQL as before, then replace the D1 copy:

```bash
mysqldump --skip-triggers --no-tablespaces --default-character-set=utf8mb4 -u root -p fertilikey institutions > backup/institutions.sql
npm run db:convert -- backup/institutions.sql --tables institutions --schema-out /dev/null --data-out backup/institutions.data.sql
npx wrangler d1 execute fertilikey --remote --command "DELETE FROM institutions"
npx wrangler d1 execute fertilikey --remote --file backup/institutions.data.sql
```

If the columns change, write a new migration in `migrations/` for the D1 table first.

## Analytics

Google Analytics now loads only when the page's host is `fertilikey.org`, which replaces the PHP `APP_ENV` check. `APP_ENV` is still a Worker variable (`production` in `wrangler.jsonc`, `development` in the gitignored `.dev.vars`) and sets `searchLog.is_debug`.
