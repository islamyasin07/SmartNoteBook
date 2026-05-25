# LensLedger Pro

LensLedger Pro is a cloud-ready Arabic RTL ledger app for a CCTV/security camera shop. It uses React, TypeScript, Vite, Tailwind CSS, Framer Motion, Supabase Auth, Supabase PostgreSQL, and Netlify.

## Features

- Arabic RTL dashboard and forms.
- Supabase email/password login.
- Shop-scoped records through `user_profiles -> shop_id`.
- Customers, products, sales, payments, and transaction history.
- Role-aware UI for admin, staff, and viewer.
- RLS-ready SQL schema for Supabase.
- Netlify deployment support.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run locally:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Supabase Setup

1. Create a new Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/rls-policies.sql`.
4. Optionally run `supabase/seed.sql` to create the first shop and sample records.
5. Create app users from the Supabase Auth dashboard.
6. Copy each user id from Auth and insert a matching row into `public.user_profiles` with the correct `shop_id` and `role`.

Important: the frontend uses only the anon key. Never expose the Supabase `service_role` key in the browser.

## Netlify Deployment

1. Push the project to GitHub.
2. Create a new Netlify site from the repository.
3. Set the build command to `npm run build`.
4. Set the publish directory to `dist`.
5. Add environment variables in the Netlify dashboard:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

6. Deploy.

The included `netlify.toml` already sets the build and SPA redirect rules.

## Data Model Notes

- Data belongs to the shop, not the individual user.
- Users resolve through `user_profiles`, and the app uses `shop_id` to scope queries.
- Staff can add and update business data.
- Admin can delete and export.
- Viewer is read-only.

## Limitations of This First Version

- Transaction creation is sequential on the client; a future Supabase RPC function would make it fully atomic.
- Transaction editing UI is minimal in this first version.
- Import/backup/statement printing are marked for later.
- Audit logs are defined in SQL but not fully instrumented by client actions yet.
