#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
# Build toàn bộ Solution (cả API lẫn Infrastructure) nếu có file .sln
# Hoặc trỏ vào API nó sẽ tự build các project phụ thuộc
API="$ROOT/server/TutorSupportSystem.API/TutorSupportSystem.API.csproj"

if [ ! -f "$API" ]; then
    echo "Error: API project not found at $API" >&2
    exit 1
fi

echo "Restoring dependencies..."
dotnet restore "$API"

echo "Building project..."
dotnet build "$API" --no-restore "$@"