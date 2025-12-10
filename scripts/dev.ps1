#!/usr/bin/env pwsh
$scriptPath = $PSScriptRoot
$repoRoot = Split-Path $scriptPath -Parent
$apiProj = Join-Path $repoRoot "server\TutorSupportSystem.API\TutorSupportSystem.API.csproj"

if (-not (Test-Path $apiProj)) {
    Write-Error "API project not found at: $apiProj"
    exit 1
}

Write-Host "Starting Watch Mode (Hot Reload)..." -ForegroundColor Green
# @args cho phép truyền tham số nối tiếp
dotnet watch --project $apiProj @args