# Tutor Support System

Monorepo layout:

- `client/` – Frontend (Vite + React + TypeScript)
- `server/` – Backend (ASP.NET Core, layered; currently Domain project and solution)
- `LICENSE`

## Frontend
See `client/README.md` for setup and scripts (npm/yarn). Default commands run inside `client`.

## Backend
See `server/README.md` (generated for Domain) and `TutorSupportSystem.sln` inside `server`. Add API/Infrastructure/Application projects under `server` alongside the existing Domain.

## Notes
- Root `.gitignore` remains for repo-level ignores; adjust as you add backend build outputs.
- Node modules were moved under `client/node_modules`.
