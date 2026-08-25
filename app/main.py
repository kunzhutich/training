from fastapi import FastAPI

from app.controllers import account_controller, customer_controller, transaction_controller
from app.exception_handlers import register_exception_handlers

app = FastAPI(title="Bank Management API", version="1.0.0")

register_exception_handlers(app)

app.include_router(customer_controller.router)
app.include_router(account_controller.router)
app.include_router(transaction_controller.router)


@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}
