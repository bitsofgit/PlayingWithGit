# Curio

A minimalist, one-stop app for things you like and things you want to learn.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS v4. No router, no UI kit,
  no state library — just `fetch` and React state. A home page with a tile per
  page; each tile opens either a JSON-backed list view or a fully custom page.
- **Backend**: ASP.NET Core (.NET 8) minimal API, no database. Each list page
  (Likes, Learn) is persisted as its own JSON file under `backend/Curio.Api/Data/`.
  This is meant to be a stepping stone — swap `JsonPageStore` for a real database
  or add auth in the same project later without changing the frontend's API contract.

## Pages

- **Likes** / **Learn** — JSON-backed lists (`PageConfig.kind === 'list'` in
  `frontend/src/types.ts`). Add a new one by adding an entry to `PAGES` and
  extending `validPages` in `Program.cs`.
- **Solar System** (`kind === 'custom'`) — a zoomable, live solar system view.
  Positions and orbital speeds are computed client-side via Kepler's equation
  from the standard published heliocentric orbital elements (valid 1800–2050,
  `frontend/src/solarSystem/elements.ts`) — no backend or external API call.
  Distance and size use independent compressed scales so the whole system fits
  on screen at once; see the in-app caption for the accuracy caveat. Custom
  pages like this one are wired up per page key in `App.tsx`.

## Project structure

```
frontend/   React + Vite + TS + Tailwind SPA
  src/solarSystem/   orbital mechanics (elements, Kepler solver, scales, zoom/pan)
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

## Deploying to Azure App Service (Windows)

This ships as a single deployable: `Program.cs` serves the built frontend
(`frontend/dist`, copied into `backend/Curio.Api/wwwroot`) as static files,
with the API mapped under `/api/*` and everything else falling back to
`index.html`. `.github/workflows/azure-deploy.yml` builds and deploys this
automatically on every push to `main`.

### 1. Create the Azure resources

Run these with the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
(`az login` first) — adjust names/region as you like, but keep them consistent
with what you use below:

```bash
az group create --name curio-rg --location eastus

# Windows App Service Plan — Basic B1 is enough for a small multi-user app
az appservice plan create \
  --name curio-plan \
  --resource-group curio-rg \
  --location eastus \
  --sku B1

# Windows Web App running the in-process .NET 8 runtime
az webapp create \
  --name curio-app \
  --resource-group curio-rg \
  --plan curio-plan \
  --runtime "dotnet:8"

# Point JSON storage at the persistent D:\home share, outside wwwroot
az webapp config appsettings set \
  --name curio-app \
  --resource-group curio-rg \
  --settings DataDirectory="D:\home\data"
```

`curio-app` must be a globally unique name — if it's taken, pick another and
update `AZURE_WEBAPP_NAME` in `.github/workflows/azure-deploy.yml` to match.
The exact `--runtime` string can shift between CLI versions — if it's
rejected, run `az webapp list-runtimes --os windows` to see what your CLI
currently accepts and swap it in.

### 2. Wire up GitHub Actions deploys

```bash
az webapp deployment list-publishing-profiles \
  --name curio-app \
  --resource-group curio-rg \
  --xml
```

Copy the XML output into a new GitHub Actions secret named
`AZURE_WEBAPP_PUBLISH_PROFILE` (repo Settings → Secrets and variables →
Actions). Once that's set, pushing to `main` builds the frontend, publishes
the API, and deploys both together.

### 3. Once deployed

- Turn on **App Service Backup** (Settings → Backups, Basic tier+) — the JSON
  files under `D:\home\data` are your only copy of the data, App Service
  doesn't back them up on its own.
- Keep the plan at a single instance (no autoscale) — the file lock in
  `JsonPageStore` only guards against concurrent writes within one process,
  not across multiple scaled-out instances.
- `DataDirectory` is read from configuration with a local `Data/` folder
  fallback, so nothing changes for local dev.

## Notes

- JSON-file storage is intentional even with multiple users logging in — the
  per-user data footprint is small enough that a database isn't warranted yet.
  Revisit if that changes.
- Auth was intentionally left out of this first pass — the plan is to add it
  as a proper middle-tier concern in the .NET API (likely Microsoft Entra
  External ID) when needed, without changing how the frontend talks to it.
