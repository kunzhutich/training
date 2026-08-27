from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.models.exceptions import (
    AccountNotEmptyError,
    AccountNotFoundError,
    AuthenticationError,
    AuthorizationError,
    BankError,
    BranchNotFoundError,
    CustomerNotFoundError,
    DuplicateBranchCodeError,
    DuplicateUsernameError,
    InsufficientFundsError,
    InvalidAmountError,
)

_STATUS_BY_EXCEPTION = (
    (CustomerNotFoundError, status.HTTP_404_NOT_FOUND),
    (AccountNotFoundError, status.HTTP_404_NOT_FOUND),
    (BranchNotFoundError, status.HTTP_404_NOT_FOUND),
    (DuplicateUsernameError, status.HTTP_409_CONFLICT),
    (DuplicateBranchCodeError, status.HTTP_409_CONFLICT),
    (AuthenticationError, status.HTTP_401_UNAUTHORIZED),
    (AuthorizationError, status.HTTP_403_FORBIDDEN),
    (InvalidAmountError, status.HTTP_400_BAD_REQUEST),
    (InsufficientFundsError, status.HTTP_400_BAD_REQUEST),
    (AccountNotEmptyError, status.HTTP_400_BAD_REQUEST),
    (BankError, status.HTTP_400_BAD_REQUEST),
)


def register_exception_handlers(app: FastAPI) -> None:
    for exc_type, http_status in _STATUS_BY_EXCEPTION:

        def make_handler(status_code: int):
            def handler(request: Request, exc: BankError) -> JSONResponse:
                return JSONResponse(status_code=status_code, content={"detail": str(exc)})

            return handler

        app.add_exception_handler(exc_type, make_handler(http_status))
