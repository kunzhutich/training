#!/usr/bin/env bash
# Builds infra/build/lambda_package.zip. Run from anywhere; paths are
# resolved relative to this script. Requires Python 3.11 + pip.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/infra/build"
PACKAGE_DIR="$BUILD_DIR/package"

echo "Cleaning previous build..."
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

echo "Installing dependencies for Lambda (manylinux2014_x86_64, cp311)..."
python -m pip install \
  --platform manylinux2014_x86_64 \
  --implementation cp \
  --python-version 3.11 \
  --only-binary=:all: \
  --target "$PACKAGE_DIR" \
  -r "$ROOT_DIR/infra/requirements-lambda.txt"

echo "Copying application code..."
cp -r "$ROOT_DIR/app" "$PACKAGE_DIR/app"
cp "$ROOT_DIR/lambda_handler.py" "$PACKAGE_DIR/lambda_handler.py"
find "$PACKAGE_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

echo "Zipping..."
python "$ROOT_DIR/infra/zip_package.py" "$PACKAGE_DIR" "$BUILD_DIR/lambda_package.zip"

echo "Done: infra/build/lambda_package.zip"
