output "api_endpoint" {
  description = "Base URL of the deployed API"
  value       = aws_apigatewayv2_stage.default.invoke_url
}
