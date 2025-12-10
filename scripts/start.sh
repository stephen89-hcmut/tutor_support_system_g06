#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
API="$ROOT/server/TutorSupportSystem.API/TutorSupportSystem.API.csproj"

if [ ! -f "$API" ]; then
    echo "Error: API project not found at $API" >&2
    exit 1
fi

echo "Starting Application..."
dotnet run --project "$API" "$@"