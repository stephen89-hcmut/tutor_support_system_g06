#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA="$ROOT/server/TutorSupportSystem.Infrastructure/TutorSupportSystem.Infrastructure.csproj"
API="$ROOT/server/TutorSupportSystem.API/TutorSupportSystem.API.csproj"

export ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Development}"

if ! command -v dotnet >/dev/null 2>&1; then
  echo "dotnet SDK is required." >&2
  exit 1
fi

if ! dotnet ef --version >/dev/null 2>&1; then
  echo "dotnet-ef CLI is required. Install with: dotnet tool install --global dotnet-ef" >&2
  exit 1
fi

ACTION="${1:-}"
NAME="${2:-}"
CONN="${3:-}"

case "$ACTION" in
  migrate)
    if [ -z "$NAME" ]; then
      echo "Migration name required. Usage: $(basename "$0") migrate <Name> [connectionString]" >&2
      exit 1
    fi
    if [ -n "$CONN" ]; then
      export ConnectionStrings__DefaultConnection="$CONN"
    fi
    dotnet ef migrations add "$NAME" --project "$INFRA" --startup-project "$API" --output-dir Database/Migrations
    ;;
  update)
    if [ -n "$CONN" ]; then
      export ConnectionStrings__DefaultConnection="$CONN"
      dotnet ef database update --project "$INFRA" --startup-project "$API" --connection "$CONN"
    else
      dotnet ef database update --project "$INFRA" --startup-project "$API"
    fi
    ;;
  restore)
    if [ -n "$CONN" ]; then
      export ConnectionStrings__DefaultConnection="$CONN"
      dotnet ef database drop --project "$INFRA" --startup-project "$API" --connection "$CONN" --force --yes
      dotnet ef database update --project "$INFRA" --startup-project "$API" --connection "$CONN"
    else
      dotnet ef database drop --project "$INFRA" --startup-project "$API" --force --yes
      dotnet ef database update --project "$INFRA" --startup-project "$API"
    fi
    ;;
  *)
    echo "Usage:" >&2
    echo "  $(basename "$0") migrate <Name> [connectionString]" >&2
    echo "  $(basename "$0") update [connectionString]" >&2
    echo "  $(basename "$0") restore [connectionString]" >&2
    exit 1
    ;;
 esac
