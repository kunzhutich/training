import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import (
    account_controller,
    auth_controller,
    branch_controller,
    customer_controller,
    transaction_controller,
)
from app.exception_handlers import register_exception_handlers

app = FastAPI(title="Bank Management API", version="1.0.0")

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
_allowed_origins = os.getenv("ALLOWED_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth_controller.router)
app.include_router(customer_controller.router)
app.include_router(branch_controller.router)
app.include_router(account_controller.router)
app.include_router(transaction_controller.router)


@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}
