# Tutor Support System – Server (Backend)

This folder holds the server-side code for the Tutor Support System. It currently contains the Domain layer (`TutorSupportSystem.Domain`).

Recommended structure going forward:

```
root/
  client/   # Frontend (existing Vite app)
  server/   # Backend (ASP.NET Core solution)
```

Next steps to fully separate:
1. Move the ASP.NET solution from `backend/` to `server/` (or keep `backend/` if you prefer).
2. Move the existing Vite app into `client/`.
3. Update build/run scripts accordingly (e.g., `npm run dev` inside `client`, `dotnet run` inside `server`).

Current backend contents:
- `TutorSupportSystem.sln`
- `TutorSupportSystem.Domain` (Class Library)
  - Enums: `UserRole`, `MeetingStatus`, `MeetingMode`
  - Entities: `BaseEntity`, `User`, `StudentProfile`, `TutorProfile`, `Meeting`, `Participant`, `ProgressRecord`, `Feedback`
