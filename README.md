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

## Notes

- This repo is scoped to a single user, so the JSON-file storage has no
  concurrent-user concerns beyond a simple in-process lock.
- Auth was intentionally left out of this first pass — the plan is to add it
  as a proper middle-tier concern in the .NET API when needed, without
  changing how the frontend talks to it.
