#!/usr/bin/env bash
set -euo pipefail

# 1. Xác định thư mục gốc của Repo (Parent của thư mục scripts)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

# 2. Định nghĩa đường dẫn tuyệt đối đến project
# Lưu ý: Cấu trúc thư mục là root/server/...
INFRA="$ROOT/server/TutorSupportSystem.Infrastructure/TutorSupportSystem.Infrastructure.csproj"
API="$ROOT/server/TutorSupportSystem.API/TutorSupportSystem.API.csproj"

export ASPNETCORE_ENVIRONMENT="${ASPNETCORE_ENVIRONMENT:-Development}"

# 3. Kiểm tra các công cụ cần thiết
if ! command -v dotnet >/dev/null 2>&1; then
  echo "Error: dotnet SDK is required." >&2
  exit 1
fi

if ! dotnet ef --version >/dev/null 2>&1; then
  echo "Error: dotnet-ef CLI is required. Install with: dotnet tool install --global dotnet-ef" >&2
  exit 1
fi

# 4. Kiểm tra file project có tồn tại không
if [ ! -f "$INFRA" ]; then
    echo "Error: Infrastructure project not found at $INFRA" >&2
    exit 1
fi

if [ ! -f "$API" ]; then
    echo "Error: API project not found at $API" >&2
    exit 1
fi

NAME="${1:-}"
CONN="${2:-}"

if [ -z "$NAME" ]; then
  echo "Usage: $(basename "$0") <MigrationName> [connectionString]" >&2
  exit 1
fi

if [ -n "$CONN" ]; then
  export ConnectionStrings__DefaultConnection="$CONN"
fi

echo "Running migration '$NAME'..."
echo " Infra: $INFRA"
echo " API:   $API"

# 5. Chạy lệnh
dotnet ef migrations add "$NAME" \
    --project "$INFRA" \
    --startup-project "$API" \
    --output-dir "Data/Migrations" 
    # Lưu ý: output-dir tính từ thư mục Infrastructure. 
    # Thường code C# để namespace là Data.Migrations thì path nên là Data/Migrations