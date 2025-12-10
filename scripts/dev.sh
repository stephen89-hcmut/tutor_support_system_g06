#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
API="$ROOT/server/TutorSupportSystem.API/TutorSupportSystem.API.csproj"

if [ ! -f "$API" ]; then
    echo "Error: API project not found at $API" >&2
    exit 1
fi

echo "Starting Watch Mode (Hot Reload)..."
# "$@" cho phép bạn truyền thêm tham số (ví dụ: ./scripts/dev.sh --urls=http://localhost:5000)
dotnet watch --project "$API" "$@"