#!/usr/bin/env bash
# Builds the frontend and syncs it to the S3 bucket Terraform created.
# Run this after `terraform apply` (first time) or after any frontend
# change (every time after).
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUCKET_NAME="${1:-bank-app-frontend-hw0827}"

echo "Building frontend..."
(cd "$ROOT_DIR/frontend" && npm run build)

echo "Syncing to s3://$BUCKET_NAME ..."
aws s3 sync "$ROOT_DIR/frontend/dist" "s3://$BUCKET_NAME" --delete

echo "Done. Site: http://$BUCKET_NAME.s3-website-us-east-1.amazonaws.com"
