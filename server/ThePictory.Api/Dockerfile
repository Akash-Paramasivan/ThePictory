# --- Build stage ---
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY ThePictory.Api.csproj ./
RUN dotnet restore ThePictory.Api.csproj

COPY . .
RUN dotnet publish ThePictory.Api.csproj -c Release -o /app/publish --no-restore

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Render (and similar PaaS) inject $PORT at runtime; fall back to 8080 for local docker run.
ENTRYPOINT ["/bin/sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet ThePictory.Api.dll"]
