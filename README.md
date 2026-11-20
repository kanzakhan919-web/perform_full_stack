# Perform360 — Next.js + MongoDB

Employee performance and appraisal system (academic project, sample data only).

The website and the API are one Next.js app. The API runs as Next.js route handlers, so the
whole project (frontend, backend and database connection) deploys to Vercel as-is.

```
Perform360_NextJS/
├── app/                     Next.js pages
├── app/api/[...path]/route.js  Every /api/... request → server/api.js
├── server/api.js            API logic (routes, validation, CSV export)
├── server/db.js             MongoDB connection (cached), applies schemas, numeric ids
├── server/schema.js         MongoDB schema ($jsonSchema validator) for every collection
├── server/seed.js           Sample data (added only when the database is empty)
├── components/
├── lib/
└── .env                     MONGODB_URI (not committed)
```

## Run locally

1. Create a `.env` file in the project folder:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
   MONGODB_DB=perform360
   ```
2. In MongoDB Atlas → **Network Access**, allow this computer's IP address.
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000

On Windows you can also double-click `start-windows.bat`.

Production build: `npm run build` then `npm start`.

## Deploy to Vercel

1. In MongoDB Atlas → **Network Access → Add IP Address → Allow access from anywhere**
   (`0.0.0.0/0`). Vercel's servers do not have fixed IP addresses.
2. On https://vercel.com → **Add New → Project** → import this GitHub repository.
   Framework preset: **Next.js** (detected automatically). Keep the default build settings.
3. Under **Environment Variables** add:
   - `MONGODB_URI` = your connection string (same as in `.env`)
   - `MONGODB_DB` = `perform360`
4. Click **Deploy**. When it finishes, open the site and check the header shows
   "Database connected", or visit `https://<your-site>.vercel.app/api/health`.

If you change an environment variable later, redeploy (Deployments → ⋯ → Redeploy).

## Website structure

| Path | Purpose |
|---|---|
| `app/layout.js` | Sidebar + header shared by every page |
| `app/page.js` | Dashboard (with department / period filters) |
| `app/<name>/page.js` | One page per menu item (employees, kpis, appraisals …) |
| `components/RecordForm.js` | Create / edit form used by all pages |
| `components/FilterBar.js`, `lib/useFilters.js` | Search and filters on list pages |
| `components/ui.js` | Small reusable pieces (cards, tables, bars, pills) |
| `lib/config.js` | Menu items, departments and form fields for each table |
| `lib/api.js`, `lib/useResource.js`, `lib/useCrud.js` | Data loading helpers |

## API

| Method | Path | Meaning |
|---|---|---|
| GET | `/api/health` | Backend and database connection status |
| GET | `/api/dashboard` | Summary numbers |
| GET | `/api/:table` | List records |
| POST | `/api/:table` | Create a record |
| PUT | `/api/:table/:id` | Update a record |
| DELETE | `/api/:table/:id` | Delete a record |
| GET | `/api/export/employees` | CSV report |

Tables: `employees`, `job_descriptions`, `kras`, `kpis`, `okrs`, `appraisals`, `feedback`, `training`.

## Environment variables

| Variable | Default | Meaning |
|---|---|---|
| `MONGODB_URI` | — (required) | MongoDB connection string |
| `MONGODB_DB` | `perform360` | Database name |

Special characters in the MongoDB password must be URL-encoded (for example `@` → `%40`).
If a `mongodb+srv://` string fails locally with `querySrv ECONNREFUSED`, use the standard
`mongodb://host1,host2,host3/?ssl=true&authSource=admin&replicaSet=...` form.
