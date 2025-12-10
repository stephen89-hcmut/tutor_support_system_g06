#!/usr/bin/env bash
set -euo pipefail

# 1. Xác định thư mục gốc (Parent của thư mục scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

# 2. Đường dẫn project
INFRA="$ROOT/server/TutorSupportSystem.Infrastructure/TutorSupportSystem.Infrastructure.csproj"
API="$ROOT/server/TutorSupportSystem.API/TutorSupportSystem.API.csproj"

export ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Development}"

# 3. Kiểm tra công cụ
if ! command -v dotnet >/dev/null 2>&1; then
  echo "Error: dotnet SDK is required." >&2
  exit 1
fi

if ! dotnet ef --version >/dev/null 2>&1; then
  echo "Error: dotnet-ef CLI is required. Install with: dotnet tool install --global dotnet-ef" >&2
  exit 1
fi

# 4. Kiểm tra file project tồn tại
if [ ! -f "$INFRA" ]; then
    echo "Error: Infrastructure project not found at $INFRA" >&2
    exit 1
fi

if [ ! -f "$API" ]; then
    echo "Error: API project not found at $API" >&2
    exit 1
fi

CONN="${1:-}"

echo "Updating database..."
echo " Infra: $INFRA"
echo " API:   $API"

# 5. Chạy lệnh update
if [ -n "$CONN" ]; then
  # Nếu có connection string truyền vào, ưu tiên dùng nó
  dotnet ef database update \
    --project "$INFRA" \
    --startup-project "$API" \
    --connection "$CONN"
else
  # Nếu không, dùng connection string trong appsettings.json của API
  dotnet ef database update \
    --project "$INFRA" \
    --startup-project "$API"
fi