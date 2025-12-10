#!/usr/bin/env pwsh
$scriptPath = $PSScriptRoot
$repoRoot = Split-Path $scriptPath -Parent
$apiProj = Join-Path $repoRoot "server\TutorSupportSystem.API\TutorSupportSystem.API.csproj"

if (-not (Test-Path $apiProj)) {
    Write-Error "API project not found at: $apiProj"
    exit 1
}

Write-Host "Restoring dependencies..." -ForegroundColor Yellow
dotnet restore $apiProj

Write-Host "Building project..." -ForegroundColor Yellow
dotnet build $apiProj --no-restore @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build Succeeded!" -ForegroundColor Green
} else {
    Write-Host "Build Failed!" -ForegroundColor Red
}