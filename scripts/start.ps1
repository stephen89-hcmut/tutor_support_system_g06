#!/usr/bin/env pwsh
$scriptPath = $PSScriptRoot
$repoRoot = Split-Path $scriptPath -Parent
$apiProj = Join-Path $repoRoot "server\TutorSupportSystem.API\TutorSupportSystem.API.csproj"

if (-not (Test-Path $apiProj)) {
    Write-Error "API project not found at: $apiProj"
    exit 1
}

Write-Host "Starting Application..." -ForegroundColor Cyan
dotnet run --project $apiProj @args