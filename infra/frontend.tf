# S3 static website hosting - fits this app (no client-side routing to
# rewrite) and avoids CloudFront/ACM, which would need permissions we
# haven't confirmed this lab account grants.
#
# Content is synced separately via infra/deploy-frontend.sh, not by
# Terraform - Terraform's local-exec provisioner has quoting problems with
# Windows paths that contain spaces, and syncing file contents isn't really
# infrastructure provisioning anyway.

resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
    }]
  })
  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

locals {
  allowed_origins_with_frontend = join(
    ",",
    concat(split(",", var.allowed_origins), ["http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"])
  )
}

output "frontend_url" {
  description = "URL of the deployed frontend"
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
}
