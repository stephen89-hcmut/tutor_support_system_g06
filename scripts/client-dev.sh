#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$ROOT/client"

if [ ! -d "$CLIENT_DIR" ]; then
    echo "Error: Client directory not found at $CLIENT_DIR" >&2
    exit 1
fi

echo "Starting Client (Vite)..."
cd "$CLIENT_DIR"
# "$@" để truyền thêm tham số nếu cần (ví dụ --port 3000)
npm run dev -- "$@"