# Curio

A minimalist, one-stop app for things you like and things you want to learn.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4. No router, no UI kit,
  no state library — just `fetch` and React state. Two tabs (Likes / Learn), a
  form to add items, inline edit/delete.
- **Backend**: ASP.NET Core (.NET 8) minimal API, no database. Each page is
  persisted as its own JSON file under `backend/Curio.Api/Data/` (`likes.json`,
  `learn.json`). This is meant to be a stepping stone — swap `JsonPageStore` for
  a real database or add auth in the same project later without changing the
  frontend's API contract.

## Project structure

```
frontend/   React + Vite + TS + Tailwind SPA
backend/    ASP.NET Core Web API (Curio.Api)
```

## Running locally

### Backend

Requires the [.NET 8 SDK](https://dotnet.microsoft.com/download).

```bash
cd backend/Curio.Api
dotnet run
```

Serves on `http://localhost:5080` by default (see `Properties/launchSettings.json`).

### Frontend

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev
```

Serves on `http://localhost:5173`. API calls to `/api/*` are proxied to the
backend (see `vite.config.ts`), so run both at once.

## API

Two pages are currently registered: `likes` and `learn`.

| Method | Path                         | Description          |
|--------|------------------------------|-----------------------|
| GET    | `/api/pages/{page}/items`    | List all items        |
| POST   | `/api/pages/{page}/items`    | Create an item         |
| PUT    | `/api/pages/{page}/items/{id}` | Update an item      |
| DELETE | `/api/pages/{page}/items/{id}` | Delete an item      |

`{page}` must be `likes` or `learn` — add new pages by extending the
`validPages` set in `Program.cs` and the `PAGES` array in `frontend/src/types.ts`.

## Deploying to Azure App Service

The plan is to merge the frontend build into the API project (serve the Vite
output as static files from `wwwroot`) so this ships as a single App Service
deployable — not done yet, still two apps today.

JSON storage stays as-is on App Service, with one required setting: App
Service's own content folder (`wwwroot`) can be mounted **read-only** in the
default Linux deploy mode, so the data directory must live outside it, on the
persistent `/home` share instead. Set this app setting before deploying:

| App setting     | Value (Linux)  | Value (Windows)     |
|------------------|----------------|----------------------|
| `DataDirectory`  | `/home/data`   | `D:\home\data`       |

`Program.cs` reads `DataDirectory` from configuration and falls back to the
local `Data/` folder when it's unset, so local dev needs no changes.

Also worth doing once deployed:
- Turn on **App Service Backup** (Basic tier+) — the JSON files are your only
  copy of the data, App Service doesn't back them up on its own.
- Keep the plan at a single instance (no autoscale) — the file lock in
  `JsonPageStore` only guards against concurrent writes within one process,
  not across multiple scaled-out instances.

## Notes

- JSON-file storage is intentional even with multiple users logging in — the
  per-user data footprint is small enough that a database isn't warranted yet.
  Revisit if that changes.
- Auth was intentionally left out of this first pass — the plan is to add it
  as a proper middle-tier concern in the .NET API (likely Microsoft Entra
  External ID) when needed, without changing how the frontend talks to it.
