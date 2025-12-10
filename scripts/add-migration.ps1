#!/usr/bin/env pwsh
param(
    [Parameter(Mandatory=$true)]
    [string]$Name,
    [string]$ConnectionString
)

# 1. Lấy đường dẫn gốc dựa trên vị trí file script này
$scriptPath = $PSScriptRoot
$repoRoot = Split-Path $scriptPath -Parent

# 2. Đường dẫn project
$infraProj = Join-Path $repoRoot "server\TutorSupportSystem.Infrastructure\TutorSupportSystem.Infrastructure.csproj"
$apiProj = Join-Path $repoRoot "server\TutorSupportSystem.API\TutorSupportSystem.API.csproj"

$env:ASPNETCORE_ENVIRONMENT ??= "Development"

# 3. Kiểm tra công cụ
if (-not (Get-Command dotnet -ErrorAction SilentlyContinue)) {
    Write-Error "dotnet SDK is required."
    exit 1
}

$efAvailable = $true
try { dotnet ef --version *> $null } catch { $efAvailable = $false }
if (-not $efAvailable) {
    Write-Error "dotnet-ef CLI is required. Install with: dotnet tool install --global dotnet-ef"
    exit 1
}

# 4. Kiểm tra file tồn tại
if (-not (Test-Path $infraProj)) {
    Write-Error "Infrastructure project not found at: $infraProj"
    exit 1
}
if (-not (Test-Path $apiProj)) {
    Write-Error "API project not found at: $apiProj"
    exit 1
}

if ($ConnectionString) {
    $env:ConnectionStrings__DefaultConnection = $ConnectionString
}

Write-Host "Running migration '$Name'..." -ForegroundColor Cyan
Write-Host " Infra: $infraProj" -ForegroundColor Gray
Write-Host " API:   $apiProj" -ForegroundColor Gray

# 5. Chạy lệnh
dotnet ef migrations add $Name `
    --project $infraProj `
    --startup-project $apiProj `
    --output-dir "Data/Migrations"