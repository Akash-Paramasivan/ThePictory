# The Pictory — Photography Business Website + Admin Portal

Public photography portfolio site with a protected admin portal for managing portfolio photos, offers, and contact form submissions.

## Stack
- `client/` — React + TypeScript + Vite + Tailwind CSS (public site + admin portal, single SPA)
- `server/ThePictory.Api/` — ASP.NET Core 9 Web API + EF Core + PostgreSQL
- Images: Cloudinary. Videos: YouTube embeds only. Email: Brevo HTTPS transactional email API (not SMTP — many PaaS hosts block/throttle outbound SMTP ports) for admin OTP + contact notifications.

## Prerequisites
- .NET 9 SDK
- Node.js 20+
- Docker Desktop (for local Postgres)

## First-time setup

### 1. Database (local dev)
```powershell
docker compose up -d
```
Starts Postgres on `localhost:5432` (see `docker-compose.yml` for credentials).

### 2. Backend (`server/ThePictory.Api`)
Secrets are kept out of source control via `dotnet user-secrets` (already initialized). Required secrets:
```powershell
cd server/ThePictory.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=thepictory;Username=thepictory;Password=thepictory_dev_password"
dotnet user-secrets set "Jwt:Secret" "<a long random string>"
dotnet user-secrets set "InitialAdmin:Username" "admin"
dotnet user-secrets set "InitialAdmin:Email" "you@example.com"
dotnet user-secrets set "InitialAdmin:Password" "<a strong password>"
dotnet user-secrets set "Email:ApiKey" "<brevo api key, from Settings > SMTP & API > API Keys tab>"
dotnet user-secrets set "Email:FromAddress" "no-reply@yourdomain.com"
dotnet user-secrets set "Email:AdminNotificationAddress" "you@example.com"
dotnet user-secrets set "Cloudinary:CloudName" "<cloud name>"
dotnet user-secrets set "Cloudinary:ApiKey" "<api key>"
dotnet user-secrets set "Cloudinary:ApiSecret" "<api secret>"
```
The `InitialAdmin:*` secrets are only used to seed the single admin account on first run (when the `AdminUsers` table is empty). Migrations apply automatically on startup.

Run the API:
```powershell
cd server/ThePictory.Api
dotnet run --urls http://localhost:5000
```

### 3. Frontend (`client`)
```powershell
cd client
copy .env.example .env   # set VITE_API_BASE_URL if different from the default
npm install
npm run dev
```
Public site: http://localhost:5173. Admin portal: http://localhost:5173/admin/login.

## Notes
- The admin OTP code and contact form notifications require a valid Brevo API key; without it, login/contact requests will fail at the email-send step (this is expected until configured). Brevo's HTTPS API is used instead of SMTP because platforms like Render's free tier block/throttle outbound SMTP ports.
- File uploads are restricted to JPEG/PNG/WEBP, max 10 MB, validated both client- and server-side.
- Rate limiting is applied to `/api/auth/*` and `/api/contact` to reduce brute-force/spam risk.

## Deployment (recommended low-cost path)

| Layer | Provider |
|---|---|
| Frontend (`client/`) | Cloudflare Pages (free, commercial use allowed) |
| API (`server/ThePictory.Api/`) | Render (Docker Web Service) |
| Database | Neon (managed Postgres, free tier) |
| Images | Cloudinary |
| Email | Brevo or SendGrid (SMTP) |

### API on Render
1. Push this repo to GitHub/GitLab.
2. Create a new **Web Service** on Render, pointing at `server/ThePictory.Api/Dockerfile` (root directory: `server/ThePictory.Api`).
3. Set environment variables (Render injects `PORT` automatically, the Dockerfile already respects it):
   - `ConnectionStrings__DefaultConnection` — Neon connection string
   - `Jwt__Secret`, `Jwt__Issuer`, `Jwt__Audience`
   - `InitialAdmin__Username`, `InitialAdmin__Email`, `InitialAdmin__Password` (remove after first successful deploy/seed)
   - `Email__SmtpHost`, `Email__SmtpPort`, `Email__SmtpUser`, `Email__SmtpPassword`, `Email__FromAddress`, `Email__AdminNotificationAddress`
   - `Cloudinary__CloudName`, `Cloudinary__ApiKey`, `Cloudinary__ApiSecret`
   - `Cors__AllowedOrigins__0` — your production frontend URL
4. Start on the free tier to validate, then switch to **Starter** ($7/mo) once live to avoid cold-start delays.

### Frontend on Cloudflare Pages
1. Connect the repo, set build directory to `client/`, build command `npm run build`, output directory `dist`.
2. Set env var `VITE_API_BASE_URL` to the Render API URL (e.g. `https://api.yourdomain.com`).
3. Attach your custom domain once purchased.

### Database on Neon
1. Create a project/database, copy the connection string into Render's `ConnectionStrings__DefaultConnection`.
2. Migrations apply automatically on API startup (`db.Database.MigrateAsync()` in `Program.cs`).

