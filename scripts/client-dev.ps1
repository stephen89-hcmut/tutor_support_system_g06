#!/usr/bin/env pwsh
$scriptPath = $PSScriptRoot
$repoRoot = Split-Path $scriptPath -Parent
$clientDir = Join-Path $repoRoot "client"

if (-not (Test-Path $clientDir)) {
    Write-Error "Client directory not found at: $clientDir"
    exit 1
}

Write-Host "Starting Client (Vite)..." -ForegroundColor Green
Set-Location $clientDir
npm run dev -- @args