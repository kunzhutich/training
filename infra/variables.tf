variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name prefix for created resources"
  type        = string
  default     = "bank-app"
}

variable "mongodb_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "mongodb_db_name" {
  description = "MongoDB database name"
  type        = string
  default     = "bank_app"
}

variable "jwt_secret_key" {
  description = "Secret key used to sign JWTs"
  type        = string
  sensitive   = true
}

variable "allowed_origins" {
  description = "Comma-separated list of origins allowed by CORS"
  type        = string
  default     = "http://localhost:5173,http://127.0.0.1:5173"
}

variable "lambda_exec_role_arn" {
  description = "ARN of the pre-existing IAM role Lambda should run as (this account doesn't allow creating or reading IAM roles)"
  type        = string
  default     = "arn:aws:iam::279249498881:role/quicklabs-fullstack-shared-lambda-exec"
}

variable "frontend_bucket_name" {
  description = "S3 bucket name for the frontend (must be globally unique across all AWS accounts)"
  type        = string
  default     = "bank-app-frontend-hw0827"
}
