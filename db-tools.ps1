#!/usr/bin/env pwsh
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("migrate","update","restore")]
    [string]$Action,
    [string]$Name,
    [string]$ConnectionString
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraProj = Join-Path $root "server\TutorSupportSystem.Infrastructure\TutorSupportSystem.Infrastructure.csproj"
$apiProj = Join-Path $root "server\TutorSupportSystem.API\TutorSupportSystem.API.csproj"

$env:ASPNETCORE_ENVIRONMENT ??= "Development"

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

if ($ConnectionString) {
    $env:ConnectionStrings__DefaultConnection = $ConnectionString
}

switch ($Action) {
    "migrate" {
        if (-not $Name) { Write-Error "Provide a migration name."; exit 1 }
        dotnet ef migrations add $Name --project $infraProj --startup-project $apiProj --output-dir "Database/Migrations"
    }
    "update" {
        $args = @("database","update","--project",$infraProj,"--startup-project",$apiProj)
        if ($ConnectionString) { $args += @("--connection",$ConnectionString) }
        dotnet ef @args
    }
    "restore" {
        $dropArgs = @("database","drop","--force","--yes","--project",$infraProj,"--startup-project",$apiProj)
        if ($ConnectionString) { $dropArgs += @("--connection",$ConnectionString) }
        dotnet ef @dropArgs

        $updateArgs = @("database","update","--project",$infraProj,"--startup-project",$apiProj)
        if ($ConnectionString) { $updateArgs += @("--connection",$ConnectionString) }
        dotnet ef @updateArgs
    }
}
