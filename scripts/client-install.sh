#!/usr/bin/env bash
set -euo pipefail

# 1. Xác định vị trí thư mục gốc
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
CLIENT_DIR="$ROOT/client"

# 2. Kiểm tra thư mục client
if [ ! -d "$CLIENT_DIR" ]; then
    echo "Error: Client directory not found at $CLIENT_DIR" >&2
    exit 1
fi

echo "Installing client dependencies..."
# 3. Di chuyển vào thư mục client và chạy lệnh
cd "$CLIENT_DIR"
npm install