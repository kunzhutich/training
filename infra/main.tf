terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# This lab account doesn't allow creating OR reading IAM roles - it provides
# one shared Lambda execution role instead, referenced directly by ARN
# (a data source lookup would need iam:GetRole, which is also denied).

# --- Lambda ---
# The zip is produced by infra/build.sh before `terraform apply`.
# Secrets aren't in Secrets Manager (not permitted in this account) - they're
# passed directly as Lambda environment variables via Terraform variables,
# which are themselves passed in via TF_VAR_* so they're never hardcoded here.

resource "aws_lambda_function" "api" {
  function_name    = "${var.project_name}-api"
  role             = var.lambda_exec_role_arn
  handler          = "lambda_handler.handler"
  runtime          = "python3.11"
  filename         = "${path.module}/build/lambda_package.zip"
  source_code_hash = filebase64sha256("${path.module}/build/lambda_package.zip")
  timeout          = 15
  memory_size      = 256

  environment {
    variables = {
      MONGODB_URI     = var.mongodb_uri
      MONGODB_DB_NAME = var.mongodb_db_name
      JWT_SECRET_KEY  = var.jwt_secret_key
      ALLOWED_ORIGINS = local.allowed_origins_with_frontend
    }
  }
}

# --- API Gateway (HTTP API - simpler/cheaper than REST API for a full proxy) ---

resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "default" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
