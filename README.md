# The Pictory — Photography Business Website + Admin Portal

Public photography portfolio site with a protected admin portal for managing portfolio photos, offers, and contact form submissions.

## Stack
- `client/` — React + TypeScript + Vite + Tailwind CSS (public site + admin portal, single SPA)
- `server/ThePictory.Api/` — ASP.NET Core 9 Web API + EF Core + PostgreSQL
- Images: Cloudinary. Videos: YouTube embeds only. Email: SMTP (Brevo/SendGrid recommended) for admin OTP + contact notifications.

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
dotnet user-secrets set "Email:SmtpHost" "smtp-relay.brevo.com"
dotnet user-secrets set "Email:SmtpPort" "587"
dotnet user-secrets set "Email:SmtpUser" "<smtp username>"
dotnet user-secrets set "Email:SmtpPassword" "<smtp password>"
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
- The admin OTP code and contact form notifications require valid SMTP credentials; without them, login/contact requests will fail at the email-send step (this is expected until configured).
- File uploads are restricted to JPEG/PNG/WEBP, max 10 MB, validated both client- and server-side.
- Rate limiting is applied to `/api/auth/*` and `/api/contact` to reduce brute-force/spam risk.
